/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema
const lessonPlanSchema = z.object({
  syllabusId: z.coerce.number().optional().nullable(),
  subjectId: z.coerce.number(),
  classId: z.coerce.number(),
  academicYear: z.string().min(1),
  semester: z.coerce.number().min(1).max(2),
  title: z.string().min(1),
  meetingNumber: z.coerce.number().optional().nullable(),
  timeAllocation: z.string().optional(),
  learningObjectives: z.string().min(1),
  indicators: z.string().optional(),
  subjectMatter: z.string().optional(),
  teachingMethod: z.string().optional(),
  mediaAndTools: z.string().optional(),
  learningResources: z.string().optional(),
  openingActivities: z.string().optional(),
  coreActivities: z.string().optional(),
  closingActivities: z.string().optional(),
  assessmentTechnique: z.string().optional(),
  assessmentInstrument: z.string().optional(),
  notes: z.string().optional(),
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
});

// GET - Fetch all lesson plans for logged-in teacher
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
    const syllabusId = searchParams.get("syllabusId");
    const page = parseInt(searchParams.get("page") || "0");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    // If ID is provided, fetch single item
    if (id) {
      const lessonPlan = await prisma.lessonPlan.findFirst({
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
          syllabus: {
            select: {
              id: true,
              title: true,
              academic_year: true,
              semester: true,
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

      if (!lessonPlan) {
        return NextResponse.json(
          { error: "Lesson plan not found" },
          { status: 404 }
        );
      }

      const serialized = {
        id: Number(lessonPlan.id),
        syllabusId: lessonPlan.syllabus_id ? Number(lessonPlan.syllabus_id) : null,
        subjectId: Number(lessonPlan.subject_id),
        classId: Number(lessonPlan.class_id),
        academicYear: lessonPlan.academic_year,
        semester: lessonPlan.semester,
        title: lessonPlan.title,
        meetingNumber: lessonPlan.meeting_number,
        timeAllocation: lessonPlan.time_allocation,
        learningObjectives: lessonPlan.learning_objectives,
        indicators: lessonPlan.indicators,
        subjectMatter: lessonPlan.subject_matter,
        teachingMethod: lessonPlan.teaching_method,
        mediaAndTools: lessonPlan.media_and_tools,
        learningResources: lessonPlan.learning_resources,
        openingActivities: lessonPlan.opening_activities,
        coreActivities: lessonPlan.core_activities,
        closingActivities: lessonPlan.closing_activities,
        assessmentTechnique: lessonPlan.assessment_technique,
        assessmentInstrument: lessonPlan.assessment_instrument,
        notes: lessonPlan.notes,
        fileUrl: lessonPlan.file_url,
        fileName: lessonPlan.file_name,
        isApproved: lessonPlan.is_approved,
        approvedBy: lessonPlan.approved_by,
        approvedAt: lessonPlan.approved_at?.toISOString(),
        createdAt: lessonPlan.created_at.toISOString(),
        updatedAt: lessonPlan.updated_at.toISOString(),
        subject: {
          id: Number(lessonPlan.subject.id),
          name: lessonPlan.subject.name,
          code: lessonPlan.subject.code,
        },
        class: {
          id: Number(lessonPlan.class.id),
          name: lessonPlan.class.name,
        },
        syllabus: lessonPlan.syllabus
          ? {
              id: Number(lessonPlan.syllabus.id),
              title: lessonPlan.syllabus.title,
              academicYear: lessonPlan.syllabus.academic_year,
              semester: lessonPlan.syllabus.semester,
            }
          : null,
        teacher: {
          id: lessonPlan.teacher.id,
          name: lessonPlan.teacher.name,
        },
        approver: lessonPlan.approver
          ? {
              id: lessonPlan.approver.id,
              name: lessonPlan.approver.name,
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
    if (syllabusId) where.syllabus_id = BigInt(syllabusId);

    // Get total count
    const totalCount = await prisma.lessonPlan.count({ where });

    const lessonPlans = await prisma.lessonPlan.findMany({
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
        syllabus: {
          select: {
            id: true,
            title: true,
            academic_year: true,
            semester: true,
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
      orderBy: [{ created_at: "desc" }],
    });

    // Serialize BigInt to Number
    const serialized = lessonPlans.map((plan: any) => ({
      id: Number(plan.id),
      syllabusId: plan.syllabus_id ? Number(plan.syllabus_id) : null,
      teacherId: plan.teacher_id,
      subjectId: Number(plan.subject_id),
      classId: Number(plan.class_id),
      academicYear: plan.academic_year,
      semester: plan.semester,
      title: plan.title,
      meetingNumber: plan.meeting_number,
      timeAllocation: plan.time_allocation,
      learningObjectives: plan.learning_objectives,
      indicators: plan.indicators,
      subjectMatter: plan.subject_matter,
      teachingMethod: plan.teaching_method,
      mediaAndTools: plan.media_and_tools,
      learningResources: plan.learning_resources,
      openingActivities: plan.opening_activities,
      coreActivities: plan.core_activities,
      closingActivities: plan.closing_activities,
      assessmentTechnique: plan.assessment_technique,
      assessmentInstrument: plan.assessment_instrument,
      notes: plan.notes,
      fileUrl: plan.file_url,
      fileName: plan.file_name,
      isApproved: plan.is_approved,
      approvedBy: plan.approved_by,
      approvedAt: plan.approved_at?.toISOString(),
      createdAt: plan.created_at.toISOString(),
      updatedAt: plan.updated_at.toISOString(),
      subject: {
        id: Number(plan.subject.id),
        name: plan.subject.name,
        code: plan.subject.code,
      },
      class: {
        id: Number(plan.class.id),
        name: plan.class.name,
      },
      syllabus: plan.syllabus
        ? {
            id: Number(plan.syllabus.id),
            title: plan.syllabus.title,
            academicYear: plan.syllabus.academic_year,
            semester: plan.syllabus.semester,
          }
        : null,
      teacher: {
        id: plan.teacher.id,
        name: plan.teacher.name,
      },
      approver: plan.approver
        ? {
            id: plan.approver.id,
            name: plan.approver.name,
          }
        : null,
    }));

    return NextResponse.json({ 
      items: serialized,
      totalCount,
      page,
      pageSize
    });
  } catch (error) {
    console.error("Error fetching lesson plans:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new lesson plan
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.staffRole !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const staffId = session.user.staffId!;
    const body = await req.json();

    // Validate input
    const validated = lessonPlanSchema.parse(body);

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

    // Create lesson plan
    const lessonPlan = await prisma.lessonPlan.create({
      data: {
        teacher_id: staffId,
        syllabus_id: validated.syllabusId ? BigInt(validated.syllabusId) : null,
        subject_id: BigInt(validated.subjectId),
        class_id: BigInt(validated.classId),
        academic_year: validated.academicYear,
        semester: validated.semester,
        title: validated.title,
        meeting_number: validated.meetingNumber || null,
        time_allocation: validated.timeAllocation || null,
        learning_objectives: validated.learningObjectives,
        indicators: validated.indicators || null,
        subject_matter: validated.subjectMatter || null,
        teaching_method: validated.teachingMethod || null,
        media_and_tools: validated.mediaAndTools || null,
        learning_resources: validated.learningResources || null,
        opening_activities: validated.openingActivities || null,
        core_activities: validated.coreActivities || null,
        closing_activities: validated.closingActivities || null,
        assessment_technique: validated.assessmentTechnique || null,
        assessment_instrument: validated.assessmentInstrument || null,
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
      message: "RPP berhasil dibuat",
      lessonPlan: {
        id: Number(lessonPlan.id),
        subjectId: Number(lessonPlan.subject_id),
        classId: Number(lessonPlan.class_id),
        title: lessonPlan.title,
      },
    });
  } catch (error) {
    console.error("Error creating lesson plan:", error);
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

// PUT - Update lesson plan
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
    const existing = await prisma.lessonPlan.findFirst({
      where: {
        id: BigInt(id),
        teacher_id: staffId,
        deleted_at: null,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Lesson plan not found or unauthorized" },
        { status: 404 }
      );
    }

    // Validate input
    const validated = lessonPlanSchema.partial().parse(updateData);

    // Update lesson plan
    const updated = await prisma.lessonPlan.update({
      where: { id: BigInt(id) },
      data: {
        syllabus_id: validated.syllabusId !== undefined
          ? validated.syllabusId
            ? BigInt(validated.syllabusId)
            : null
          : undefined,
        subject_id: validated.subjectId
          ? BigInt(validated.subjectId)
          : undefined,
        class_id: validated.classId ? BigInt(validated.classId) : undefined,
        academic_year: validated.academicYear,
        semester: validated.semester !== undefined
          ? validated.semester
          : undefined,
        title: validated.title,
        meeting_number: validated.meetingNumber !== undefined
          ? validated.meetingNumber
          : undefined,
        time_allocation: validated.timeAllocation,
        learning_objectives: validated.learningObjectives,
        indicators: validated.indicators,
        subject_matter: validated.subjectMatter,
        teaching_method: validated.teachingMethod,
        media_and_tools: validated.mediaAndTools,
        learning_resources: validated.learningResources,
        opening_activities: validated.openingActivities,
        core_activities: validated.coreActivities,
        closing_activities: validated.closingActivities,
        assessment_technique: validated.assessmentTechnique,
        assessment_instrument: validated.assessmentInstrument,
        notes: validated.notes,
        file_url: validated.fileUrl,
        file_name: validated.fileName,
      },
    });

    return NextResponse.json({
      message: "RPP berhasil diupdate",
      lessonPlan: { id: Number(updated.id) },
    });
  } catch (error) {
    console.error("Error updating lesson plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete lesson plan
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
    const existing = await prisma.lessonPlan.findFirst({
      where: {
        id: BigInt(id),
        teacher_id: staffId,
        deleted_at: null,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Lesson plan not found or unauthorized" },
        { status: 404 }
      );
    }

    // Soft delete
    await prisma.lessonPlan.update({
      where: { id: BigInt(id) },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({ message: "RPP berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting lesson plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
