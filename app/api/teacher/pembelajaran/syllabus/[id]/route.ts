import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch single syllabus detail
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const { id } = await params;
    const syllabusId = BigInt(id);

    const syllabus = await prisma.syllabus.findFirst({
      where: {
        id: syllabusId,
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
        lessonPlans: {
          where: {
            deleted_at: null,
          },
          select: {
            id: true,
            title: true,
            meeting_number: true,
          },
          orderBy: {
            meeting_number: "asc",
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
      subject: {
        id: Number(syllabus.subject.id),
        name: syllabus.subject.name,
        code: syllabus.subject.code,
      },
      class: {
        id: Number(syllabus.class.id),
        name: syllabus.class.name,
      },
      lessonPlans: syllabus.lessonPlans.map((rpp) => ({
        id: Number(rpp.id),
        title: rpp.title,
        meetingNumber: rpp.meeting_number,
      })),
    };

    return NextResponse.json({ syllabus: serialized });
  } catch (error) {
    console.error("Error fetching syllabus:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
