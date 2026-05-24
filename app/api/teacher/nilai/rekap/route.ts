import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchGradeScales, scoreToGrade } from "@/lib/grade/scale";

// GET - Fetch grade analysis for rekap
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

    const kkm = subject.kkm || 75;
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

    const allScores: number[] = [];

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
      const status = finalScore >= kkm ? "TUNTAS" : "REMEDIAL";

      studentGrades.push({
        studentId: student.id,
        studentName: student.fullName,
        nisn: student.nisn || "",
        grades: studentGradeData,
        finalScore,
        grade,
        status
      });

      allScores.push(finalScore);
    }

    // Calculate statistics
    const averageScore = allScores.length > 0 ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length : 0;
    const highestScore = allScores.length > 0 ? Math.max(...allScores) : 0;
    const lowestScore = allScores.length > 0 ? Math.min(...allScores) : 0;
    const passRate = allScores.length > 0 ? (studentGrades.filter(s => s.status === "TUNTAS").length / allScores.length) * 100 : 0;

    // Calculate standard deviation
    const variance = allScores.length > 0
      ? allScores.reduce((sum, score) => sum + Math.pow(score - averageScore, 2), 0) / allScores.length
      : 0;
    const standardDeviation = Math.sqrt(variance);

    // Calculate grade distribution by score ranges
    const gradeDistribution = {
      "90-100": studentGrades.filter(s => s.finalScore >= 90).length,
      "80-89": studentGrades.filter(s => s.finalScore >= 80 && s.finalScore < 90).length,
      "70-79": studentGrades.filter(s => s.finalScore >= 70 && s.finalScore < 80).length,
      "60-69": studentGrades.filter(s => s.finalScore >= 60 && s.finalScore < 70).length,
      "0-59": studentGrades.filter(s => s.finalScore < 60).length,
    };

    // Get students below KKM
    const studentsBelowKKM = studentGrades
      .filter(s => s.status === "REMEDIAL")
      .sort((a, b) => a.finalScore - b.finalScore)
      .map(s => ({
        id: s.studentId,
        fullName: s.studentName,
        nisn: s.nisn,
        finalScore: s.finalScore,
        grade: s.grade,
        status: s.status,
        assessments: rubricsWithMaxScore.map(rubric => ({
          name: rubric.name,
          score: s.grades[rubric.name] || 0,
          maxScore: rubric.maxScore,
          weight: rubric.weight
        }))
      }));

    // Get top performers (top 10% from students who passed)
    const passedStudents = studentGrades.filter(s => s.status === "TUNTAS");
    const topPerformerCount = Math.max(1, Math.ceil(passedStudents.length * 0.1));
    const topPerformers = passedStudents
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, topPerformerCount)
      .map(s => ({
        id: s.studentId,
        fullName: s.studentName,
        nisn: s.nisn,
        finalScore: s.finalScore,
        grade: s.grade,
        status: s.status,
        assessments: rubricsWithMaxScore.map(rubric => ({
          name: rubric.name,
          score: s.grades[rubric.name] || 0,
          maxScore: rubric.maxScore,
          weight: rubric.weight
        }))
      }));

    const stats = {
      className: `${rombel.name} - ${rombel.class.name}`,
      subjectName: subject.name,
      kkm,
      totalStudents: rombel.students.length,
      averageScore: Math.round(averageScore * 100) / 100,
      highestScore: Math.round(highestScore * 100) / 100,
      lowestScore: Math.round(lowestScore * 100) / 100,
      passRate: Math.round(passRate * 100) / 100,
      standardDeviation: Math.round(standardDeviation * 100) / 100,
      gradeDistribution
    };

    return NextResponse.json({
      stats,
      studentsBelowKKM,
      topPerformers,
      assessments: rubricsWithMaxScore.map(a => ({
        id: Number(a.id),
        name: a.name,
        weight: a.weight,
        maxScore: a.maxScore
      }))
    });
  } catch (error) {
    console.error("Error fetching grade analysis:", error);
    return NextResponse.json(
      { error: "Failed to fetch grade analysis" },
      { status: 500 }
    );
  }
}

