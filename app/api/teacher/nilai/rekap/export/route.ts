import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";
import { fetchGradeScales, scoreToGrade } from "@/lib/grade/scale";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get staffId from session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { staff: true }
    });

    const staffId = user?.staff?.[0]?.id;
    if (!staffId) {
      return NextResponse.json(
        { error: "Staff ID not found" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const rombelId = searchParams.get("rombelId");
    const subjectId = searchParams.get("subjectId");
    const format = searchParams.get("format") || "pdf";

    if (!rombelId || !subjectId) {
      return NextResponse.json(
        { error: "rombelId and subjectId are required" },
        { status: 400 }
      );
    }

    // Verify teacher access
    const teacherSubject = await prisma.teacherSubject.findFirst({
      where: {
        teacher_id: staffId,
        rombel_id: BigInt(rombelId),
        subject_id: BigInt(subjectId),
        deleted_at: null
      }
    });

    if (!teacherSubject) {
      return NextResponse.json(
        { error: "You don't have access to this class and subject" },
        { status: 403 }
      );
    }

    // Get rombel and subject info
    const [rombel, subject] = await Promise.all([
      prisma.rombel.findUnique({
        where: { id: BigInt(rombelId) },
        include: {
          class: true,
          students: {
            where: { deleted_at: null },
            orderBy: { fullName: "asc" }
          }
        }
      }),
      prisma.subject.findUnique({
        where: { id: BigInt(subjectId) }
      })
    ]);

    if (!rombel || !subject) {
      return NextResponse.json(
        { error: "Rombel or subject not found" },
        { status: 404 }
      );
    }

    const gradeScales = await fetchGradeScales();

    // Get all active rubrics for this subject and rombel
    const rubrics = await prisma.assessmentRubric.findMany({
      where: {
        subject_id: BigInt(subjectId),
        rombel_id: BigInt(rombelId),
        deleted_at: null
      },
      include: {
        criteria: {
          where: { deleted_at: null },
          orderBy: { order: "asc" }
        }
      },
      orderBy: [
        { type: "asc" },
        { name: "asc" }
      ]
    });

    // Calculate max score for each rubric
    const rubricsWithMaxScore = rubrics.map(rubric => {
      const rubricTotal = rubric.criteria.reduce((sum, criterion) => {
        return sum + parseFloat(criterion.max_score.toString());
      }, 0);

      return {
        ...rubric,
        maxScore: rubricTotal
      };
    });

    // Get all grades for these students and rubrics
    const studentIds = rombel.students.map(s => s.id);
    const rubricIds = rubrics.map(r => r.id);

    const grades = await prisma.grade.findMany({
      where: {
        student_id: { in: studentIds },
        rubric_id: { in: rubricIds },
        deleted_at: null
      },
      include: {
        rubric: true,
        student: true
      }
    });

    // Calculate grade analysis
    const studentGrades: Array<{
      studentId: string;
      studentName: string;
      nisn: string;
      grades: Record<string, number>;
      finalScore: number;
      grade: string;
      status: "TUNTAS" | "REMEDIAL";
    }> = [];

    for (const student of rombel.students) {
      const studentGradeData: Record<string, number> = {};
      let totalWeightedScore = 0;
      let totalWeight = 0;

      for (const rubric of rubricsWithMaxScore) {
        const grade = grades.find(g => g.student_id === student.id && g.rubric_id === rubric.id);
        if (grade) {
          const score = Number(grade.score);
          studentGradeData[rubric.name] = score;

          // Calculate weighted score
          const scorePercentage = (score / rubric.maxScore) * 100;
          totalWeightedScore += scorePercentage * rubric.weight;
          totalWeight += rubric.weight;
        }
      }

      const finalScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
      const grade = scoreToGrade(finalScore, gradeScales);
      const status = finalScore >= (subject.kkm || 75) ? "TUNTAS" : "REMEDIAL";

      studentGrades.push({
        studentId: student.id,
        studentName: student.fullName,
        nisn: student.nisn || "",
        grades: studentGradeData,
        finalScore,
        grade,
        status
      });
    }

    // Generate report data
    const reportData = {
      className: `${rombel.name} - ${rombel.class.name}`,
      subjectName: subject.name,
      kkm: subject.kkm || 75,
      generatedAt: new Date().toISOString(),
      assessments: rubricsWithMaxScore.map(a => ({
        name: a.name,
        weight: a.weight,
        maxScore: a.maxScore
      })),
      students: studentGrades.map(s => ({
        name: s.studentName,
        nisn: s.nisn,
        grades: s.grades,
        finalScore: Math.round(s.finalScore * 100) / 100,
        grade: s.grade,
        status: s.status
      }))
    };

    if (format === "excel") {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Sekolix";
      workbook.created = new Date();

      const sheet = workbook.addWorksheet("Rekap Nilai");

      // ── Header info ──────────────────────────────────────────────────────
      sheet.mergeCells("A1:Z1");
      sheet.getCell("A1").value = `Rekap Nilai — ${reportData.className}`;
      sheet.getCell("A1").font = { bold: true, size: 14 };
      sheet.getCell("A1").alignment = { horizontal: "center" };

      sheet.mergeCells("A2:Z2");
      sheet.getCell("A2").value = `Mata Pelajaran: ${reportData.subjectName}   |   KKM: ${reportData.kkm}   |   Dicetak: ${new Date().toLocaleString("id-ID")}`;
      sheet.getCell("A2").alignment = { horizontal: "center" };

      sheet.addRow([]);

      // ── Column headers ───────────────────────────────────────────────────
      const assessmentNames = reportData.assessments.map(a => a.name);
      const headerRow = sheet.addRow([
        "No", "Nama Siswa", "NISN",
        ...assessmentNames,
        "Nilai Akhir", "Predikat", "Status",
      ]);
      headerRow.eachCell(cell => {
        cell.font = { bold: true };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F3864" } };
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        cell.border = {
          top: { style: "thin" }, bottom: { style: "thin" },
          left: { style: "thin" }, right: { style: "thin" },
        };
      });
      headerRow.height = 30;

      // Sub-header: bobot
      const weightRow = sheet.addRow([
        "", "", "",
        ...reportData.assessments.map(a => `Bobot: ${a.weight}`),
        "", "", "",
      ]);
      weightRow.eachCell(cell => {
        cell.font = { italic: true, size: 9, color: { argb: "FF666666" } };
        cell.alignment = { horizontal: "center" };
      });

      // ── Data rows ────────────────────────────────────────────────────────
      reportData.students.forEach((student, idx) => {
        const scores = assessmentNames.map(name => student.grades[name] ?? "");
        const row = sheet.addRow([
          idx + 1,
          student.name,
          student.nisn,
          ...scores,
          student.finalScore,
          student.grade,
          student.status,
        ]);

        const statusCell = row.getCell(row.cellCount);
        statusCell.font = {
          bold: true,
          color: { argb: student.status === "TUNTAS" ? "FF166534" : "FF991B1B" },
        };
        statusCell.fill = {
          type: "pattern", pattern: "solid",
          fgColor: { argb: student.status === "TUNTAS" ? "FFdcfce7" : "FFfee2e2" },
        };

        row.eachCell(cell => {
          cell.alignment = { vertical: "middle", horizontal: "center" };
          cell.border = {
            top: { style: "thin" }, bottom: { style: "thin" },
            left: { style: "thin" }, right: { style: "thin" },
          };
        });
        // Left-align name column
        row.getCell(2).alignment = { vertical: "middle", horizontal: "left" };
      });

      // ── Column widths ────────────────────────────────────────────────────
      sheet.getColumn(1).width = 5;
      sheet.getColumn(2).width = 30;
      sheet.getColumn(3).width = 16;
      assessmentNames.forEach((_, i) => { sheet.getColumn(4 + i).width = 18; });
      const lastColOffset = 4 + assessmentNames.length;
      sheet.getColumn(lastColOffset).width = 12;     // Nilai Akhir
      sheet.getColumn(lastColOffset + 1).width = 10; // Predikat
      sheet.getColumn(lastColOffset + 2).width = 12; // Status

      // ── Buffer → Response ─────────────────────────────────────────────────
      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `rekap-nilai-${reportData.className}-${reportData.subjectName}.xlsx`
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9._-]/g, "");

      return new Response(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${fileName}"`,
        },
      });
    } else {
      // For PDF, return JSON data that frontend can use to generate PDF
      return NextResponse.json({
        message: "PDF export data",
        data: reportData
      });
    }

  } catch (error) {
    console.error("Error exporting grade report:", error);
    return NextResponse.json(
      { error: "Failed to export grade report" },
      { status: 500 }
    );
  }
}

