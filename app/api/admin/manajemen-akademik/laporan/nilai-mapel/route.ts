import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, formatNumberID, requireReportAccess, respondExcel, respondPdf } from "@/lib/reports";
import type { ExcelColumn } from "@/lib/reports";

/**
 * GET /api/admin/manajemen-akademik/laporan/nilai-mapel
 *
 * Rata-rata nilai per mata pelajaran (agregat lintas rombel).
 */
export async function GET(request: NextRequest) {
  const access = await requireReportAccess();
  if (!access.ok) return access.response;

  const { searchParams } = new URL(request.url);
  const format = (searchParams.get("format") ?? "excel").toLowerCase();

  const assessments = await prisma.assessment.findMany({
    where: { deleted_at: null },
    include: {
      subject: { select: { name: true, code: true } },
      grades: { where: { deleted_at: null }, select: { score: true } },
    },
  });

  const bySubject = new Map<
    string,
    { name: string; code: string; total: number; count: number; maxScore: number }
  >();
  for (const a of assessments) {
    const sid = String(a.subject_id);
    const entry =
      bySubject.get(sid) ??
      { name: a.subject.name, code: a.subject.code ?? "", total: 0, count: 0, maxScore: 100 };
    const max = Number(a.max_score ?? 100);
    for (const g of a.grades) {
      const norm = max > 0 ? (Number(g.score) / max) * 100 : Number(g.score);
      entry.total += norm;
      entry.count += 1;
    }
    bySubject.set(sid, entry);
  }

  const rows = Array.from(bySubject.values())
    .map((v, idx) => ({
      no: idx + 1,
      kode: v.code,
      mataPelajaran: v.name,
      jumlahPenilaian: v.count,
      rataRata: v.count > 0 ? Math.round((v.total / v.count) * 100) / 100 : 0,
    }))
    .sort((a, b) => b.rataRata - a.rataRata);

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `nilai-mapel-${timestamp}`;

  if (format === "pdf") {
    return respondPdf(
      {
        title: "Rata-rata Nilai Per Mata Pelajaran",
        subtitle: `${rows.length} mata pelajaran • Agregat lintas rombel`,
        columns: [
          { header: "No", get: (r) => String(r.no), width: 28 },
          { header: "Kode", get: (r) => String(r.kode), width: 60 },
          { header: "Mata Pelajaran", get: (r) => String(r.mataPelajaran), width: 200 },
          { header: "Penilaian", get: (r) => String(r.jumlahPenilaian), width: 60, align: "right" },
          { header: "Rata-rata", get: (r) => formatNumberID(Number(r.rataRata), 2), width: 80, align: "right" },
        ],
        rows,
      },
      { title: "Nilai Per Mapel", subtitle: "Agregat semua rombel" },
      `${filename}.pdf`
    );
  }

  const columns: ExcelColumn[] = [
    { header: "No", key: "no", width: 6 },
    { header: "Kode", key: "kode", width: 12 },
    { header: "Mata Pelajaran", key: "mataPelajaran", width: 28 },
    { header: "Jumlah Penilaian", key: "jumlahPenilaian", width: 16 },
    { header: "Rata-rata", key: "rataRata", width: 12 },
  ];

  return respondExcel("Nilai Per Mata Pelajaran", columns, rows, `${filename}.xlsx`);
}
