/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

async function getStaffId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { staff: true },
  });
  return user?.staff?.[0]?.id ?? null;
}

type Params = { params: Promise<{ jadwalId: string }> };

// GET /api/teacher/ujian/hasil/[jadwalId]/export — download Excel hasil ujian
export async function GET(_req: Request, { params }: Params) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { jadwalId } = await params;
    const db = prisma as any;

    const schedule: any = await db.examSchedule.findFirst({
      where: { id: BigInt(jadwalId), teacher_id: staffId, deleted_at: null },
      include: {
        package: {
          select: {
            title: true,
            exam_type: true,
            passing_grade: true,
            questions: { select: { id: true } },
          },
        },
        rombel: {
          select: {
            name: true,
            class: { select: { name: true } },
            students: {
              where: { deleted_at: null },
              orderBy: { fullName: "asc" },
              select: { id: true, fullName: true, nisn: true },
            },
          },
        },
        attempts: {
          where: { deleted_at: null },
          select: {
            student_id: true,
            status: true,
            score: true,
            auto_score: true,
            essay_score: true,
            started_at: true,
            submitted_at: true,
            graded_at: true,
          },
        },
      },
    });

    if (!schedule) return NextResponse.json({ error: "Schedule not found" }, { status: 404 });

    const passingGrade: number = schedule.package.passing_grade;
    const attemptMap = new Map<string, any>(schedule.attempts.map((a: any) => [a.student_id, a]));

    const wb = new ExcelJS.Workbook();
    wb.creator = "Sekolix";
    wb.created = new Date();

    const ws = wb.addWorksheet("Hasil Ujian");

    // Title rows
    ws.mergeCells("A1:H1");
    const titleCell = ws.getCell("A1");
    titleCell.value = `Hasil Ujian: ${schedule.title}`;
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { horizontal: "center" };

    ws.mergeCells("A2:H2");
    const infoCell = ws.getCell("A2");
    infoCell.value = `Kelas: ${schedule.rombel.name} — ${schedule.rombel.class.name} | Paket: ${schedule.package.title} | KKM: ${passingGrade}`;
    infoCell.alignment = { horizontal: "center" };
    infoCell.font = { size: 11, color: { argb: "FF666666" } };

    ws.addRow([]);

    // Header row
    const headerRow = ws.addRow([
      "No",
      "NISN",
      "Nama Siswa",
      "Status Pengerjaan",
      "Nilai Otomatis",
      "Nilai Essay",
      "Nilai Akhir",
      "Keterangan",
    ]);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    });

    ws.columns = [
      { key: "no", width: 5 },
      { key: "nisn", width: 16 },
      { key: "name", width: 32 },
      { key: "statusLabel", width: 20 },
      { key: "autoScore", width: 16 },
      { key: "essayScore", width: 16 },
      { key: "finalScore", width: 14 },
      { key: "keterangan", width: 14 },
    ];

    schedule.rombel.students.forEach((student: any, i: number) => {
      const attempt: any = attemptMap.get(student.id);
      const score = attempt?.score !== null && attempt?.score !== undefined ? Number(attempt.score) : null;
      const autoScore = attempt?.auto_score !== null && attempt?.auto_score !== undefined ? Number(attempt.auto_score) : null;
      const essayScore = attempt?.essay_score !== null && attempt?.essay_score !== undefined ? Number(attempt.essay_score) : null;

      let statusLabel = "Belum Mulai";
      if (attempt) {
        if (attempt.status === "IN_PROGRESS") statusLabel = "Sedang Mengerjakan";
        else if (attempt.status === "SUBMITTED") statusLabel = "Menunggu Koreksi";
        else if (attempt.status === "GRADED") statusLabel = "Selesai";
        else statusLabel = "Submit";
      }

      const keterangan = score !== null ? (score >= passingGrade ? "LULUS" : "TIDAK LULUS") : "-";
      const isPassed = score !== null && score >= passingGrade;

      const row = ws.addRow([
        i + 1,
        student.nisn ?? "-",
        student.fullName,
        statusLabel,
        autoScore ?? "-",
        essayScore ?? "-",
        score ?? "-",
        keterangan,
      ]);

      const scoreCell = row.getCell(7);
      const ketCell = row.getCell(8);
      if (score !== null) {
        scoreCell.font = { bold: true, color: { argb: isPassed ? "FF16A34A" : "FFDC2626" } };
        ketCell.font = { bold: true, color: { argb: isPassed ? "FF16A34A" : "FFDC2626" } };
      }

      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFE5E7EB" } },
          bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
          left: { style: "thin", color: { argb: "FFE5E7EB" } },
          right: { style: "thin", color: { argb: "FFE5E7EB" } },
        };
        if (i % 2 === 1) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF9FAFB" } };
        }
      });
    });

    // Summary row
    const submitted = schedule.attempts.filter((a: any) => a.status !== "IN_PROGRESS");
    const scored = submitted.filter((a: any) => a.score !== null);
    const passed = scored.filter((a: any) => Number(a.score) >= passingGrade);
    const avg = scored.length > 0 ? scored.reduce((s: number, a: any) => s + Number(a.score), 0) / scored.length : null;

    ws.addRow([]);
    const summaryRow = ws.addRow([
      "",
      "",
      "Ringkasan",
      `${submitted.length} submit / ${schedule.rombel.students.length} siswa`,
      "",
      "",
      avg !== null ? `Rata-rata: ${Math.round(avg * 10) / 10}` : "-",
      `Lulus: ${passed.length}/${scored.length}`,
    ]);
    summaryRow.font = { bold: true };

    const buffer = await wb.xlsx.writeBuffer();

    const safeTitle = schedule.title.replace(/[^a-zA-Z0-9]/g, "_");
    return new Response(Buffer.from(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="hasil_ujian_${safeTitle}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Error exporting hasil ujian:", error);
    return NextResponse.json({ error: "Failed to export" }, { status: 500 });
  }
}
