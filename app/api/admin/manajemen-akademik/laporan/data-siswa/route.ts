import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  errorResponse,
  formatDateID,
  requireReportAccess,
  respondExcel,
  respondPdf,
  resolveTahunAjaran,
} from "@/lib/reports";
import type { ExcelColumn } from "@/lib/reports";

/**
 * GET /api/admin/manajemen-akademik/laporan/data-siswa
 *
 * Query params:
 *   - format  : "excel" (default) | "pdf"
 *   - tahunAjaranId : id tahun ajaran (opsional; default: tahun ajaran aktif)
 *   - rombelId      : BigInt rombel id (opsional)
 *   - status        : ApplicantStatus filter (default: "accepted" = siswa aktif)
 *   - gender        : "L" | "P" (opsional)
 */
export async function GET(request: NextRequest) {
  const access = await requireReportAccess();
  if (!access.ok) return access.response;

  const { searchParams } = new URL(request.url);
  const format = (searchParams.get("format") ?? "excel").toLowerCase();
  const tahunAjaranId = searchParams.get("tahunAjaranId");
  const rombelIdParam = searchParams.get("rombelId");
  const status = searchParams.get("status") ?? "accepted";
  const gender = searchParams.get("gender");

  const tahunAjaran = await resolveTahunAjaran(tahunAjaranId);
  if (!tahunAjaran) return errorResponse("Tahun ajaran tidak ditemukan", 404);

  const rombelId = rombelIdParam ? BigInt(rombelIdParam) : null;

  const siswaList = await prisma.pesertaDidik.findMany({
    where: {
      status: status as "pending" | "review" | "accepted" | "rejected",
      ...(gender ? { gender } : {}),
      ...(rombelId
        ? { rombels: { some: { id: rombelId, deleted_at: null } } }
        : { rombels: { some: { deleted_at: null } } }),
    },
    include: {
      program: { select: { name: true } },
      entryYear: { select: { label: true } },
      rombels: {
        where: { deleted_at: null },
        include: {
          class: { select: { name: true } },
          program: { select: { name: true } },
        },
      },
    },
    orderBy: [{ fullName: "asc" }],
  });

  const rows = siswaList.map((s, idx) => ({
    no: idx + 1,
    nisn: s.nisn ?? "",
    nik: s.nik,
    nama: s.fullName,
    jenisKelamin: s.gender === "L" ? "Laki-laki" : s.gender === "P" ? "Perempuan" : "",
    tempatLahir: s.placeOfBirth ?? "",
    tanggalLahir: formatDateID(s.dateOfBirth),
    rombel: s.rombels[0]?.name ?? "-",
    kelas: s.rombels[0]?.class?.name ?? "-",
    program: s.rombels[0]?.program?.name ?? s.program?.name ?? "-",
    tahunAjaran: s.entryYear?.label ?? tahunAjaran.label,
    alamat: s.address ?? "",
    noTelp: s.phone ?? s.mobile ?? "",
  }));

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `data-siswa-aktif-${timestamp}`;

  if (format === "pdf") {
    return respondPdf(
      {
        title: "Data Siswa Aktif",
        subtitle: `Tahun Ajaran ${tahunAjaran.label} • ${rows.length} siswa`,
        columns: [
          { header: "No", get: (r) => String(r.no), width: 28 },
          { header: "NISN", get: (r) => String(r.nisn), width: 70 },
          { header: "Nama Lengkap", get: (r) => String(r.nama), width: 160 },
          { header: "L/P", get: (r) => String(r.jenisKelamin === "Laki-laki" ? "L" : r.jenisKelamin === "Perempuan" ? "P" : "-"), width: 24 },
          { header: "Tgl Lahir", get: (r) => String(r.tanggalLahir), width: 70 },
          { header: "Rombel", get: (r) => String(r.rombel), width: 90 },
          { header: "Program", get: (r) => String(r.program), width: 90 },
        ],
        rows,
      },
      { title: "Data Siswa Aktif", subtitle: `TA ${tahunAjaran.label}`, landscape: true },
      `${filename}.pdf`
    );
  }

  // Default: Excel
  const columns: ExcelColumn[] = [
    { header: "No", key: "no", width: 6 },
    { header: "NISN", key: "nisn", width: 16 },
    { header: "NIK", key: "nik", width: 18 },
    { header: "Nama Lengkap", key: "nama", width: 32 },
    { header: "Jenis Kelamin", key: "jenisKelamin", width: 14 },
    { header: "Tempat Lahir", key: "tempatLahir", width: 18 },
    { header: "Tanggal Lahir", key: "tanggalLahir", width: 14 },
    { header: "Rombel", key: "rombel", width: 16 },
    { header: "Kelas", key: "kelas", width: 10 },
    { header: "Program", key: "program", width: 20 },
    { header: "Tahun Ajaran", key: "tahunAjaran", width: 14 },
    { header: "Alamat", key: "alamat", width: 30 },
    { header: "No. Telp", key: "noTelp", width: 16 },
  ];

  return respondExcel("Data Siswa Aktif", columns, rows, `${filename}.xlsx`);
}
