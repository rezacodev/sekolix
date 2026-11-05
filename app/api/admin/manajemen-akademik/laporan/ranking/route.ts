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
 * GET /api/admin/manajemen-akademik/laporan/ranking
 *
 * Query params:
 *   - format : "excel" (default) | "pdf"
 *   - tahunAjaranId : id tahun ajaran (default: aktif)
 *   - rombelId : BigInt rombel id (opsional; tanpa ini = semua siswa aktif)
 *   - topN : integer (default: 50)
 */
export async function GET(request: NextRequest) {
  const access = await requireReportAccess();
  if (!access.ok) return access.response;

  const { searchParams } = new URL(request.url);
  const format = (searchParams.get("format") ?? "excel").toLowerCase();
  const tahunAjaranId = searchParams.get("tahunAjaranId");
  const rombelIdParam = searchParams.get("rombelId");
  const topNParam = searchParams.get("topN");
  const topN = topNParam ? Math.max(1, parseInt(topNParam, 10) || 50) : 50;
  const rombelId = rombelIdParam ? BigInt(rombelIdParam) : null;

  const tahunAjaran = await resolveTahunAjaran(tahunAjaranId);
  if (!tahunAjaran) return errorResponse("Tahun ajaran tidak ditemukan", 404);

  const students = await prisma.pesertaDidik.findMany({
    where: {
      status: "accepted",
      grades: { some: {} },
      ...(rombelId
        ? { rombels: { some: { id: rombelId, deleted_at: null } } }
        : {}),
    },
    include: {
      grades: {
        where: { deleted_at: null },
        select: {
          score: true,
          assessment: { select: { max_score: true, weight: true } },
        },
      },
      rombels: { where: { deleted_at: null }, select: { name: true } },
    },
  });

  const ranked = students
    .map((s) => {
      let w = 0;
      let ws = 0;
      for (const g of s.grades) {
        const max = Number(g.assessment.max_score ?? 100);
        const norm = max > 0 ? (Number(g.score) / max) * 100 : Number(g.score);
        w += norm * (g.assessment.weight || 1);
        ws += g.assessment.weight || 1;
      }
      return {
        id: s.id,
        nisn: s.nisn ?? "",
        nama: s.fullName,
        rombel: s.rombels[0]?.name ?? "-",
        rataRata: ws > 0 ? w / ws : 0,
      };
    })
    .sort((a, b) => b.rataRata - a.rataRata)
    .slice(0, topN);

  // Assign rank
  const rows = ranked.map((r, idx) => ({
    peringkat: idx + 1,
    nisn: r.nisn,
    nama: r.nama,
    rombel: r.rombel,
    rataRata: Math.round(r.rataRata * 100) / 100,
    predikat:
      r.rataRata >= 90 ? "A" : r.rataRata >= 80 ? "B" : r.rataRata >= 70 ? "C" : r.rataRata >= 60 ? "D" : "E",
  }));

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `ranking-siswa-${timestamp}`;

  if (format === "pdf") {
    return respondPdf(
      {
        title: `Ranking ${topN} Siswa`,
        subtitle: rombelId
          ? `Rombel tertentu • TA ${tahunAjaran.label}`
          : `Seluruh siswa aktif • TA ${tahunAjaran.label}`,
        columns: [
          { header: "Peringkat", get: (r) => String(r.peringkat), width: 60, align: "center" },
          { header: "NISN", get: (r) => String(r.nisn), width: 80 },
          { header: "Nama", get: (r) => String(r.nama), width: 200 },
          { header: "Rombel", get: (r) => String(r.rombel), width: 90 },
          { header: "Rata-rata", get: (r) => formatNumberID(Number(r.rataRata), 2), width: 70, align: "right" },
          { header: "Predikat", get: (r) => String(r.predikat), width: 60, align: "center" },
        ],
        rows,
      },
      { title: "Ranking Siswa", subtitle: `Top ${topN}`, landscape: true },
      `${filename}.pdf`
    );
  }

  const columns: ExcelColumn[] = [
    { header: "Peringkat", key: "peringkat", width: 12 },
    { header: "NISN", key: "nisn", width: 16 },
    { header: "Nama Lengkap", key: "nama", width: 30 },
    { header: "Rombel", key: "rombel", width: 18 },
    { header: "Rata-rata", key: "rataRata", width: 12 },
    { header: "Predikat", key: "predikat", width: 10 },
  ];

  return respondExcel(`Ranking Top ${topN}`, columns, rows, `${filename}.xlsx`);
}
