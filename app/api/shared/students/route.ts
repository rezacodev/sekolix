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
    const rombelId = searchParams.get("rombelId");
    const classId = searchParams.get("classId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Check user role
    const isAdmin = session.user.role === "ADMIN";
    const isTeacher = session.user.staffRole === "TEACHER";
    const teacherId = session.user.staffId;

    const whereClause: Record<string, unknown> = {
      deleted_at: null,
    };

    // Role-based filtering
    if (!isAdmin && isTeacher && teacherId) {
      // Teacher only sees students in their classes
      const teacherSubjects = await prisma.teacherSubject.findMany({
        where: {
          teacher_id: teacherId,
          deleted_at: null,
        },
        select: {
          rombel_id: true,
        },
      });

      const rombelIds = teacherSubjects
        .map(ts => ts.rombel_id)
        .filter((id): id is bigint => id !== null);

      if (rombelIds.length === 0) {
        return NextResponse.json({
          success: true,
          data: [],
          total: 0,
          page,
          limit,
          role: "teacher",
        });
      }

      whereClause.rombel_id = {
        in: rombelIds,
      };
    }

    // Additional filters
    if (rombelId) {
      whereClause.rombels = {
        some: {
          id: BigInt(rombelId),
        },
      };
    }

    if (classId) {
      whereClause.rombels = {
        some: {
          class_id: BigInt(classId),
        },
      };
    }

    if (search) {
      whereClause.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { nisn: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count
    const total = await prisma.pesertaDidik.count({ where: whereClause });

    // Get students with pagination
    const students = await prisma.pesertaDidik.findMany({
      where: whereClause,
      include: {
        rombels: {
          include: {
            class: true,
            program: true,
            tahunAjaran: true,
          },
          take: 1, // Get first rombel only
        },
      },
      orderBy: [
        { fullName: "asc" },
      ],
      skip,
      take: limit,
    });

    const formattedStudents = students.map((student) => {
      const rombel = student.rombels[0]; // Get first rombel
      return {
        id: student.id,
        name: student.fullName,
        nisn: student.nisn,
        nis: student.nisn, // Use nisn as nis
        gender: student.gender,
        photo: null, // No photo field in schema
        email: student.email,
        phone: student.phone,
        address: student.address,
        placeOfBirth: student.placeOfBirth,
        dateOfBirth: student.dateOfBirth,
        class: {
          id: rombel?.class?.id.toString(),
          name: rombel?.class?.name,
        },
        rombel: {
          id: rombel?.id.toString(),
          name: rombel?.name,
        },
        program: {
          id: rombel?.program?.id,
          name: rombel?.program?.name,
        },
        tahunAjaran: rombel?.tahunAjaran?.label,
        status: student.status,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedStudents,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      role: isAdmin ? "admin" : "teacher",
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}
