import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.staffId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacherId = session.user.staffId;
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get("assessmentId");
    const subjectId = searchParams.get("subjectId");
    const studentId = searchParams.get("studentId");

    // Get teacher's subjects
    const teacherSubjects = await prisma.teacherSubject.findMany({
      where: {
        teacher_id: teacherId,
        deleted_at: null,
        ...(subjectId ? { subject_id: BigInt(subjectId) } : {}),
      },
      select: {
        subject_id: true,
      },
    });

    const subjectIds = teacherSubjects.map(ts => ts.subject_id);

    if (subjectIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
      });
    }

    // Get assessments for these subjects
    const assessments = await prisma.assessment.findMany({
      where: {
        subject_id: {
          in: subjectIds,
        },
        deleted_at: null,
        ...(assessmentId ? { id: BigInt(assessmentId) } : {}),
      },
      include: {
        subject: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Get grades for these assessments
    const assessmentIds = assessments.map(a => a.id);
    const grades = await prisma.grade.findMany({
      where: {
        assessment_id: {
          in: assessmentIds,
        },
        ...(studentId ? { student_id: studentId } : {}),
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            nisn: true,
            rombels: {
              include: {
                class: true,
              },
              take: 1,
            },
          },
        },
      },
    });

    const formattedGrades = grades.map((grade) => {
      const assessment = assessments.find(a => a.id === grade.assessment_id);
      const rombel = grade.student.rombels[0];
      
      return {
        id: grade.id.toString(),
        score: grade.score,
        notes: grade.notes,
        assessment: {
          id: assessment?.id.toString() || "",
          title: assessment?.title || "",
          type: assessment?.type || "",
          weight: assessment?.weight || 0,
          maxScore: assessment?.max_score || 100,
        },
        subject: {
          id: assessment?.subject.id.toString() || "",
          name: assessment?.subject.name || "",
        },
        student: {
          id: grade.student.id,
          name: grade.student.fullName,
          nisn: grade.student.nisn,
          nis: grade.student.nisn, // Use nisn as nis
          class: rombel?.class?.name || "-",
          rombel: rombel?.name || "-",
        },
        createdAt: grade.created_at,
        updatedAt: grade.updated_at,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedGrades,
      total: formattedGrades.length,
    });
  } catch (error) {
    console.error("Error fetching grades:", error);
    return NextResponse.json(
      { error: "Failed to fetch grades" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.staffId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacherId = session.user.staffId;
    const body = await request.json();

    const { assessmentId, studentId, score, notes } = body;

    // Validate required fields
    if (!assessmentId || !studentId || score === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: assessmentId, studentId, score" },
        { status: 400 }
      );
    }

    // Verify teacher has access to this assessment
    const assessment = await prisma.assessment.findFirst({
      where: {
        id: BigInt(assessmentId),
        deleted_at: null,
        subject: {
          teacherSubjects: {
            some: {
              teacher_id: teacherId,
              deleted_at: null,
            },
          },
        },
      },
      include: {
        subject: true,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found or unauthorized" },
        { status: 404 }
      );
    }

    // Validate score doesn't exceed max_score
    const scoreValue = parseFloat(score);
    const maxScore = assessment.max_score ? parseFloat(assessment.max_score.toString()) : 100;

    if (scoreValue > maxScore) {
      return NextResponse.json(
        { error: `Score cannot exceed ${maxScore}` },
        { status: 400 }
      );
    }

    // Create or update grade
    const grade = await prisma.grade.upsert({
      where: {
        student_id_assessment_id: {
          student_id: studentId,
          assessment_id: BigInt(assessmentId),
        },
      },
      create: {
        student_id: studentId,
        assessment_id: BigInt(assessmentId),
        score: scoreValue,
        notes: notes || null,
      },
      update: {
        score: scoreValue,
        notes: notes || null,
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            nisn: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Grade saved successfully",
      data: {
        id: grade.id.toString(),
        score: grade.score,
        notes: grade.notes,
        student: {
          id: grade.student.id,
          name: grade.student.fullName,
          nisn: grade.student.nisn,
        },
        assessment: {
          id: assessment.id.toString(),
          title: assessment.title,
          subject: assessment.subject.name,
        },
      },
    });
  } catch (error) {
    console.error("Error saving grade:", error);
    return NextResponse.json(
      { error: "Failed to save grade" },
      { status: 500 }
    );
  }
}

// Batch update grades
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.staffId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacherId = session.user.staffId;
    const body = await request.json();

    const { assessmentId, grades } = body;

    if (!assessmentId || !Array.isArray(grades) || grades.length === 0) {
      return NextResponse.json(
        { error: "Invalid request: assessmentId and grades array required" },
        { status: 400 }
      );
    }

    // Verify teacher has access to this assessment
    const assessment = await prisma.assessment.findFirst({
      where: {
        id: BigInt(assessmentId),
        deleted_at: null,
        subject: {
          teacherSubjects: {
            some: {
              teacher_id: teacherId,
              deleted_at: null,
            },
          },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found or unauthorized" },
        { status: 404 }
      );
    }

    const maxScore = assessment.max_score ? parseFloat(assessment.max_score.toString()) : 100;

    // Batch upsert grades
    const results = await Promise.all(
      grades.map(async (gradeData) => {
        const { studentId, score, notes } = gradeData;
        const scoreValue = parseFloat(score);

        if (scoreValue > maxScore) {
          throw new Error(`Score for student ${studentId} exceeds max score ${maxScore}`);
        }

        return prisma.grade.upsert({
          where: {
            student_id_assessment_id: {
              student_id: studentId,
              assessment_id: BigInt(assessmentId),
            },
          },
          create: {
            student_id: studentId,
            assessment_id: BigInt(assessmentId),
            score: scoreValue,
            notes: notes || null,
          },
          update: {
            score: scoreValue,
            notes: notes || null,
          },
        });
      })
    );

    return NextResponse.json({
      success: true,
      message: `Successfully saved ${results.length} grades`,
      data: {
        count: results.length,
      },
    });
  } catch (error) {
    console.error("Error batch saving grades:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save grades" },
      { status: 500 }
    );
  }
}
