import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// GET - List assignments untuk teacher
export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // upcoming, overdue
    const search = searchParams.get("search");
    const subjectId = searchParams.get("subjectId");
    const rombelId = searchParams.get("rombelId");
    const page = parseInt(searchParams.get("page") || "0");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    // Get active academic year
    const activeTahunAjaran = await prisma.tahunAjaran.findFirst({
      where: { isActive: true },
      select: { label: true }
    });

    if (!activeTahunAjaran) {
      return NextResponse.json({
        items: [],
        totalCount: 0,
        page,
        pageSize
      });
    }

    // Determine current semester
    const now = new Date();
    const tahunAjaranData = await prisma.tahunAjaran.findFirst({
      where: { isActive: true },
      select: { startDate: true, endDate: true }
    });
    
    let currentSemester = 1;
    if (tahunAjaranData?.startDate && tahunAjaranData?.endDate) {
      const start = new Date(tahunAjaranData.startDate);
      const end = new Date(tahunAjaranData.endDate);
      const midPoint = new Date((start.getTime() + end.getTime()) / 2);
      currentSemester = now < midPoint ? 1 : 2;
    }

    // Get staff's rombels (where they teach)
    const staffTeacherSubjects = await prisma.teacherSubject.findMany({
      where: { 
        teacher_id: staffId,
        deleted_at: null
      },
      select: { rombel_id: true, subject_id: true }
    });

    // Build where clause
    const where: Prisma.AssignmentWhereInput = {
      deleted_at: null,
      academic_year: activeTahunAjaran.label,
      semester: currentSemester,
      OR: staffTeacherSubjects
        .filter(ts => ts.rombel_id !== null)
        .map(ts => ({
          rombel_id: ts.rombel_id!,
          subject_id: ts.subject_id
        }))
    };

    if (status === "upcoming") {
      where.due_date = { gte: new Date() };
    } else if (status === "overdue") {
      where.due_date = { lt: new Date() };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (subjectId) {
      where.subject_id = BigInt(subjectId);
    }

    if (rombelId) {
      where.rombel_id = BigInt(rombelId);
    }

    // Return empty if no teaching assignments
    if (!staffTeacherSubjects.length || !where.OR || (where.OR as Array<unknown>).length === 0) {
      return NextResponse.json({
        items: [],
        totalCount: 0,
        page,
        pageSize
      });
    }

    // Get total count
    const totalCount = await prisma.assignment.count({ where });

    const assignments = await prisma.assignment.findMany({
      where,
      skip: page * pageSize,
      take: pageSize,
      include: {
        rombel: {
          include: {
            class: {
              select: { id: true, name: true }
            }
          }
        },
        subject: {
          select: { id: true, name: true }
        },
        submissions: {
          where: { deleted_at: null },
          select: { id: true }
        }
      },
      orderBy: { created_at: "desc" },
    });

    // Format response
    const formattedAssignments = assignments.map((assignment) => {
      const isOverdue = new Date(assignment.due_date) < new Date();
      
      return {
        id: Number(assignment.id),
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.due_date,
        maxScore: assignment.max_score,
        subjectName: assignment.subject!.name,
        rombelName: `${assignment.rombel!.class.name} - ${assignment.rombel!.name}`,
        createdAt: assignment.created_at,
        updatedAt: assignment.updated_at,
        submissionCount: assignment.submissions.length,
        totalStudents: assignment.rombel!.student_count || 0,
        status: isOverdue ? "overdue" : "upcoming" as "overdue" | "upcoming",
      };
    });

    return NextResponse.json({
      items: formattedAssignments,
      totalCount,
      page,
      pageSize
    });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}

// POST - Create new assignment
export async function POST(request: Request) {
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
    const {
      rombelId,
      subjectId,
      title,
      description,
      dueDate,
      maxScore,
    } = body;

    // Validate required fields
    if (!rombelId || !subjectId || !title || !dueDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get active academic year
    const activeTahunAjaran = await prisma.tahunAjaran.findFirst({
      where: { isActive: true },
      select: { label: true, startDate: true, endDate: true }
    });

    if (!activeTahunAjaran) {
      return NextResponse.json(
        { error: "No active academic year" },
        { status: 400 }
      );
    }

    // Determine current semester
    const now = new Date();
    let currentSemester = 1;
    if (activeTahunAjaran.startDate && activeTahunAjaran.endDate) {
      const start = new Date(activeTahunAjaran.startDate);
      const end = new Date(activeTahunAjaran.endDate);
      const midPoint = new Date((start.getTime() + end.getTime()) / 2);
      currentSemester = now < midPoint ? 1 : 2;
    }

    // Verify teacher owns this rombel + subject
    const teacherSubject = await prisma.teacherSubject.findFirst({
      where: {
        teacher_id: staffId,
        rombel_id: BigInt(rombelId),
        subject_id: BigInt(subjectId),
        deleted_at: null
      },
    });

    if (!teacherSubject) {
      return NextResponse.json(
        { error: "Unauthorized - You don't teach this class" },
        { status: 403 }
      );
    }

    // Create assignment
    const assignment = await prisma.assignment.create({
      data: {
        rombel_id: BigInt(rombelId),
        subject_id: BigInt(subjectId),
        academic_year: activeTahunAjaran.label,
        semester: currentSemester,
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
      message: "Assignment created successfully",
      assignment: {
        id: Number(assignment.id),
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.due_date,
        maxScore: assignment.max_score,
        subjectName: assignment.subject!.name,
        className: `${assignment.rombel!.class.name} - ${assignment.rombel!.name}`,
        academicYear: assignment.academic_year,
        semester: assignment.semester,
      },
    });
  } catch (error) {
    console.error("Error creating assignment:", error);
    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 }
    );
  }
}

// DELETE - Delete assignment
export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Assignment ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership (check via TeacherSubject)
    const assignment = await prisma.assignment.findUnique({
      where: { id: BigInt(id) },
      select: {
        id: true,
        rombel_id: true,
        subject_id: true
      }
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

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

    // Soft delete
    await prisma.assignment.update({
      where: { id: BigInt(id) },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return NextResponse.json(
      { error: "Failed to delete assignment" },
      { status: 500 }
    );
  }
}
