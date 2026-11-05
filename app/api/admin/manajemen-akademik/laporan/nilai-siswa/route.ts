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
 * GET /api/admin/manajemen-akademik/laporan/nilai-siswa
 *
 * Query params:
 *   - format : "excel" (default) | "pdf"
 *   - tahunAjaranId : id tahun ajaran (default: aktif)
 *   - rombelId      : BigInt rombel id (WAJIB untuk filter; atau studentId)
 *   - studentId     : string (WAJIB untuk single-siswa mode)
 */
export async function GET(request: NextRequest) {
  const access = await requireReportAccess();
  if (!access.ok) return access.response;

  const { searchParams } = new URL(request.url);
  const format = (searchParams.get("format") ?? "excel").toLowerCase();
  const tahunAjaranId = searchParams.get("tahunAjaranId");
  const rombelIdParam = searchParams.get("rombelId");
  const studentId = searchParams.get("studentId");

  const tahunAjaran = await resolveTahunAjaran(tahunAjaranId);
  if (!tahunAjaran) return errorResponse("Tahun ajaran tidak ditemukan", 404);

  // Single student: studentId wajib
  if (studentId) {
    return respondSingleStudent(studentId, tahunAjaran.label, format);
  }

  // Aggregate per siswa dalam rombel
  if (!rombelIdParam) return errorResponse("Parameter rombelId atau studentId wajib diisi", 400);
  const rombelId = BigInt(rombelIdParam);

  const rombel = await prisma.rombel.findUnique({
    where: { id: rombelId },
    select: { id: true, name: true, tahunAjaranId: true },
  });
  if (!rombel) return errorResponse("Rombel tidak ditemukan", 404);

  const students = await prisma.pesertaDidik.findMany({
    where: {
      status: "accepted",
      rombels: { some: { id: rombelId, deleted_at: null } },
    },
    include: {
      grades: {
        where: { deleted_at: null },
        include: {
          assessment: {
            select: {
              subject_id: true,
              weight: true,
              max_score: true,
              subject: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  const rows = students.map((s, idx) => {
    // Group grades by subject
    const bySubject = new Map<string, { name: string; weightedSum: number; weightSum: number; count: number }>();
    for (const g of s.grades) {
      const subjectId = String(g.assessment.subject_id);
      const subjectName = g.assessment.subject.name;
      const weight = g.assessment.weight || 1;
      const score = Number(g.score);
      const maxScore = Number(g.assessment.max_score ?? 100);
      const normalized = maxScore > 0 ? (score / maxScore) * 100 : score;

      const existing = bySubject.get(subjectId);
      if (existing) {
        existing.weightedSum += normalized * weight;
        existing.weightSum += weight;
        existing.count += 1;
      } else {
        bySubject.set(subjectId, {
          name: subjectName,
          weightedSum: normalized * weight,
          weightSum: weight,
          count: 1,
        });
      }
    }

    const subjectAverages = Array.from(bySubject.values()).map((v) => ({
      name: v.name,
      avg: v.weightSum > 0 ? v.weightedSum / v.weightSum : 0,
      count: v.count,
    }));

    const overallAvg =
      subjectAverages.length > 0
        ? subjectAverages.reduce((acc, v) => acc + v.avg, 0) / subjectAverages.length
        : 0;

    return {
      no: idx + 1,
      nisn: s.nisn ?? "",
      nama: s.fullName,
      rombel: rombel.name,
      jumlahMapel: subjectAverages.length,
      rataRata: Math.round(overallAvg * 100) / 100,
      predikat: overallAvg >= 90 ? "A" : overallAvg >= 80 ? "B" : overallAvg >= 70 ? "C" : overallAvg >= 60 ? "D" : "E",
    };
  });

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `nilai-${rombel.name.replace(/\s+/g, "-")}-${timestamp}`;

  if (format === "pdf") {
    return respondPdf(
      {
        title: "Daftar Nilai Siswa",
        subtitle: `Rombel ${rombel.name} • TA ${tahunAjaran.label}`,
        columns: [
          { header: "No", get: (r) => String(r.no), width: 28 },
          { header: "NISN", get: (r) => String(r.nisn), width: 70 },
          { header: "Nama", get: (r) => String(r.nama), width: 180 },
          { header: "Mapel", get: (r) => String(r.jumlahMapel), width: 40, align: "right" },
          { header: "Rata-rata", get: (r) => formatNumberID(Number(r.rataRata), 2), width: 70, align: "right" },
          { header: "Predikat", get: (r) => String(r.predikat), width: 50, align: "center" },
        ],
        rows,
      },
      { title: "Daftar Nilai", subtitle: `Rombel ${rombel.name}` },
      `${filename}.pdf`
    );
  }

  const columns: ExcelColumn[] = [
    { header: "No", key: "no", width: 6 },
    { header: "NISN", key: "nisn", width: 16 },
    { header: "Nama Lengkap", key: "nama", width: 30 },
    { header: "Rombel", key: "rombel", width: 18 },
    { header: "Jumlah Mapel", key: "jumlahMapel", width: 14 },
    { header: "Rata-rata", key: "rataRata", width: 12 },
    { header: "Predikat", key: "predikat", width: 10 },
  ];

  return respondExcel("Nilai Siswa", columns, rows, `${filename}.xlsx`);
}

async function respondSingleStudent(studentId: string, tahunAjaranLabel: string, format: string) {
  const student = await prisma.pesertaDidik.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      nisn: true,
      fullName: true,
      grades: {
        where: { deleted_at: null },
        include: {
          assessment: {
            include: { subject: { select: { name: true } } },
          },
        },
        orderBy: { created_at: "desc" },
      },
    },
  });
  if (!student) return errorResponse("Siswa tidak ditemukan", 404);

  const bySubject = new Map<
    string,
    { name: string; assessments: Array<{ title: string; type: string; score: number; max: number; weight: number }> }
  >();
  for (const g of student.grades) {
    const sid = String(g.assessment.subject_id);
    const subjName = g.assessment.subject.name;
    const score = Number(g.score);
    const max = Number(g.assessment.max_score ?? 100);
    const entry = bySubject.get(sid) ?? { name: subjName, assessments: [] };
    entry.assessments.push({
      title: g.assessment.title,
      type: g.assessment.type,
      score,
      max,
      weight: g.assessment.weight,
    });
    bySubject.set(sid, entry);
  }

  // Build transkrip rows (per subject, one summary row)
  const rows = Array.from(bySubject.values()).map((s) => {
    let weighted = 0;
    let totalWeight = 0;
    for (const a of s.assessments) {
      const normalized = a.max > 0 ? (a.score / a.max) * 100 : a.score;
      weighted += normalized * a.weight;
      totalWeight += a.weight;
    }
    const avg = totalWeight > 0 ? weighted / totalWeight : 0;
    return {
      no: 0,
      mataPelajaran: s.name,
      judul: s.assessments[0]?.title ?? "-",
      tipe: s.assessments[0]?.type ?? "-",
      nilai: Math.round(avg * 100) / 100,
      predikat: avg >= 90 ? "A" : avg >= 80 ? "B" : avg >= 70 ? "C" : avg >= 60 ? "D" : "E",
      jumlahTugas: s.assessments.length,
    };
  });
  rows.forEach((r, idx) => (r.no = idx + 1));

  const overallAvg =
    rows.length > 0 ? rows.reduce((acc, r) => acc + r.nilai, 0) / rows.length : 0;

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `transkrip-${student.fullName.replace(/\s+/g, "-")}-${timestamp}`;

  // Add summary row at end
  rows.push({
    no: 0,
    mataPelajaran: "RATA-RATA",
    judul: `${rows.length} mata pelajaran`,
    tipe: "",
    nilai: Math.round(overallAvg * 100) / 100,
    predikat: overallAvg >= 90 ? "A" : overallAvg >= 80 ? "B" : overallAvg >= 70 ? "C" : overallAvg >= 60 ? "D" : "E",
    jumlahTugas: 0,
  });

  if (format === "pdf") {
    return respondPdf(
      {
        title: "Transkrip Nilai",
        subtitle: `${student.fullName} • NISN ${student.nisn ?? "-"} • TA ${tahunAjaranLabel}`,
        columns: [
          { header: "No", get: (r) => String(r.no), width: 26 },
          { header: "Mata Pelajaran", get: (r) => String(r.mataPelajaran), width: 140 },
          { header: "Tugas", get: (r) => String(r.judul), width: 120 },
          { header: "Nilai", get: (r) => formatNumberID(Number(r.nilai), 2), width: 60, align: "right" },
          { header: "Predikat", get: (r) => String(r.predikat), width: 50, align: "center" },
        ],
        rows: rows.filter((r) => r.mataPelajaran !== "RATA-RATA"),
      },
      {
        title: "Transkrip Nilai",
        subtitle: `Rata-rata: ${formatNumberID(overallAvg, 2)} • ${student.fullName}`,
      },
      `${filename}.pdf`
    );
  }

  const columns: ExcelColumn[] = [
    { header: "No", key: "no", width: 6 },
    { header: "Mata Pelajaran", key: "mataPelajaran", width: 26 },
    { header: "Judul Penilaian", key: "judul", width: 30 },
    { header: "Tipe", key: "tipe", width: 12 },
    { header: "Nilai", key: "nilai", width: 10 },
    { header: "Predikat", key: "predikat", width: 10 },
    { header: "Jumlah Penilaian", key: "jumlahTugas", width: 18 },
  ];

  return respondExcel(`Transkrip ${student.fullName}`, columns, rows, `${filename}.xlsx`);
}
