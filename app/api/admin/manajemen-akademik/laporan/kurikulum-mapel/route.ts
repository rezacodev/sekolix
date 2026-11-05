import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, requireReportAccess, respondExcel } from "@/lib/reports";
import type { ExcelColumn } from "@/lib/reports";

export async function GET(_request: NextRequest) {
  const access = await requireReportAccess();
  if (!access.ok) return access.response;

  const subjects = await prisma.subject.findMany({
    where: { deleted_at: null },
    include: {
      curriculums: {
        where: { deleted_at: null },
        include: {
          curriculum: { select: { name: true } },
        },
      },
      _count: { select: { teacherSubjects: true } },
    },
    orderBy: [{ name: "asc" }],
  });

  const rows = subjects.map((s, idx) => {
    const firstCurr = s.curriculums[0]?.curriculum;
    return {
      no: idx + 1,
      kode: s.code ?? "",
      nama: s.name,
      kurikulum: firstCurr?.name ?? "-",
      tingkat: "-",
      jenis: s.is_practice ? "Praktik" : "Teori",
      guruPengampu: s._count.teacherSubjects,
    };
  });

  const timestamp = new Date().toISOString().slice(0, 10);
  const columns: ExcelColumn[] = [
    { header: "No", key: "no", width: 6 },
    { header: "Kode", key: "kode", width: 12 },
    { header: "Mata Pelajaran", key: "nama", width: 28 },
    { header: "Kurikulum", key: "kurikulum", width: 22 },
    { header: "Tingkat", key: "tingkat", width: 10 },
    { header: "Jenis", key: "jenis", width: 10 },
    { header: "Jumlah Guru Pengampu", key: "guruPengampu", width: 22 },
  ];

  return respondExcel("Kurikulum & Mata Pelajaran", columns, rows, `kurikulum-mapel-${timestamp}.xlsx`);
}
