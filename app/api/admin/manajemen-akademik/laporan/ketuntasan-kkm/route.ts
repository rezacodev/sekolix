import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  errorResponse,
  requireReportAccess,
  respondExcel,
  resolveTahunAjaran,
} from "@/lib/reports";
import type { ExcelColumn } from "@/lib/reports";

const KKM = 75;

/**
 * GET /api/admin/manajemen-akademik/laporan/ketuntasan-kkm
 *
 * Persentase siswa tuntas KKM per mata pelajaran.
 */
export async function GET(request: NextRequest) {
  const access = await requireReportAccess();
  if (!access.ok) return access.response;

  const { searchParams } = new URL(request.url);
  const tahunAjaranId = searchParams.get("tahunAjaranId");

  const tahunAjaran = await resolveTahunAjaran(tahunAjaranId);
  if (!tahunAjaran) return errorResponse("Tahun ajaran tidak ditemukan", 404);

  const assessments = await prisma.assessment.findMany({
    where: { deleted_at: null },
    include: {
      subject: { select: { name: true } },
      grades: { where: { deleted_at: null }, select: { score: true } },
    },
  });

  const bySubject = new Map<
    string,
    { name: string; totalStudents: number; tuntas: number }
  >();
  for (const a of assessments) {
    const sid = String(a.subject_id);
    const entry = bySubject.get(sid) ?? { name: a.subject.name, totalStudents: 0, tuntas: 0 };
    const max = Number(a.max_score ?? 100);
    for (const g of a.grades) {
      const norm = max > 0 ? (Number(g.score) / max) * 100 : Number(g.score);
      entry.totalStudents += 1;
      if (norm >= KKM) entry.tuntas += 1;
    }
    bySubject.set(sid, entry);
  }

  const rows = Array.from(bySubject.values())
    .map((v, idx) => ({
      no: idx + 1,
      mataPelajaran: v.name,
      totalPenilaian: v.totalStudents,
      tuntas: v.tuntas,
      belumTuntas: v.totalStudents - v.tuntas,
      persenTuntas: v.totalStudents > 0 ? Math.round((v.tuntas / v.totalStudents) * 100) : 0,
    }))
    .sort((a, b) => b.persenTuntas - a.persenTuntas);

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `ketuntasan-kkm-${timestamp}`;

  const columns: ExcelColumn[] = [
    { header: "No", key: "no", width: 6 },
    { header: "Mata Pelajaran", key: "mataPelajaran", width: 26 },
    { header: "Total Penilaian", key: "totalPenilaian", width: 16 },
    { header: "Tuntas (≥KKM)", key: "tuntas", width: 16 },
    { header: "Belum Tuntas", key: "belumTuntas", width: 16 },
    { header: "% Tuntas", key: "persenTuntas", width: 12 },
  ];

  return respondExcel("Ketuntasan KKM", columns, rows, `${filename}.xlsx`);
}
