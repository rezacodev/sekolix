import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - Duplicate lesson plan
export async function POST(
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

    // Parse request body
    const body = await req.json();
    const { academicYear, semester } = body;

    if (!academicYear || !semester) {
      return NextResponse.json(
        { error: "Academic year and semester are required" },
        { status: 400 }
      );
    }

    // Fetch original lesson plan
    const originalRpp = await prisma.lessonPlan.findFirst({
      where: {
        id: rppId,
        teacher_id: staffId,
        deleted_at: null,
      },
    });

    if (!originalRpp) {
      return NextResponse.json(
        { error: "Lesson plan not found" },
        { status: 404 }
      );
    }

    // Check if academic year and semester changed
    const isChanged = 
      originalRpp.academic_year !== academicYear || 
      originalRpp.semester !== semester;

    // If year/semester changed, set syllabus_id to null (standalone RPP)
    const newSyllabusId = isChanged ? null : originalRpp.syllabus_id;

    // Get next meeting number for the same academic year and semester
    const lastRpp = await prisma.lessonPlan.findFirst({
      where: {
        teacher_id: staffId,
        subject_id: originalRpp.subject_id,
        class_id: originalRpp.class_id,
        academic_year: academicYear,
        semester: semester,
        deleted_at: null,
      },
      orderBy: {
        meeting_number: "desc",
      },
    });

    const nextMeetingNumber = lastRpp && lastRpp.meeting_number ? lastRpp.meeting_number + 1 : 1;

    // Create duplicate
    const duplicate = await prisma.lessonPlan.create({
      data: {
        syllabus_id: newSyllabusId,
        teacher_id: originalRpp.teacher_id,
        subject_id: originalRpp.subject_id,
        class_id: originalRpp.class_id,
        academic_year: academicYear,
        semester: semester,
        meeting_number: nextMeetingNumber,
        title: `${originalRpp.title} (Salinan)`,
        learning_objectives: originalRpp.learning_objectives,
        indicators: originalRpp.indicators,
        subject_matter: originalRpp.subject_matter,
        teaching_method: originalRpp.teaching_method,
        media_and_tools: originalRpp.media_and_tools,
        learning_resources: originalRpp.learning_resources,
        opening_activities: originalRpp.opening_activities,
        core_activities: originalRpp.core_activities,
        closing_activities: originalRpp.closing_activities,
        assessment_technique: originalRpp.assessment_technique,
        assessment_instrument: originalRpp.assessment_instrument,
        time_allocation: originalRpp.time_allocation,
        notes: originalRpp.notes,
      },
    });

    return NextResponse.json({
      message: "RPP berhasil diduplikasi",
      lessonPlan: {
        id: Number(duplicate.id),
        title: duplicate.title,
        meetingNumber: duplicate.meeting_number,
      },
    });
  } catch (error) {
    console.error("Error duplicating lesson plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
