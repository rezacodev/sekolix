import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch single lesson plan detail
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; rppId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.staffRole !== "TEACHER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const staffId = session.user.staffId!;
    const { rppId: rppIdStr } = await params;
    const rppId = BigInt(rppIdStr);

    const lessonPlan = await prisma.lessonPlan.findFirst({
      where: {
        id: rppId,
        syllabus: {
          teacher_id: staffId,
          deleted_at: null,
        },
        deleted_at: null,
      },
      include: {
        syllabus: {
          select: {
            id: true,
            title: true,
            subject_id: true,
            class_id: true,
            academic_year: true,
            semester: true,
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
      syllabusId: Number(lessonPlan.syllabus_id),
      meetingNumber: lessonPlan.meeting_number,
      title: lessonPlan.title,
      learningObjectives: lessonPlan.learning_objectives,
      subjectMatter: lessonPlan.subject_matter,
      openingActivities: lessonPlan.opening_activities,
      coreActivities: lessonPlan.core_activities,
      closingActivities: lessonPlan.closing_activities,
      assessmentTechnique: lessonPlan.assessment_technique,
      assessmentInstrument: lessonPlan.assessment_instrument,
      timeAllocation: lessonPlan.time_allocation,
      mediaAndTools: lessonPlan.media_and_tools,
      learningResources: lessonPlan.learning_resources,
      teachingMethod: lessonPlan.teaching_method,
      indicators: lessonPlan.indicators,
      notes: lessonPlan.notes,
      fileUrl: lessonPlan.file_url,
      fileName: lessonPlan.file_name,
      syllabus: lessonPlan.syllabus ? {
        id: Number(lessonPlan.syllabus.id),
        title: lessonPlan.syllabus.title,
        subjectId: Number(lessonPlan.syllabus.subject_id),
        classId: Number(lessonPlan.syllabus.class_id),
        academicYear: lessonPlan.syllabus.academic_year,
        semester: lessonPlan.syllabus.semester,
        subject: {
          id: Number(lessonPlan.syllabus.subject.id),
          name: lessonPlan.syllabus.subject.name,
          code: lessonPlan.syllabus.subject.code,
        },
        class: {
          id: Number(lessonPlan.syllabus.class.id),
          name: lessonPlan.syllabus.class.name,
        },
      } : null,
    };

    return NextResponse.json({ lessonPlan: serialized });
  } catch (error) {
    console.error("Error fetching lesson plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
