import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.staffId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacherId = session.user.staffId;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // upcoming, overdue, completed
    const onlineClassId = searchParams.get("onlineClassId");

    // Get teacher's subjects first
    const teacherSubjects = await prisma.teacherSubject.findMany({
      where: {
        teacher_id: teacherId,
        deleted_at: null,
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

    // Get online classes for these subjects
    const teacherClasses = await prisma.onlineClass.findMany({
      where: {
        subject_id: {
          in: subjectIds,
        },
        deleted_at: null,
        ...(onlineClassId ? { id: BigInt(onlineClassId) } : {}),
      },
      select: {
        id: true,
      },
    });

    const classIds = teacherClasses.map(c => c.id);

    if (classIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
      });
    }

    const now = new Date();

    // Build where clause based on status filter
    const whereClause = {
      online_class_id: {
        in: classIds,
      },
      deleted_at: null,
      ...(status === "upcoming" ? { due_date: { gte: now } } : {}),
      ...(status === "overdue" ? { due_date: { lt: now } } : {}),
    };

    const assignments = await prisma.assignment.findMany({
      where: whereClause,
      include: {
        online_class: {
          include: {
            subject: true,
            class: true,
          },
        },
      },
      orderBy: {
        due_date: "desc",
      },
    });

    const formattedAssignments = assignments.map((assignment) => ({
      id: assignment.id.toString(),
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.due_date,
      maxScore: assignment.max_score,
      status: assignment.due_date < now ? "overdue" : "upcoming",
      onlineClass: assignment.online_class ? {
        id: assignment.online_class.id.toString(),
        title: assignment.online_class.title,
        subject: assignment.online_class.subject.name,
        class: assignment.online_class.class.name,
      } : null,
      createdAt: assignment.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: formattedAssignments,
      total: formattedAssignments.length,
    });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
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
    const body = await request.json();

    const { onlineClassId, title, description, dueDate, maxScore } = body;

    // Validate required fields
    if (!onlineClassId || !title || !dueDate) {
      return NextResponse.json(
        { error: "Missing required fields: onlineClassId, title, dueDate" },
        { status: 400 }
      );
    }

    // Verify teacher owns this online class (through subject)
    const onlineClass = await prisma.onlineClass.findFirst({
      where: {
        id: BigInt(onlineClassId),
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

    if (!onlineClass) {
      return NextResponse.json(
        { error: "Online class not found or unauthorized" },
        { status: 404 }
      );
    }

    // Create assignment
    const assignment = await prisma.assignment.create({
      data: {
        online_class_id: BigInt(onlineClassId),
        title,
        description: description || null,
        due_date: new Date(dueDate),
        max_score: maxScore ? parseFloat(maxScore) : 100,
      },
      include: {
        online_class: {
          include: {
            subject: true,
            class: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Assignment created successfully",
      data: {
        id: assignment.id.toString(),
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.due_date,
        maxScore: assignment.max_score,
        onlineClass: assignment.online_class ? {
          id: assignment.online_class.id.toString(),
          title: assignment.online_class.title,
          subject: assignment.online_class.subject.name,
        } : null,
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
