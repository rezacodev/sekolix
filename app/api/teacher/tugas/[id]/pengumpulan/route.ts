import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Get submissions for an assignment
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Get assignment detail
    const assignment = await prisma.assignment.findUnique({
      where: { id: BigInt(id) },
      include: {
        rombel: {
          include: {
            class: { select: { id: true, name: true } },
            students: {
              select: {
                id: true,
                fullName: true,
                registrationCode: true,
              },
              orderBy: { fullName: 'asc' }
            }
          }
        },
        subject: { select: { id: true, name: true } }
      }
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    const teacherSubject = await prisma.teacherSubject.findFirst({
      where: {
        teacher_id: staffId,
        rombel_id: assignment.rombel_id,
        subject_id: assignment.subject_id!,
        deleted_at: null
      }
    });

    if (!teacherSubject) {
      return NextResponse.json(
        { error: "Unauthorized - You don't own this assignment" },
        { status: 403 }
      );
    }

    // Get all submissions for this assignment
    const submissions = await prisma.assignmentSubmission.findMany({
      where: {
        assignment_id: BigInt(id)
      }
    });

    // Create a map for quick lookup
    const submissionMap = new Map(
      submissions.map(sub => [sub.student_id.toString(), sub])
    );

    // Map students with their submission data
    const students = assignment.rombel!.students.map((student) => {
      const submission = submissionMap.get(student.id.toString());
      
      return {
        id: student.id,
        name: student.fullName,
        registrationCode: student.registrationCode,
        submittedAt: submission?.submitted_at?.toISOString() || null,
        score: submission?.score || null,
        feedback: submission?.feedback || null,
        attachmentUrl: submission?.attachment_url || null,
        attachmentName: submission?.attachment_name || null,
        status: submission?.status || 'not_submitted'
      };
    });

    return NextResponse.json({
      assignment: {
        id: Number(assignment.id),
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.due_date,
        maxScore: assignment.max_score,
        subjectName: assignment.subject!.name,
        rombelName: `${assignment.rombel!.class.name} - ${assignment.rombel!.name}`,
        academicYear: assignment.academic_year,
        semester: assignment.semester,
      },
      students,
      summary: {
        total: students.length,
        submitted: students.filter(s => s.status !== 'not_submitted').length,
        graded: students.filter(s => s.status === 'graded').length,
        notSubmitted: students.filter(s => s.status === 'not_submitted').length,
      }
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

// PUT - Grade a submission
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const body = await request.json();
    const { studentId, score, feedback, attachmentUrl, attachmentName } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    const { id } = await params;

    // Get assignment
    const assignment = await prisma.assignment.findUnique({
      where: { id: BigInt(id) }
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    const teacherSubject = await prisma.teacherSubject.findFirst({
      where: {
        teacher_id: staffId,
        rombel_id: assignment.rombel_id,
        subject_id: assignment.subject_id!,
        deleted_at: null
      }
    });

    if (!teacherSubject) {
      return NextResponse.json(
        { error: "Unauthorized - You don't own this assignment" },
        { status: 403 }
      );
    }

    // Validate score
    if (score !== null && score !== undefined) {
      const scoreNum = parseFloat(score);
      const maxScore = parseFloat(assignment.max_score?.toString() || "100");
      
      if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > maxScore) {
        return NextResponse.json(
          { error: `Score must be between 0 and ${maxScore}` },
          { status: 400 }
        );
      }
    }

    // Upsert submission record
    const assignmentId = BigInt(id);

    const submission = await prisma.assignmentSubmission.upsert({
      where: {
        assignment_id_student_id: {
          assignment_id: assignmentId,
          student_id: studentId
        }
      },
      create: {
        assignment_id: assignmentId,
        student_id: studentId,
        score: score !== null && score !== undefined ? parseFloat(score) : null,
        feedback: feedback || null,
        attachment_url: attachmentUrl || null,
        attachment_name: attachmentName || null,
        status: 'graded',
        graded_at: new Date(),
        graded_by: staffId.toString()
      },
      update: {
        score: score !== null && score !== undefined ? parseFloat(score) : null,
        feedback: feedback || null,
        attachment_url: attachmentUrl || null,
        attachment_name: attachmentName || null,
        status: 'graded',
        graded_at: new Date(),
        graded_by: staffId.toString(),
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: "Nilai berhasil disimpan",
      data: {
        studentId: submission.student_id,
        score: submission.score,
        feedback: submission.feedback,
        gradedAt: submission.graded_at?.toISOString()
      }
    });
  } catch (error) {
    console.error("Error grading submission:", error);
    return NextResponse.json(
      { error: "Failed to grade submission" },
      { status: 500 }
    );
  }
}
