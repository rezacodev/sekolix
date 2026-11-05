import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, requireReportAccess, respondExcel, resolveTahunAjaran } from "@/lib/reports";
import type { ExcelColumn } from "@/lib/reports";

export async function GET(request: NextRequest) {
  const access = await requireReportAccess();
  if (!access.ok) return access.response;

  const { searchParams } = new URL(request.url);
  const tahunAjaranId = searchParams.get("tahunAjaranId");

  const tahunAjaran = await resolveTahunAjaran(tahunAjaranId);
  if (!tahunAjaran) return errorResponse("Tahun ajaran tidak ditemukan", 404);

  const rombels = await prisma.rombel.findMany({
    where: { deleted_at: null, tahunAjaranId: tahunAjaran.id },
    include: {
      class: { select: { name: true } },
      program: { select: { name: true } },
    },
    orderBy: [{ class: { name: "asc" } }, { name: "asc" }],
  });

  // Count students per rombel
  const studentCounts = await prisma.pesertaDidik.groupBy({
    by: ["gender"],
    where: {
      status: "accepted",
      rombels: { some: { tahunAjaranId: tahunAjaran.id, deleted_at: null } },
    },
    _count: { _all: true },
  });

  const totalLaki = studentCounts.find((c) => c.gender === "L")?._count._all ?? 0;
  const totalPerempuan = studentCounts.find((c) => c.gender === "P")?._count._all ?? 0;

  const rows = rombels.map((r, idx) => ({
    no: idx + 1,
    rombel: r.name,
    kelas: r.class.name,
    program: r.program?.name ?? "-",
    total: r.student_count,
    kapasitas: r.capacity ?? 0,
    persentase: r.capacity ? Math.round((r.student_count / r.capacity) * 100) : 0,
  }));

  const timestamp = new Date().toISOString().slice(0, 10);
  const columns: ExcelColumn[] = [
    { header: "No", key: "no", width: 6 },
    { header: "Rombel", key: "rombel", width: 18 },
    { header: "Kelas", key: "kelas", width: 10 },
    { header: "Program", key: "program", width: 22 },
    { header: "Jumlah Siswa", key: "total", width: 14 },
    { header: "Kapasitas", key: "kapasitas", width: 12 },
    { header: "% Kapasitas", key: "persentase", width: 14 },
  ];

  // Add summary rows at end
  rows.push({
    no: 0,
    rombel: "TOTAL LAKI-LAKI",
    kelas: "",
    program: "",
    total: totalLaki,
    kapasitas: 0,
    persentase: 0,
  });
  rows.push({
    no: 0,
    rombel: "TOTAL PEREMPUAN",
    kelas: "",
    program: "",
    total: totalPerempuan,
    kapasitas: 0,
    persentase: 0,
  });

  return respondExcel(
    "Distribusi Siswa",
    columns,
    rows,
    `distribusi-siswa-${timestamp}.xlsx`
  );
}
