import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchGradeScales, scoreToGrade } from "@/lib/grade/scale";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || (user.role !== "ADMIN" && user.role !== "EDITOR")) return null;
  return user;
}

// GET /api/admin/manajemen-akademik/nilai-rapor/[rombelId]
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ rombelId: string }> }
) {
  try {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { rombelId } = await params;

    const rombel = await prisma.rombel.findUnique({
      where: { id: BigInt(rombelId), deleted_at: null },
      include: {
        class: { select: { name: true } },
        program: { select: { name: true } },
        tahunAjaran: { select: { label: true } },
        students: {
          where: { deleted_at: null },
          orderBy: { fullName: "asc" },
          select: { id: true, fullName: true, nisn: true },
        },
        rubrics: {
          where: { deleted_at: null },
          include: {
            subject: { select: { id: true, name: true, kkm: true } },
            criteria: { where: { deleted_at: null }, orderBy: { order: "asc" } },
          },
          orderBy: [{ subject_id: "asc" }, { type: "asc" }, { name: "asc" }],
        },
      },
    });

    if (!rombel) return NextResponse.json({ error: "Rombel not found" }, { status: 404 });

    const gradeScales = await fetchGradeScales();

    // Group rubrics by subject
    const subjectMap = new Map<
      string,
      {
        id: number;
        name: string;
        kkm: number;
        rubrics: typeof rombel.rubrics;
      }
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

    const studentIds = rombel.students.map((s) => s.id);
    const rubricIds = rombel.rubrics.map((r) => r.id);

    const grades = await prisma.grade.findMany({
      where: {
        student_id: { in: studentIds },
        rubric_id: { in: rubricIds },
        deleted_at: null,
      },
      select: {
        student_id: true,
        rubric_id: true,
        score: true,
      },
    });

    // Build student × subject matrix
    const subjects = [...subjectMap.values()].map((subj) => {
      // Calculate max score for each rubric
      const rubricsWithMax = subj.rubrics.map((r) => ({
        id: r.id,
        name: r.name,
        weight: r.weight,
        maxScore: r.criteria.reduce((sum, c) => sum + parseFloat(c.max_score.toString()), 0),
      }));

      const studentRows = rombel.students.map((student) => {
        let totalWeightedScore = 0;
        let totalWeight = 0;
        const rubricScores: Record<string, number | null> = {};

        for (const rubric of rubricsWithMax) {
          const g = grades.find(
            (gr) => gr.student_id === student.id && gr.rubric_id === rubric.id
          );
          const score = g ? Number(g.score) : null;
          rubricScores[String(rubric.id)] = score;

          if (score !== null && rubric.maxScore > 0) {
            const pct = (score / rubric.maxScore) * 100;
            totalWeightedScore += pct * rubric.weight;
            totalWeight += rubric.weight;
          }
        }

        const finalScore = totalWeight > 0 ? totalWeightedScore / totalWeight : null;
        const grade = finalScore !== null ? scoreToGrade(finalScore, gradeScales) : "-";
        const status =
          finalScore === null ? "BELUM" : finalScore >= subj.kkm ? "TUNTAS" : "REMEDIAL";

        return {
          studentId: student.id,
          studentName: student.fullName,
          nisn: student.nisn ?? "",
          rubricScores,
          finalScore: finalScore !== null ? Math.round(finalScore * 100) / 100 : null,
          grade,
          status,
        };
      });

      const completedCount = studentRows.filter((r) => r.finalScore !== null).length;
      const passCount = studentRows.filter((r) => r.status === "TUNTAS").length;
      const scores = studentRows.filter((r) => r.finalScore !== null).map((r) => r.finalScore!);
      const avg = scores.length > 0 ? scores.reduce((s, v) => s + v, 0) / scores.length : null;

      return {
        subjectId: subj.id,
        subjectName: subj.name,
        kkm: subj.kkm,
        rubrics: rubricsWithMax.map((r) => ({
          id: Number(r.id),
          name: r.name,
          weight: r.weight,
          maxScore: r.maxScore,
        })),
        students: studentRows,
        stats: {
          totalStudents: rombel.students.length,
          completedCount,
          passCount,
          averageScore: avg !== null ? Math.round(avg * 100) / 100 : null,
        },
      };
    });

    return NextResponse.json({
      rombel: {
        id: Number(rombel.id),
        name: rombel.name,
        className: rombel.class.name,
        programName: rombel.program.name,
        tahunAjaranLabel: rombel.tahunAjaran?.label ?? "-",
        studentCount: rombel.students.length,
      },
      subjects,
    });
  } catch (error) {
    console.error("Error fetching rombel grades:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
