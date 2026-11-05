import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  errorResponse,
  formatDateID,
  requireReportAccess,
  respondExcel,
  respondPdf,
} from "@/lib/reports";
import type { ExcelColumn } from "@/lib/reports";

/**
 * GET /api/admin/manajemen-akademik/laporan/data-guru
 *
 * Query params:
 *   - format : "excel" (default) | "pdf"
 *   - role   : StaffRole filter (TEACHER | STAFF | OTHER) — default: all active
 *   - statusKepegawaian : PNS | Non-PNS (opsional)
 *   - gender : L | P (opsional)
 */
export async function GET(request: NextRequest) {
  const access = await requireReportAccess();
  if (!access.ok) return access.response;

  const { searchParams } = new URL(request.url);
  const format = (searchParams.get("format") ?? "excel").toLowerCase();
  const role = searchParams.get("role") as "TEACHER" | "STAFF" | "OTHER" | null;
  const statusKepegawaian = searchParams.get("statusKepegawaian");
  const gender = searchParams.get("gender");

  const staffList = await prisma.staff.findMany({
    where: {
      isActive: true,
      isVisible: true,
      ...(role ? { role } : {}),
      ...(statusKepegawaian ? { statusKepegawaian } : {}),
      ...(gender ? { gender } : {}),
    },
    include: {
      teacherSubjects: {
        where: { deleted_at: null },
        include: {
          subject: { select: { name: true } },
          rombel: { select: { name: true } },
        },
      },
    },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  const rows = staffList.map((s, idx) => ({
    no: idx + 1,
    nip: s.nip ?? "",
    nama: s.name,
    jenisKelamin: s.gender === "L" ? "Laki-laki" : s.gender === "P" ? "Perempuan" : "",
    tempatLahir: s.placeOfBirth ?? "",
    tanggalLahir: formatDateID(s.dateOfBirth),
    jabatan: s.position ?? "",
    role: s.role,
    statusKepegawaian: s.statusKepegawaian ?? "",
    pendidikan: s.academicDegree ?? "",
    mapelAmpu: s.teacherSubjects.map((ts) => ts.subject.name).filter(Boolean).join("; "),
    email: s.email ?? "",
    noTelp: s.phone ?? "",
  }));

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `data-guru-gtk-${timestamp}`;

  // Stats for ratio
  const teacherCount = staffList.filter((s) => s.role === "TEACHER").length;
  const studentCount = await prisma.pesertaDidik.count({
    where: { status: "accepted" },
  });
  const ratio = teacherCount > 0 ? Math.round(studentCount / teacherCount) : 0;

  if (format === "pdf") {
    return respondPdf(
      {
        title: "Data Guru & Tenaga Kependidikan",
        subtitle: `Total ${staffList.length} GTK • ${teacherCount} guru • Rasio guru:siswa 1:${ratio}`,
        columns: [
          { header: "No", get: (r) => String(r.no), width: 28 },
          { header: "NIP", get: (r) => String(r.nip), width: 70 },
          { header: "Nama", get: (r) => String(r.nama), width: 150 },
          { header: "L/P", get: (r) => String(r.jenisKelamin === "Laki-laki" ? "L" : r.jenisKelamin === "Perempuan" ? "P" : "-"), width: 24 },
          { header: "Jabatan", get: (r) => String(r.jabatan), width: 100 },
          { header: "Status", get: (r) => String(r.statusKepegawaian), width: 60 },
          { header: "Pendidikan", get: (r) => String(r.pendidikan), width: 70 },
        ],
        rows,
      },
      { title: "Data GTK", subtitle: `Rasio guru:siswa 1:${ratio}`, landscape: true },
      `${filename}.pdf`
    );
  }

  const columns: ExcelColumn[] = [
    { header: "No", key: "no", width: 6 },
    { header: "NIP", key: "nip", width: 18 },
    { header: "Nama Lengkap", key: "nama", width: 30 },
    { header: "L/P", key: "jenisKelamin", width: 12 },
    { header: "Tempat Lahir", key: "tempatLahir", width: 18 },
    { header: "Tanggal Lahir", key: "tanggalLahir", width: 14 },
    { header: "Jabatan", key: "jabatan", width: 22 },
    { header: "Role", key: "role", width: 12 },
    { header: "Status Kepegawaian", key: "statusKepegawaian", width: 18 },
    { header: "Pendidikan", key: "pendidikan", width: 16 },
    { header: "Mata Pelajaran", key: "mapelAmpu", width: 36 },
    { header: "Email", key: "email", width: 24 },
    { header: "No. Telp", key: "noTelp", width: 16 },
  ];

  return respondExcel("Data GTK", columns, rows, `${filename}.xlsx`);
}
