import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Get assignment detail
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

    const assignment = await prisma.assignment.findUnique({
      where: { id: BigInt(id) },
      include: {
        rombel: {
          include: {
            class: { select: { id: true, name: true } }
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

    return NextResponse.json({
      id: Number(assignment.id),
      rombelId: Number(assignment.rombel_id),
      subjectId: Number(assignment.subject_id),
      academicYear: assignment.academic_year,
      semester: assignment.semester,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.due_date,
      maxScore: assignment.max_score,
      subjectName: assignment.subject!.name,
      rombelName: `${assignment.rombel!.class.name} - ${assignment.rombel!.name}`,
      createdAt: assignment.created_at,
      updatedAt: assignment.updated_at,
    });
  } catch (error) {
    console.error("Error fetching assignment:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignment" },
      { status: 500 }
    );
  }
}

// PUT - Update assignment
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

    const { id } = await params;

    const body = await request.json();
    const {
      title,
      description,
      dueDate,
      maxScore,
    } = body;

    // Validate required fields
    if (!title || !dueDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get existing assignment
    const existingAssignment = await prisma.assignment.findUnique({
      where: { id: BigInt(id) },
      select: {
        id: true,
        rombel_id: true,
        subject_id: true
      }
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    const teacherSubject = await prisma.teacherSubject.findFirst({
      where: {
        teacher_id: staffId,
        rombel_id: existingAssignment.rombel_id,
        subject_id: existingAssignment.subject_id!,
        deleted_at: null
      }
    });

    if (!teacherSubject) {
      return NextResponse.json(
        { error: "Unauthorized - You don't own this assignment" },
        { status: 403 }
      );
    }

    // Update assignment (can't change rombel/subject, only content)
    const assignment = await prisma.assignment.update({
      where: { id: BigInt(id) },
      data: {
        title,
        description: description || null,
        due_date: new Date(dueDate),
        max_score: maxScore ? parseFloat(maxScore) : 100,
      },
      include: {
        rombel: {
          include: {
            class: { select: { name: true } }
          }
        },
        subject: { select: { name: true } }
      },
    });

    return NextResponse.json({
      message: "Assignment updated successfully",
      assignment: {
        id: Number(assignment.id),
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.due_date,
        maxScore: assignment.max_score,
        subjectName: assignment.subject!.name,
        className: `${assignment.rombel!.class.name} - ${assignment.rombel!.name}`,
      },
    });
  } catch (error) {
    console.error("Error updating assignment:", error);
    return NextResponse.json(
      { error: "Failed to update assignment" },
      { status: 500 }
    );
  }
}
