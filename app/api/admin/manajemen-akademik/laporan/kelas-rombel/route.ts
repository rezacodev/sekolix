import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  errorResponse,
  requireReportAccess,
  respondExcel,
  resolveTahunAjaran,
} from "@/lib/reports";
import type { ExcelColumn } from "@/lib/reports";

/**
 * GET /api/admin/manajemen-akademik/laporan/kelas-rombel
 *
 * Query params:
 *   - format : "excel" (default) | "pdf"
 *   - tahunAjaranId : id tahun ajaran (default: aktif)
 */
export async function GET(request: NextRequest) {
  const access = await requireReportAccess();
  if (!access.ok) return access.response;

  const { searchParams } = new URL(request.url);
  const format = (searchParams.get("format") ?? "excel").toLowerCase();
  const tahunAjaranId = searchParams.get("tahunAjaranId");

  const tahunAjaran = await resolveTahunAjaran(tahunAjaranId);
  if (!tahunAjaran) return errorResponse("Tahun ajaran tidak ditemukan", 404);

  const rombels = await prisma.rombel.findMany({
    where: {
      deleted_at: null,
      tahunAjaranId: tahunAjaran.id,
    },
    include: {
      class: { select: { name: true } },
      program: { select: { name: true } },
    },
    orderBy: [{ class: { name: "asc" } }, { name: "asc" }],
  });

  const rows = rombels.map((r, idx) => ({
    no: idx + 1,
    rombel: r.name,
    kelas: r.class.name,
    program: r.program?.name ?? "-",
    kapasitas: r.capacity ?? 0,
    jumlahSiswa: r.student_count,
    waliKelas: "-", // Field homeroom_teacher_id belum tersedia di Class
    nip: "",
  }));

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `kelas-rombel-${timestamp}`;

  const columns: ExcelColumn[] = [
    { header: "No", key: "no", width: 6 },
    { header: "Rombel", key: "rombel", width: 18 },
    { header: "Kelas", key: "kelas", width: 10 },
    { header: "Program", key: "program", width: 22 },
    { header: "Kapasitas", key: "kapasitas", width: 12 },
    { header: "Jumlah Siswa", key: "jumlahSiswa", width: 14 },
    { header: "Wali Kelas", key: "waliKelas", width: 28 },
    { header: "NIP", key: "nip", width: 18 },
  ];

  return respondExcel("Kelas & Rombel", columns, rows, `${filename}.xlsx`);
}
