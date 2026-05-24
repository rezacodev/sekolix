import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    // Check user role
    const isAdmin = session.user.role === "ADMIN";
    const isTeacher = session.user.staffRole === "TEACHER";
    const teacherId = session.user.staffId;

    const whereClause: Record<string, unknown> = {
      deleted_at: null,
    };

    // Role-based filtering
    if (!isAdmin && isTeacher && teacherId) {
      // Teacher only sees subjects they teach
      whereClause.teacherSubjects = {
        some: {
          teacher_id: teacherId,
          deleted_at: null,
        },
      };
    }

    // Search filter
    if (search) {
      whereClause.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    const subjects = await prisma.subject.findMany({
      where: whereClause,
      include: {
        teacherSubjects: {
          where: {
            deleted_at: null,
            ...(isTeacher && teacherId ? { teacher_id: teacherId } : {}),
          },
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
              },
            },
            class: true,
            rombel: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    const formattedSubjects = subjects.map((subject) => ({
      id: subject.id.toString(),
      name: subject.name,
      code: subject.code,
      isPractice: subject.is_practice,
      classes: subject.teacherSubjects.map((ts) => ({
        classId: ts.class?.id.toString(),
        className: ts.class?.name,
        rombelId: ts.rombel?.id.toString(),
        rombelName: ts.rombel?.name,
        teacher: {
          id: ts.teacher?.id,
          name: ts.teacher?.name,
        },
      })),
    }));

    return NextResponse.json({
      success: true,
      data: formattedSubjects,
      total: formattedSubjects.length,
      role: isAdmin ? "admin" : "teacher",
    });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}
