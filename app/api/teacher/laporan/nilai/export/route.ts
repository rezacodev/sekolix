import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

async function getStaffId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.staffId) return null;
  return session.user.staffId;
}

// GET /api/teacher/laporan/nilai/export?rombelId=&subjectId=
export async function GET(request: Request) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const rombelId = searchParams.get("rombelId");
    const subjectId = searchParams.get("subjectId");

    const teacherSubjects = await prisma.teacherSubject.findMany({
      where: {
        teacher_id: staffId,
        deleted_at: null,
        ...(rombelId ? { rombel_id: BigInt(rombelId) } : {}),
        ...(subjectId ? { subject_id: BigInt(subjectId) } : {}),
      },
      include: {
        subject: true,
        rombel: {
          select: {
            id: true,
            name: true,
            class: { select: { name: true } },
            students: {
              where: { deleted_at: null },
              orderBy: { fullName: "asc" },
              select: { id: true, fullName: true, nisn: true },
            },
          },
        },
      },
    });

    const wb = new ExcelJS.Workbook();
    wb.creator = "Sekolix";
    wb.created = new Date();

    for (const ts of teacherSubjects) {
      if (!ts.rombel) continue;

      const rubrics = await prisma.assessmentRubric.findMany({
        where: {
          subject_id: ts.subject_id,
          rombel_id: ts.rombel_id!,
          deleted_at: null,
        },
        include: {
          grades: { where: { deleted_at: null }, select: { student_id: true, score: true } },
        },
        orderBy: { created_at: "asc" },
      });

      const sheetName = `${ts.rombel.name}_${ts.subject.name}`.slice(0, 31);
      const ws = wb.addWorksheet(sheetName);

      // Title
      const colCount = rubrics.length + 4;
      ws.mergeCells(1, 1, 1, colCount);
      const title = ws.getCell("A1");
      title.value = `Laporan Nilai — ${ts.subject.name} — ${ts.rombel.name} (${ts.rombel.class.name})`;
      title.font = { bold: true, size: 12 };
      title.alignment = { horizontal: "center" };
      ws.addRow([]);

      // Header
      const headers = ["No", "NISN", "Nama Siswa", ...rubrics.map((r) => r.name), "Rata-rata", "Keterangan"];
      const hRow = ws.addRow(headers);
      hRow.eachCell((c) => {
        c.font = { bold: true, color: { argb: "FFFFFFFF" } };
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } };
        c.alignment = { horizontal: "center", wrapText: true };
      });
      ws.getRow(3).height = 32;

      // Column widths
      ws.getColumn(1).width = 5;
      ws.getColumn(2).width = 16;
      ws.getColumn(3).width = 28;
      for (let i = 0; i < rubrics.length; i++) ws.getColumn(4 + i).width = 14;
      ws.getColumn(4 + rubrics.length).width = 12;
      ws.getColumn(5 + rubrics.length).width = 14;

      // Build grade map
      const gradeMap = new Map<string, Map<string, number>>();
      for (const rubric of rubrics) {
        for (const grade of rubric.grades) {
          const sm = gradeMap.get(grade.student_id) ?? new Map();
          sm.set(String(rubric.id), Number(grade.score));
          gradeMap.set(grade.student_id, sm);
        }
      }

      const kkm = 70;
      ts.rombel.students.forEach((student, i) => {
        const sm = gradeMap.get(student.id);
        const scores = rubrics.map((r) => sm?.get(String(r.id)) ?? null);
        const validScores = scores.filter((s) => s !== null) as number[];
        const weighted =
          validScores.length > 0 && rubrics.length > 0
            ? rubrics.reduce((sum, r, idx) => {
                const sc = sm?.get(String(r.id));
                return sc !== undefined ? sum + sc * r.weight : sum;
              }, 0) /
              rubrics.reduce((sum, r) => {
                return sm?.get(String(r.id)) !== undefined ? sum + r.weight : sum;
              }, 0)
            : null;

        const avg = weighted !== null ? Math.round(weighted * 10) / 10 : null;
        const row = ws.addRow([
          i + 1,
          student.nisn ?? "-",
          student.fullName,
          ...scores.map((s) => s ?? "-"),
          avg ?? "-",
          avg !== null ? (avg >= kkm ? "TUNTAS" : "REMEDIAL") : "-",
        ]);

        if (avg !== null) {
          const avgCell = row.getCell(4 + rubrics.length);
          const ketCell = row.getCell(5 + rubrics.length);
          const isPassed = avg >= kkm;
          avgCell.font = { bold: true, color: { argb: isPassed ? "FF16A34A" : "FFDC2626" } };
          ketCell.font = { bold: true, color: { argb: isPassed ? "FF16A34A" : "FFDC2626" } };
        }

        if (i % 2 === 1) {
          row.eachCell((c) => {
            if (!c.fill || (c.fill as ExcelJS.FillPattern).fgColor?.argb !== "FF16A34A") {
              c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF9FAFB" } };
            }
          });
        }
      });
    }

    const buffer = await wb.xlsx.writeBuffer();
    return new Response(Buffer.from(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="laporan_nilai.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Error exporting laporan nilai:", error);
    return NextResponse.json({ error: "Failed to export" }, { status: 500 });
  }
}
