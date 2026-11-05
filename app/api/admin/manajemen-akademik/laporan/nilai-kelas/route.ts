import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  errorResponse,
  formatNumberID,
  requireReportAccess,
  respondExcel,
  respondPdf,
  resolveTahunAjaran,
} from "@/lib/reports";
import type { ExcelColumn } from "@/lib/reports";

/**
 * GET /api/admin/manajemen-akademik/laporan/nilai-kelas
 *
 * Query params:
 *   - format : "excel" (default) | "pdf"
 *   - tahunAjaranId : id tahun ajaran (default: aktif)
 *
 * Rekap nilai rata-rata per rombel (semua rombel pada tahun ajaran).
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
    where: { deleted_at: null, tahunAjaranId: tahunAjaran.id },
    include: {
      class: { select: { name: true } },
      program: { select: { name: true } },
    },
    orderBy: [{ class: { name: "asc" } }, { name: "asc" }],
  });

  const rombelIds = rombels.map((r) => r.id);

  // Fetch all grades for these rombels' students
  const students = await prisma.pesertaDidik.findMany({
    where: {
      status: "accepted",
      rombels: { some: { id: { in: rombelIds }, deleted_at: null } },
    },
    select: {
      id: true,
      fullName: true,
      rombels: { where: { deleted_at: null, id: { in: rombelIds } }, select: { id: true } },
      grades: {
        where: { deleted_at: null },
        select: {
          score: true,
          assessment: { select: { max_score: true, weight: true, subject_id: true } },
        },
      },
    },
  });

  // Compute per rombel aggregates
  const byRombel = new Map<
    string,
    { name: string; kelas: string; program: string; studentAvgs: number[] }
  >();
  for (const r of rombels) {
    byRombel.set(String(r.id), {
      name: r.name,
      kelas: r.class.name,
      program: r.program?.name ?? "-",
      studentAvgs: [],
    });
  }

  for (const s of students) {
    let weighted = 0;
    let weightSum = 0;
    for (const g of s.grades) {
      const max = Number(g.assessment.max_score ?? 100);
      const norm = max > 0 ? (Number(g.score) / max) * 100 : Number(g.score);
      weighted += norm * (g.assessment.weight || 1);
      weightSum += g.assessment.weight || 1;
    }
    const avg = weightSum > 0 ? weighted / weightSum : 0;

    for (const r of s.rombels) {
      const entry = byRombel.get(String(r.id));
      if (entry) entry.studentAvgs.push(avg);
    }
  }

  const rows = Array.from(byRombel.entries())
    .map(([id, v], idx) => {
      const total = v.studentAvgs.length;
      const avgRata = total > 0 ? v.studentAvgs.reduce((a, b) => a + b, 0) / total : 0;
      const tertinggi = total > 0 ? Math.max(...v.studentAvgs) : 0;
      const terendah = total > 0 ? Math.min(...v.studentAvgs) : 0;
      const lulus = v.studentAvgs.filter((a) => a >= 75).length;
      return {
        no: idx + 1,
        rombel: v.name,
        kelas: v.kelas,
        program: v.program,
        jumlahSiswa: total,
        rataRata: Math.round(avgRata * 100) / 100,
        tertinggi: Math.round(tertinggi * 100) / 100,
        terendah: Math.round(terendah * 100) / 100,
        lulusKkm: total > 0 ? Math.round((lulus / total) * 100) : 0,
      };
    })
    .sort((a, b) => b.rataRata - a.rataRata);

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `nilai-kelas-${timestamp}`;

  if (format === "pdf") {
    return respondPdf(
      {
        title: "Rekap Nilai Per Rombel",
        subtitle: `TA ${tahunAjaran.label} • ${rows.length} rombel`,
        columns: [
          { header: "No", get: (r) => String(r.no), width: 26 },
          { header: "Rombel", get: (r) => String(r.rombel), width: 100 },
          { header: "Kelas", get: (r) => String(r.kelas), width: 40 },
          { header: "Siswa", get: (r) => String(r.jumlahSiswa), width: 40, align: "right" },
          { header: "Rata-rata", get: (r) => formatNumberID(Number(r.rataRata), 2), width: 70, align: "right" },
          { header: "Tertinggi", get: (r) => formatNumberID(Number(r.tertinggi), 2), width: 70, align: "right" },
          { header: "Terendah", get: (r) => formatNumberID(Number(r.terendah), 2), width: 70, align: "right" },
          { header: "%≥KKM", get: (r) => `${r.lulusKkm}%`, width: 50, align: "right" },
        ],
        rows,
      },
      { title: "Nilai Per Rombel", subtitle: `TA ${tahunAjaran.label}`, landscape: true },
      `${filename}.pdf`
    );
  }

  const columns: ExcelColumn[] = [
    { header: "No", key: "no", width: 6 },
    { header: "Rombel", key: "rombel", width: 18 },
    { header: "Kelas", key: "kelas", width: 10 },
    { header: "Program", key: "program", width: 22 },
    { header: "Jumlah Siswa", key: "jumlahSiswa", width: 14 },
    { header: "Rata-rata", key: "rataRata", width: 12 },
    { header: "Tertinggi", key: "tertinggi", width: 12 },
    { header: "Terendah", key: "terendah", width: 12 },
    { header: "% ≥ KKM", key: "lulusKkm", width: 12 },
  ];

  return respondExcel("Nilai Per Rombel", columns, rows, `${filename}.xlsx`);
}
