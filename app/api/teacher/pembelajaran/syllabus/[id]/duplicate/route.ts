import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - Duplicate syllabus
export async function POST(
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

    // Parse request body
    const body = await req.json();
    const { academicYear, semester } = body;

    if (!academicYear || !semester) {
      return NextResponse.json(
        { error: "Academic year and semester are required" },
        { status: 400 }
      );
    }

    // Fetch original syllabus
    const originalSyllabus = await prisma.syllabus.findFirst({
      where: {
        id: syllabusId,
        teacher_id: staffId,
        deleted_at: null,
      },
    });

    if (!originalSyllabus) {
      return NextResponse.json(
        { error: "Syllabus not found" },
        { status: 404 }
      );
    }

    // Create duplicate
    const duplicate = await prisma.syllabus.create({
      data: {
        teacher_id: staffId,
        subject_id: originalSyllabus.subject_id,
        class_id: originalSyllabus.class_id,
        academic_year: academicYear,
        semester: semester,
        title: `${originalSyllabus.title} (Salinan)`,
        core_competencies: originalSyllabus.core_competencies,
        basic_competencies: originalSyllabus.basic_competencies,
        indicators: originalSyllabus.indicators,
        subject_matter: originalSyllabus.subject_matter,
        learning_activities: originalSyllabus.learning_activities,
        assessment: originalSyllabus.assessment,
        time_allocation: originalSyllabus.time_allocation,
        learning_resources: originalSyllabus.learning_resources,
        notes: originalSyllabus.notes,
        is_approved: false, // Reset approval status
      },
    });

    // Duplicate all related lesson plans (RPP)
    const relatedRpps = await prisma.lessonPlan.findMany({
      where: {
        syllabus_id: syllabusId,
        deleted_at: null,
      },
      orderBy: {
        meeting_number: "asc",
      },
    });

    if (relatedRpps.length > 0) {
      const rppData = relatedRpps.map((rpp) => ({
        syllabus_id: duplicate.id,
        teacher_id: staffId,
        subject_id: originalSyllabus.subject_id,
        class_id: originalSyllabus.class_id,
        academic_year: academicYear,
        semester: semester,
        meeting_number: rpp.meeting_number,
        title: `${rpp.title} (Salinan)`,
        learning_objectives: rpp.learning_objectives,
        indicators: rpp.indicators,
        subject_matter: rpp.subject_matter,
        teaching_method: rpp.teaching_method,
        media_and_tools: rpp.media_and_tools,
        learning_resources: rpp.learning_resources,
        opening_activities: rpp.opening_activities,
        core_activities: rpp.core_activities,
        closing_activities: rpp.closing_activities,
        assessment_technique: rpp.assessment_technique,
        assessment_instrument: rpp.assessment_instrument,
        time_allocation: rpp.time_allocation,
        notes: rpp.notes,
      }));

      await prisma.lessonPlan.createMany({
        data: rppData,
      });
    }

    return NextResponse.json({
      message: "Syllabus berhasil diduplikasi",
      syllabus: {
        id: Number(duplicate.id),
        title: duplicate.title,
        rppCount: relatedRpps.length,
      },
    });
  } catch (error) {
    console.error("Error duplicating syllabus:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
