import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

// GET - Fetch grades untuk input nilai
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

    // Verify teacher mengampu rombel & subject ini
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

    // Get rombel info
    const rombel = await prisma.rombel.findUnique({
      where: { id: BigInt(rombelId) },
      include: {
        class: { select: { name: true } },
        students: {
          where: { deleted_at: null },
          orderBy: { fullName: "asc" }
        }
      }
    });

    if (!rombel) {
      return NextResponse.json(
        { error: "Rombel not found" },
        { status: 404 }
      );
    }

    // Get subject info with KKM
    const subject = await prisma.subject.findUnique({
      where: { id: BigInt(subjectId) },
      select: { 
        id: true, 
        name: true,
        kkm: true
      }
    });

    if (!subject) {
      return NextResponse.json(
        { error: "Subject not found" },
        { status: 404 }
      );
    }

    // Use subject KKM or default to 75
    const kkm = subject.kkm || 75;

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

    // Use teacher-defined weights, fallback to dynamic calculation if needed
    const rubricsWithWeights = rubrics.map(rubric => {
      const rubricTotal = rubric.criteria.reduce((sum, criterion) => {
        return sum + parseFloat(criterion.max_score.toString());
      }, 0);

      return {
        ...rubric,
        weight: rubric.weight, // Use teacher-defined weight
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
        rubric: {
          include: {
            criteria: {
              where: { deleted_at: null },
              orderBy: { order: "asc" }
            }
          }
        },
        rubricScores: {
          include: {
            rubricCriterion: true
          }
        }
      }
    });

    // Build grade map for quick lookup
    const gradeMap = new Map<string, typeof grades[0]>();
    grades.forEach(g => {
      const key = `${g.student_id}-${g.rubric_id}`;
      gradeMap.set(key, g);
    });

    // Format response
    const students = rombel.students.map(student => {
      const studentGrades: Record<string, number | null> = {};
      let totalWeightedScore = 0;
      let totalWeight = 0;

      rubricsWithWeights.forEach(rubric => {
        const key = `${student.id}-${rubric.id}`;
        const grade = gradeMap.get(key);
        const score = grade?.score;
        studentGrades[`rubric_${rubric.id}`] = score ? Number(score) : null;

        if (score) {
          // Convert score to percentage first, then apply weight
          const scorePercentage = (Number(score) / rubric.maxScore) * 100;
          totalWeightedScore += scorePercentage * rubric.weight;
          totalWeight += rubric.weight;
        }
      });

      const finalScore = totalWeight > 0 ? totalWeightedScore / totalWeight : null;

      return {
        id: student.id,
        fullName: student.fullName,
        nisn: student.nisn,
        registrationCode: student.registrationCode,
        grades: studentGrades,
        finalScore: finalScore ? Math.round(finalScore * 100) / 100 : null,
        isPassing: finalScore ? finalScore >= kkm : null
      };
    });

    return NextResponse.json({
      rombel: {
        id: Number(rombel.id),
        name: rombel.name,
        className: rombel.class.name
      },
      subject: {
        id: Number(subject?.id),
        name: subject?.name,
        kkm: kkm
      },
      rubrics: rubricsWithWeights.map(r => ({
        id: Number(r.id),
        name: r.name,
        type: r.type,
        weight: r.weight,
        maxScore: r.maxScore,
        criteria: r.criteria.map(c => ({
          id: Number(c.id),
          name: c.name,
          description: c.description,
          max_score: parseFloat(c.max_score.toString()),
          order: c.order
        }))
      })),
      students
    });
  } catch (error) {
    console.error("Error fetching grades:", error);
    return NextResponse.json(
      { error: "Failed to fetch grades" },
      { status: 500 }
    );
  }
}

// POST - Save or update grade
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

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

    const body = await request.json();
    const { studentId, rubricId, rubricScores, rombelId, subjectId } = body;

    if (!studentId || !rubricId || !rubricScores) {
      return NextResponse.json(
        { error: "studentId, rubricId, and rubricScores are required" },
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
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // Get rubric with criteria
    const rubric = await prisma.assessmentRubric.findUnique({
      where: { id: BigInt(rubricId) },
      include: { criteria: true }
    });

    if (!rubric) {
      return NextResponse.json(
        { error: "Rubric not found" },
        { status: 404 }
      );
    }

    // Find or create assessment for this rubric
    let assessment = await prisma.assessment.findFirst({
      where: {
        subject_id: rubric.subject_id,
        title: rubric.name,
        type: rubric.type,
        deleted_at: null
      }
    });

    if (!assessment) {
      assessment = await prisma.assessment.create({
        data: {
          title: rubric.name,
          type: rubric.type,
          subject_id: rubric.subject_id,
          weight: rubric.weight,
          max_score: rubric.max_score
        }
      });
    }

    // Validate rubric scores
    let totalScore = 0;
    for (const criterion of rubric.criteria) {
      const score = rubricScores[criterion.id.toString()];
      if (score === undefined || score === null) {
        return NextResponse.json(
          { error: `Score for criterion ${criterion.name} is required` },
          { status: 400 }
        );
      }

      const scoreNum = parseFloat(score);
      if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > Number(criterion.max_score)) {
        return NextResponse.json(
          { error: `Score for ${criterion.name} must be between 0 and ${Number(criterion.max_score)}` },
          { status: 400 }
        );
      }

      totalScore += scoreNum;
    }

    // Validate total score against rubric max score
    const rubricMaxScore = rubric.criteria.reduce((sum, criterion) => {
      return sum + parseFloat(criterion.max_score.toString());
    }, 0);

    if (totalScore > rubricMaxScore) {
      return NextResponse.json(
        { error: `Total rubric score (${totalScore}) exceeds rubric max score (${rubricMaxScore})` },
        { status: 400 }
      );
    }

    // Save grade and rubric scores in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Upsert grade with total score (using rubric_id as primary identifier)
      const grade = await tx.grade.upsert({
        where: {
          student_id_rubric_id: {
            student_id: studentId,
            rubric_id: BigInt(rubricId)
          }
        },
        create: {
          student_id: studentId,
          assessment_id: assessment.id,
          rubric_id: BigInt(rubricId),
          score: totalScore
        },
        update: {
          score: totalScore,
          updated_at: new Date()
        }
      });

      // Delete existing rubric scores for this grade
      await tx.rubricScore.deleteMany({
        where: { grade_id: grade.id }
      });

      // Create new rubric scores
      const rubricScoreCreates = rubric.criteria.map(criterion => ({
        grade_id: grade.id,
        rubric_criterion_id: criterion.id,
        score: parseFloat(rubricScores[criterion.id.toString()])
      }));

      await tx.rubricScore.createMany({
        data: rubricScoreCreates
      });

      return grade;
    });

    return NextResponse.json({
      success: true,
      grade: {
        id: Number(result.id),
        studentId: result.student_id,
        assessmentId: Number(result.assessment_id),
        score: Number(result.score),
        rubricId: Number(result.rubric_id)
      }
    });
  } catch (error) {
    console.error("Error saving grade:", error);
    return NextResponse.json(
      { error: "Failed to save grade" },
      { status: 500 }
    );
  }
}
