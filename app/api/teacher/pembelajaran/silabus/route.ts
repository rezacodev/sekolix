/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema
const syllabusSchema = z.object({
  subjectId: z.coerce.number(),
  classId: z.coerce.number(),
  academicYear: z.string().min(1),
  semester: z.coerce.number().min(1).max(2),
  title: z.string().min(1),
  coreCompetencies: z.string().optional(),
  basicCompetencies: z.string().optional(),
  indicators: z.string().optional(),
  subjectMatter: z.string().optional(),
  learningActivities: z.string().optional(),
  assessment: z.string().optional(),
  timeAllocation: z.string().optional(),
  learningResources: z.string().optional(),
  notes: z.string().optional(),
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
});

// GET - Fetch all syllabuses for logged-in teacher
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.staffRole !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const staffId = session.user.staffId!;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const subjectId = searchParams.get("subjectId");
    const classId = searchParams.get("classId");
    const academicYear = searchParams.get("academicYear");
    const semester = searchParams.get("semester");
    const page = parseInt(searchParams.get("page") || "0");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    // If ID is provided, fetch single item
    if (id) {
      const syllabus = await prisma.syllabus.findFirst({
        where: {
          id: BigInt(id),
          teacher_id: staffId,
          deleted_at: null,
        },
        include: {
          subject: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          class: {
            select: {
              id: true,
              name: true,
            },
          },
          teacher: {
            select: {
              id: true,
              name: true,
            },
          },
          approver: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!syllabus) {
        return NextResponse.json(
          { error: "Syllabus not found" },
          { status: 404 }
        );
      }

      const serialized = {
        id: Number(syllabus.id),
        subjectId: Number(syllabus.subject_id),
        classId: Number(syllabus.class_id),
        academicYear: syllabus.academic_year,
        semester: syllabus.semester,
        title: syllabus.title,
        coreCompetencies: syllabus.core_competencies,
        basicCompetencies: syllabus.basic_competencies,
        indicators: syllabus.indicators,
        subjectMatter: syllabus.subject_matter,
        learningActivities: syllabus.learning_activities,
        assessment: syllabus.assessment,
        timeAllocation: syllabus.time_allocation,
        learningResources: syllabus.learning_resources,
        notes: syllabus.notes,
        fileUrl: syllabus.file_url,
        fileName: syllabus.file_name,
        isApproved: syllabus.is_approved,
        approvedBy: syllabus.approved_by,
        approvedAt: syllabus.approved_at?.toISOString(),
        createdAt: syllabus.created_at.toISOString(),
        updatedAt: syllabus.updated_at.toISOString(),
        subject: {
          id: Number(syllabus.subject.id),
          name: syllabus.subject.name,
          code: syllabus.subject.code,
        },
        class: {
          id: Number(syllabus.class.id),
          name: syllabus.class.name,
        },
        teacher: {
          id: syllabus.teacher.id,
          name: syllabus.teacher.name,
        },
        approver: syllabus.approver
          ? {
              id: syllabus.approver.id,
              name: syllabus.approver.name,
            }
          : null,
      };

      return NextResponse.json(serialized);
    }

    // Build where clause
    const where: any = {
      teacher_id: staffId,
      deleted_at: null,
    };

    if (subjectId) where.subject_id = BigInt(subjectId);
    if (classId) where.class_id = BigInt(classId);
    if (academicYear) where.academic_year = academicYear;
    if (semester) where.semester = parseInt(semester);

    // Get total count
    const totalCount = await prisma.syllabus.count({ where });

    const syllabuses = await prisma.syllabus.findMany({
      where,
      skip: page * pageSize,
      take: pageSize,
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            lessonPlans: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Serialize BigInt to Number
    const serialized = syllabuses.map((syllabus: any) => ({
      id: Number(syllabus.id),
      teacherId: syllabus.teacher_id,
      subjectId: Number(syllabus.subject_id),
      classId: Number(syllabus.class_id),
      academicYear: syllabus.academic_year,
      semester: syllabus.semester,
      title: syllabus.title,
      coreCompetencies: syllabus.core_competencies,
      basicCompetencies: syllabus.basic_competencies,
      indicators: syllabus.indicators,
      subjectMatter: syllabus.subject_matter,
      learningActivities: syllabus.learning_activities,
      assessment: syllabus.assessment,
      timeAllocation: syllabus.time_allocation,
      learningResources: syllabus.learning_resources,
      notes: syllabus.notes,
      fileUrl: syllabus.file_url,
      fileName: syllabus.file_name,
      isApproved: syllabus.is_approved,
      approvedBy: syllabus.approved_by,
      approvedAt: syllabus.approved_at?.toISOString(),
      createdAt: syllabus.created_at.toISOString(),
      updatedAt: syllabus.updated_at.toISOString(),
      subject: {
        id: Number(syllabus.subject.id),
        name: syllabus.subject.name,
        code: syllabus.subject.code,
      },
      class: {
        id: Number(syllabus.class.id),
        name: syllabus.class.name,
      },
      teacher: {
        id: syllabus.teacher.id,
        name: syllabus.teacher.name,
      },
      approver: syllabus.approver
        ? {
            id: syllabus.approver.id,
            name: syllabus.approver.name,
          }
        : null,
      lessonPlansCount: syllabus._count.lessonPlans,
    }));

    return NextResponse.json({ 
      items: serialized,
      totalCount,
      page,
      pageSize
    });
  } catch (error) {
    console.error("Error fetching syllabuses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new syllabus
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.staffRole !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const staffId = session.user.staffId!;
    const body = await req.json();

    // Validate input
    const validated = syllabusSchema.parse(body);

    // Verify teacher has access to this subject
    const teacherSubject = await prisma.teacherSubject.findFirst({
      where: {
        teacher_id: staffId,
        subject_id: BigInt(validated.subjectId),
        deleted_at: null,
      },
    });

    if (!teacherSubject) {
      return NextResponse.json(
        { error: "You don't have access to this subject" },
        { status: 403 }
      );
    }

    // Create syllabus
    const syllabus = await prisma.syllabus.create({
      data: {
        teacher_id: staffId,
        subject_id: BigInt(validated.subjectId),
        class_id: BigInt(validated.classId),
        academic_year: validated.academicYear,
        semester: validated.semester,
        title: validated.title,
        core_competencies: validated.coreCompetencies || null,
        basic_competencies: validated.basicCompetencies || null,
        indicators: validated.indicators || null,
        subject_matter: validated.subjectMatter || null,
        learning_activities: validated.learningActivities || null,
        assessment: validated.assessment || null,
        time_allocation: validated.timeAllocation || null,
        learning_resources: validated.learningResources || null,
        notes: validated.notes || null,
        file_url: validated.fileUrl || null,
        file_name: validated.fileName || null,
      },
      include: {
        subject: true,
        class: true,
        teacher: true,
      },
    });

    return NextResponse.json({
      message: "Silabus berhasil dibuat",
      syllabus: {
        id: Number(syllabus.id),
        subjectId: Number(syllabus.subject_id),
        classId: Number(syllabus.class_id),
        title: syllabus.title,
      },
    });
  } catch (error) {
    console.error("Error creating syllabus:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update syllabus
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.staffRole !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const staffId = session.user.staffId!;
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    // Check ownership
    const existing = await prisma.syllabus.findFirst({
      where: {
        id: BigInt(id),
        teacher_id: staffId,
        deleted_at: null,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Syllabus not found or unauthorized" },
        { status: 404 }
      );
    }

    // Validate input
    const validated = syllabusSchema.partial().parse(updateData);

    // Update syllabus
    const updated = await prisma.syllabus.update({
      where: { id: BigInt(id) },
      data: {
        subject_id: validated.subjectId
          ? BigInt(validated.subjectId)
          : undefined,
        class_id: validated.classId ? BigInt(validated.classId) : undefined,
        academic_year: validated.academicYear,
        semester: validated.semester,
        title: validated.title,
        core_competencies: validated.coreCompetencies,
        basic_competencies: validated.basicCompetencies,
        indicators: validated.indicators,
        subject_matter: validated.subjectMatter,
        learning_activities: validated.learningActivities,
        assessment: validated.assessment,
        time_allocation: validated.timeAllocation,
        learning_resources: validated.learningResources,
        notes: validated.notes,
        file_url: validated.fileUrl,
        file_name: validated.fileName,
      },
    });

    return NextResponse.json({
      message: "Silabus berhasil diupdate",
      syllabus: { id: Number(updated.id) },
    });
  } catch (error) {
    console.error("Error updating syllabus:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete syllabus
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.staffRole !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const staffId = session.user.staffId!;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    // Check ownership
    const existing = await prisma.syllabus.findFirst({
      where: {
        id: BigInt(id),
        teacher_id: staffId,
        deleted_at: null,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Syllabus not found or unauthorized" },
        { status: 404 }
      );
    }

    // Soft delete
    await prisma.syllabus.update({
      where: { id: BigInt(id) },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({ message: "Silabus berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting syllabus:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
