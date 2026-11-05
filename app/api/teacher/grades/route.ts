import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTeacherAcademicScope, teacherCanAccessStudents } from "@/lib/api/scope";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { z } from "zod";

const gradeQuerySchema = z.object({
  assessmentId: z.coerce.bigint().optional(),
  subjectId: z.coerce.bigint().optional(),
  studentId: z.string().min(1).optional(),
});

const gradePayloadSchema = z.object({
  assessmentId: z.coerce.bigint(),
  studentId: z.string().min(1),
  score: z.coerce.number().min(0),
  notes: z.string().max(1000).optional().nullable(),
});

const batchGradePayloadSchema = z.object({
  assessmentId: z.coerce.bigint(),
  grades: z
    .array(
      z.object({
        studentId: z.string().min(1),
        score: z.coerce.number().min(0),
        notes: z.string().max(1000).optional().nullable(),
      })
    )
    .min(1)
    .max(200),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.staffId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacherId = session.user.staffId;
    const { searchParams } = new URL(request.url);
    const parsedQuery = gradeQuerySchema.safeParse(Object.fromEntries(searchParams));
    if (!parsedQuery.success) {
      return NextResponse.json({ error: "Invalid query", details: parsedQuery.error.flatten() }, { status: 400 });
    }

    const { assessmentId, subjectId, studentId } = parsedQuery.data;
    const scope = await getTeacherAcademicScope(teacherId);

    if (studentId) {
      const studentAccess = await teacherCanAccessStudents(teacherId, [studentId]);
      if (!studentAccess.ok) {
        return NextResponse.json({ error: "Student outside teacher scope" }, { status: 403 });
      }
    }

    if (!scope.rombelIds.length) {
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
      });
    }

    // Get teacher's subjects
    const teacherSubjects = await prisma.teacherSubject.findMany({
      where: {
        teacher_id: teacherId,
        deleted_at: null,
        ...(subjectId ? { subject_id: subjectId } : {}),
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
        ...(assessmentId ? { id: assessmentId } : {}),
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
        student: {
          rombels: {
            some: { id: { in: scope.rombelIds }, deleted_at: null },
          },
        },
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
    const actorUserId = session.user.id;
    const actorName = session.user.name;
    const parsedBody = gradePayloadSchema.safeParse(await request.json());
    if (!parsedBody.success) {
      return NextResponse.json({ error: "Validation error", details: parsedBody.error.flatten() }, { status: 400 });
    }

    const { assessmentId, studentId, score, notes } = parsedBody.data;

    // Verify teacher has access to this assessment
    const assessment = await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
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

    const studentAccess = await teacherCanAccessStudents(teacherId, [studentId]);
    if (!studentAccess.ok) {
      return NextResponse.json({ error: "Student outside teacher scope" }, { status: 403 });
    }

    // Validate score doesn't exceed max_score
    const scoreValue = score;
    const maxScore = assessment.max_score ? parseFloat(assessment.max_score.toString()) : 100;

    if (scoreValue > maxScore) {
      return NextResponse.json(
        { error: `Score cannot exceed ${maxScore}` },
        { status: 400 }
      );
    }

    const before = await prisma.grade.findUnique({
      where: {
        student_id_assessment_id: {
          student_id: studentId,
          assessment_id: assessmentId,
        },
      },
    });

    // Create or update grade
    const grade = await prisma.grade.upsert({
      where: {
        student_id_assessment_id: {
          student_id: studentId,
          assessment_id: assessmentId,
        },
      },
      create: {
        student_id: studentId,
        assessment_id: assessmentId,
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

    await logActivity({
      actorUserId,
      actorName,
      module: "teacher.nilai",
      action: "upsert",
      entityType: "Grade",
      entityId: String(grade.id),
      metadata: {
        assessmentId: String(assessment.id),
        studentId,
        score: scoreValue,
      },
      request,
    });
    await writeAuditTrail({
      actorUserId,
      entityType: "Grade",
      entityId: String(grade.id),
      action: before ? "update" : "create",
      before,
      after: grade,
      reason: "Teacher grade upsert",
      metadata: {
        assessmentId: String(assessment.id),
        studentId,
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
    const actorUserId = session.user.id;
    const actorName = session.user.name;
    const parsedBody = batchGradePayloadSchema.safeParse(await request.json());
    if (!parsedBody.success) {
      return NextResponse.json({ error: "Validation error", details: parsedBody.error.flatten() }, { status: 400 });
    }

    const { assessmentId, grades } = parsedBody.data;

    // Verify teacher has access to this assessment
    const assessment = await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
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

    const studentAccess = await teacherCanAccessStudents(
      teacherId,
      grades.map((grade) => grade.studentId)
    );
    if (!studentAccess.ok) {
      return NextResponse.json({ error: "One or more students are outside teacher scope" }, { status: 403 });
    }

    const maxScore = assessment.max_score ? parseFloat(assessment.max_score.toString()) : 100;
    const beforeGrades = await prisma.grade.findMany({
      where: {
        assessment_id: assessmentId,
        student_id: { in: grades.map((grade) => grade.studentId) },
      },
    });
    const beforeByStudentId = new Map(beforeGrades.map((grade) => [grade.student_id, grade]));

    // Batch upsert grades
    const results = await Promise.all(
      grades.map(async (gradeData) => {
        const { studentId, score, notes } = gradeData;
        const scoreValue = score;

        if (scoreValue > maxScore) {
          throw new Error(`Score for student ${studentId} exceeds max score ${maxScore}`);
        }

        return prisma.grade.upsert({
          where: {
            student_id_assessment_id: {
              student_id: studentId,
              assessment_id: assessmentId,
            },
          },
          create: {
            student_id: studentId,
            assessment_id: assessmentId,
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

    await logActivity({
      actorUserId,
      actorName,
      module: "teacher.nilai",
      action: "batch-upsert",
      entityType: "Assessment",
      entityId: String(assessment.id),
      metadata: {
        assessmentId: String(assessment.id),
        count: results.length,
        studentIds: grades.map((grade) => grade.studentId),
      },
      request,
    });
    await Promise.all(
      results.map((grade) =>
        writeAuditTrail({
          actorUserId,
          entityType: "Grade",
          entityId: String(grade.id),
          action: beforeByStudentId.has(grade.student_id) ? "update" : "create",
          before: beforeByStudentId.get(grade.student_id),
          after: grade,
          reason: "Teacher grade batch upsert",
          metadata: {
            assessmentId: String(assessment.id),
            studentId: grade.student_id,
          },
        })
      )
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
