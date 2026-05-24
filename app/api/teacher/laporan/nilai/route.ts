import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getStaffId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.staffId) return null;
  return session.user.staffId;
}

// GET /api/teacher/laporan/nilai
// Query params: rombelId?, subjectId?
export async function GET(request: Request) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const rombelId = searchParams.get("rombelId");
    const subjectId = searchParams.get("subjectId");

    // Get teacher's assignments
    const teacherSubjects = await prisma.teacherSubject.findMany({
      where: {
        teacher_id: staffId,
        deleted_at: null,
        ...(rombelId ? { rombel_id: BigInt(rombelId) } : {}),
        ...(subjectId ? { subject_id: BigInt(subjectId) } : {}),
      },
      include: {
        subject: { select: { id: true, name: true, code: true } },
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

    const rombelIds = teacherSubjects
      .filter((ts) => ts.rombel_id)
      .map((ts) => ts.rombel_id!);

    const subjectIds = teacherSubjects.map((ts) => ts.subject_id);

    // Get rubrics for these rombel + subjects
    const rubrics = await prisma.assessmentRubric.findMany({
      where: {
        rombel_id: { in: rombelIds },
        subject_id: { in: subjectIds },
        deleted_at: null,
      },
      include: {
        grades: {
          where: { deleted_at: null },
          select: { student_id: true, score: true },
        },
      },
    });

    // Build per-rombel per-subject summary
    type RombelSummary = {
      rombelId: string;
      rombelName: string;
      className: string;
      subjectId: string;
      subjectName: string;
      studentCount: number;
      rubricCount: number;
      studentsWithGrades: number;
      avgScore: number | null;
      passCount: number;
      passRate: number | null;
      topStudents: { id: string; fullName: string; avgScore: number }[];
      needAttention: { id: string; fullName: string; avgScore: number }[];
    };

    const summaries: RombelSummary[] = [];

    for (const ts of teacherSubjects) {
      if (!ts.rombel) continue;
      const rombel = ts.rombel;
      const tsRubrics = rubrics.filter(
        (r) => String(r.rombel_id) === String(ts.rombel_id) && String(r.subject_id) === String(ts.subject_id)
      );

      // Compute per-student weighted average
      const studentScores = new Map<string, { total: number; weight: number }>();
      for (const rubric of tsRubrics) {
        for (const grade of rubric.grades) {
          const prev = studentScores.get(grade.student_id) ?? { total: 0, weight: 0 };
          prev.total += Number(grade.score) * rubric.weight;
          prev.weight += rubric.weight;
          studentScores.set(grade.student_id, prev);
        }
      }

      const scoredStudents: { id: string; fullName: string; avgScore: number }[] = [];
      for (const student of rombel.students) {
        const sc = studentScores.get(student.id);
        if (sc && sc.weight > 0) {
          scoredStudents.push({ id: student.id, fullName: student.fullName, avgScore: Math.round((sc.total / sc.weight) * 10) / 10 });
        }
      }

      // KKM from subject (use 70 as default)
      const kkm = 70;
      const passed = scoredStudents.filter((s) => s.avgScore >= kkm);
      const avg = scoredStudents.length > 0
        ? scoredStudents.reduce((sum, s) => sum + s.avgScore, 0) / scoredStudents.length
        : null;

      const sorted = [...scoredStudents].sort((a, b) => b.avgScore - a.avgScore);

      summaries.push({
        rombelId: String(ts.rombel_id),
        rombelName: rombel.name,
        className: rombel.class.name,
        subjectId: String(ts.subject_id),
        subjectName: ts.subject.name,
        studentCount: rombel.students.length,
        rubricCount: tsRubrics.length,
        studentsWithGrades: scoredStudents.length,
        avgScore: avg !== null ? Math.round(avg * 10) / 10 : null,
        passCount: passed.length,
        passRate: scoredStudents.length > 0 ? Math.round((passed.length / scoredStudents.length) * 100) : null,
        topStudents: sorted.slice(0, 3),
        needAttention: sorted.slice(-3).reverse().filter((s) => s.avgScore < kkm),
      });
    }

    // Filters for dropdowns
    const filterRombels = teacherSubjects
      .filter((ts) => ts.rombel)
      .map((ts) => ({ id: String(ts.rombel_id), name: ts.rombel!.name, className: ts.rombel!.class.name }))
      .filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i);
    const filterSubjects = teacherSubjects
      .map((ts) => ({ id: String(ts.subject_id), name: ts.subject.name }))
      .filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i);

    // Overall stats
    const allAvg = summaries.filter((s) => s.avgScore !== null).map((s) => s.avgScore!);
    const overallAvg = allAvg.length > 0 ? allAvg.reduce((a, b) => a + b, 0) / allAvg.length : null;
    const totalPass = summaries.reduce((sum, s) => sum + s.passCount, 0);
    const totalScored = summaries.reduce((sum, s) => sum + s.studentsWithGrades, 0);

    return NextResponse.json({
      summary: {
        totalRombel: new Set(summaries.map((s) => s.rombelId)).size,
        totalSubjects: new Set(summaries.map((s) => s.subjectId)).size,
        overallAvgScore: overallAvg !== null ? Math.round(overallAvg * 10) / 10 : null,
        overallPassRate: totalScored > 0 ? Math.round((totalPass / totalScored) * 100) : null,
      },
      byClass: summaries,
      filters: { rombels: filterRombels, subjects: filterSubjects },
    });
  } catch (error) {
    console.error("Error fetching laporan nilai:", error);
    return NextResponse.json({ error: "Failed to fetch laporan nilai" }, { status: 500 });
  }
}
