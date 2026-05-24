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
    const withStudents = searchParams.get("withStudents") === "true";

    // Check user role
    const isAdmin = session.user.role === "ADMIN";
    const isTeacher = session.user.staffRole === "TEACHER";
    const teacherId = session.user.staffId;

    let classWhere: Record<string, unknown> = {
      deleted_at: null,
    };

    // Role-based filtering
    if (!isAdmin && isTeacher && teacherId) {
      // Teacher only sees their classes
      classWhere = {
        deleted_at: null,
        teacherSubjects: {
          some: {
            teacher_id: teacherId,
            deleted_at: null,
          },
        },
      };
    }

    // Search filter
    if (search) {
      classWhere = {
        ...classWhere,
        name: {
          contains: search,
          mode: "insensitive" as const,
        },
      };
    }

    const classes = await prisma.class.findMany({
      where: classWhere,
      include: {
        rombels: {
          where: { deleted_at: null },
          include: {
            program: true,
            tahunAjaran: true,
            ...(withStudents
              ? {
                  _count: {
                    select: { students: true },
                  },
                }
              : {}),
          },
        },
        subjects: {
          where: { deleted_at: null },
          include: {
            subject: true,
          },
        },
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
            subject: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    const formattedClasses = classes.map((cls) => ({
      id: cls.id.toString(),
      name: cls.name,
      rombels: cls.rombels.map((rombel) => ({
        id: rombel.id.toString(),
        name: rombel.name,
        program: rombel.program?.name,
        tahunAjaran: rombel.tahunAjaran?.label,
        capacity: rombel.capacity,
        studentCount: withStudents ? (rombel as { _count?: { students: number } })._count?.students || 0 : undefined,
      })),
      subjects: cls.subjects.map((subj) => ({
        id: subj.subject.id.toString(),
        name: subj.subject.name,
      })),
      teachers: cls.teacherSubjects.map((ts) => ({
        id: ts.teacher?.id,
        name: ts.teacher?.name,
        subject: ts.subject.name,
      })),
    }));

    return NextResponse.json({
      success: true,
      data: formattedClasses,
      total: formattedClasses.length,
      role: isAdmin ? "admin" : "teacher",
    });
  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    );
  }
}
