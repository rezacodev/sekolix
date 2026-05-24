import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchGradeScales, scoreToGrade } from "@/lib/grade/scale";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || (user.role !== "ADMIN" && user.role !== "EDITOR")) return null;
  return user;
}

// GET /api/admin/manajemen-akademik/rapor/generate?rombelId=&studentId=
export async function GET(request: Request) {
  try {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const rombelId = searchParams.get("rombelId");
    const studentId = searchParams.get("studentId"); // optional, omit for all students

    if (!rombelId) {
      return NextResponse.json({ error: "rombelId is required" }, { status: 400 });
    }

    const rombel = await prisma.rombel.findUnique({
      where: { id: BigInt(rombelId), deleted_at: null },
      include: {
        class: { select: { name: true } },
        tahunAjaran: { select: { label: true } },
        students: {
          where: {
            deleted_at: null,
            ...(studentId ? { id: studentId } : {}),
          },
          orderBy: { fullName: "asc" },
          select: { id: true, fullName: true, nisn: true },
        },
        rubrics: {
          where: { deleted_at: null },
          include: {
            subject: { select: { id: true, name: true, kkm: true } },
            criteria: { where: { deleted_at: null }, orderBy: { order: "asc" } },
          },
          orderBy: [{ subject_id: "asc" }, { type: "asc" }],
        },
      },
    });

    if (!rombel) return NextResponse.json({ error: "Rombel not found" }, { status: 404 });
    if (rombel.students.length === 0) {
      return NextResponse.json({ error: "No students found" }, { status: 404 });
    }

    const gradeScales = await fetchGradeScales();

    const studentIds = rombel.students.map((s) => s.id);
    const rubricIds = rombel.rubrics.map((r) => r.id);

    const grades = await prisma.grade.findMany({
      where: {
        student_id: { in: studentIds },
        rubric_id: { in: rubricIds },
        deleted_at: null,
      },
      select: { student_id: true, rubric_id: true, score: true },
    });

    // Group rubrics by subject
    const subjectMap = new Map<
      string,
      { id: number; name: string; kkm: number; rubrics: typeof rombel.rubrics }
    >();
    for (const rubric of rombel.rubrics) {
      const sid = String(rubric.subject_id);
      if (!subjectMap.has(sid)) {
        subjectMap.set(sid, {
          id: Number(rubric.subject_id),
          name: rubric.subject.name,
          kkm: rubric.subject.kkm ?? 75,
          rubrics: [],
        });
      }
      subjectMap.get(sid)!.rubrics.push(rubric);
    }

    const subjects = [...subjectMap.values()].map((subj) => {
      const rubricsWithMax = subj.rubrics.map((r) => ({
        id: r.id,
        maxScore: r.criteria.reduce((sum, c) => sum + parseFloat(c.max_score.toString()), 0),
        weight: r.weight,
      }));

      return {
        name: subj.name,
        kkm: subj.kkm,
        rubricsWithMax,
      };
    });

    // Build per-student rapor data
    const pdfDoc = await PDFDocument.create();
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const pageW = 595; // A4 width pt
    const pageH = 842; // A4 height pt
    const margin = 50;

    for (const student of rombel.students) {
      const page = pdfDoc.addPage([pageW, pageH]);
      let y = pageH - margin;

      // ── Header ───────────────────────────────────────────────────────────
      page.drawText("RAPOR NILAI SISWA", {
        x: margin,
        y,
        size: 16,
        font: fontBold,
        color: rgb(0.1, 0.2, 0.5),
      });
      y -= 22;
      page.drawText(`${rombel.name} — ${rombel.class.name}   |   ${rombel.tahunAjaran?.label ?? ""}`, {
        x: margin,
        y,
        size: 10,
        font: fontReg,
        color: rgb(0.4, 0.4, 0.4),
      });
      y -= 18;
      page.drawLine({
        start: { x: margin, y },
        end: { x: pageW - margin, y },
        thickness: 1,
        color: rgb(0.8, 0.8, 0.8),
      });
      y -= 16;

      // ── Student info ──────────────────────────────────────────────────────
      page.drawText(`Nama Siswa : ${student.fullName}`, { x: margin, y, size: 11, font: fontBold });
      y -= 16;
      page.drawText(`NISN       : ${student.nisn ?? "-"}`, { x: margin, y, size: 11, font: fontReg });
      y -= 20;
      page.drawLine({
        start: { x: margin, y },
        end: { x: pageW - margin, y },
        thickness: 0.5,
        color: rgb(0.85, 0.85, 0.85),
      });
      y -= 18;

      // ── Table header ──────────────────────────────────────────────────────
      const colX = { no: margin, subject: margin + 20, score: pageW - margin - 120, grade: pageW - margin - 60, status: pageW - margin - 20 };
      page.drawText("No", { x: colX.no, y, size: 9, font: fontBold, color: rgb(0.3, 0.3, 0.3) });
      page.drawText("Mata Pelajaran", { x: colX.subject, y, size: 9, font: fontBold, color: rgb(0.3, 0.3, 0.3) });
      page.drawText("Nilai", { x: colX.score, y, size: 9, font: fontBold, color: rgb(0.3, 0.3, 0.3) });
      page.drawText("Predikat", { x: colX.grade, y, size: 9, font: fontBold, color: rgb(0.3, 0.3, 0.3) });
      page.drawText("Status", { x: colX.status - 10, y, size: 9, font: fontBold, color: rgb(0.3, 0.3, 0.3) });
      y -= 14;
      page.drawLine({ start: { x: margin, y }, end: { x: pageW - margin, y }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });
      y -= 12;

      // ── Subject rows ──────────────────────────────────────────────────────
      let totalScore = 0;
      let subjectCount = 0;
      let passCount = 0;

      subjects.forEach((subj, idx) => {
        let totalWeightedScore = 0;
        let totalWeight = 0;

        for (const rubric of subj.rubricsWithMax) {
          const g = grades.find(
            (gr) => gr.student_id === student.id && gr.rubric_id === rubric.id
          );
          if (g && rubric.maxScore > 0) {
            const pct = (Number(g.score) / rubric.maxScore) * 100;
            totalWeightedScore += pct * rubric.weight;
            totalWeight += rubric.weight;
          }
        }

        const finalScore = totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 100) / 100 : null;
        const grade = finalScore !== null ? scoreToGrade(finalScore, gradeScales) : "-";
        const status = finalScore === null ? "BELUM" : finalScore >= subj.kkm ? "TUNTAS" : "REMEDIAL";

        if (finalScore !== null) {
          totalScore += finalScore;
          subjectCount++;
          if (status === "TUNTAS") passCount++;
        }

        const rowColor = idx % 2 === 0 ? rgb(0.97, 0.97, 0.97) : rgb(1, 1, 1);
        page.drawRectangle({ x: margin, y: y - 4, width: pageW - margin * 2, height: 16, color: rowColor });

        page.drawText(String(idx + 1), { x: colX.no, y, size: 9, font: fontReg });
        page.drawText(subj.name.length > 38 ? subj.name.slice(0, 37) + "…" : subj.name, { x: colX.subject, y, size: 9, font: fontReg });
        page.drawText(finalScore !== null ? String(finalScore) : "-", { x: colX.score, y, size: 9, font: fontReg });
        page.drawText(grade, { x: colX.grade, y, size: 9, font: fontBold, color: rgb(0.1, 0.4, 0.1) });
        page.drawText(status, {
          x: colX.status - 10,
          y,
          size: 8,
          font: fontBold,
          color: status === "TUNTAS" ? rgb(0.1, 0.5, 0.2) : status === "REMEDIAL" ? rgb(0.7, 0.1, 0.1) : rgb(0.5, 0.5, 0.5),
        });
        y -= 17;

        if (y < margin + 80) {
          // Simple overflow guard — future: add new page
        }
      });

      // ── Footer summary ────────────────────────────────────────────────────
      y -= 6;
      page.drawLine({ start: { x: margin, y }, end: { x: pageW - margin, y }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });
      y -= 14;
      const avgScore = subjectCount > 0 ? Math.round((totalScore / subjectCount) * 100) / 100 : 0;
      page.drawText(`Rata-rata Nilai: ${avgScore}`, { x: margin, y, size: 10, font: fontBold });
      page.drawText(`Tuntas: ${passCount}/${subjectCount} mata pelajaran`, { x: margin + 180, y, size: 10, font: fontReg, color: rgb(0.3, 0.3, 0.3) });

      y -= 20;
      page.drawText(
        `Dicetak: ${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}`,
        { x: margin, y, size: 8, font: fontReg, color: rgb(0.6, 0.6, 0.6) }
      );
    }

    const pdfBytes = await pdfDoc.save();
    const fileName = studentId
      ? `rapor-${rombel.students[0]?.fullName ?? "siswa"}-${rombel.name}.pdf`
      : `rapor-massal-${rombel.name}.pdf`;

    return new Response(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "")}"`,
      },
    });
  } catch (error) {
    console.error("Error generating rapor:", error);
    return NextResponse.json({ error: "Failed to generate rapor" }, { status: 500 });
  }
}
