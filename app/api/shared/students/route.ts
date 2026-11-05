import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTeacherAcademicScope } from "@/lib/api/scope";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

const studentQuerySchema = z.object({
  search: z.string().max(100).optional().nullable(),
  rombelId: z.coerce.bigint().optional(),
  classId: z.coerce.bigint().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const parsedQuery = studentQuerySchema.safeParse(Object.fromEntries(searchParams));
    if (!parsedQuery.success) {
      return NextResponse.json({ error: "Invalid query", details: parsedQuery.error.flatten() }, { status: 400 });
    }

    const { search, rombelId, classId, page, limit } = parsedQuery.data;
    const skip = (page - 1) * limit;

    // Check user role
    const isAdmin = ["SUPERADMIN", "ADMIN"].includes(session.user.role);
    const isTeacher = session.user.staffRole === "TEACHER";
    const teacherId = session.user.staffId;

    const whereClause: Prisma.PesertaDidikWhereInput = {
      deleted_at: null,
    };
    const rombelFilter: Prisma.RombelWhereInput = { deleted_at: null };

    // Role-based filtering
    if (!isAdmin && isTeacher && teacherId) {
      const scope = await getTeacherAcademicScope(teacherId);

      if (scope.rombelIds.length === 0 || (rombelId && !scope.rombelIds.includes(rombelId))) {
        return NextResponse.json({
          success: true,
          data: [],
          total: 0,
          page,
          limit,
          role: "teacher",
        });
      }

      rombelFilter.id = rombelId ?? { in: scope.rombelIds };
    } else if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    } else if (rombelId) {
      rombelFilter.id = rombelId;
    }

    // Additional filters
    if (classId) {
      rombelFilter.class_id = classId;
    }

    if (rombelFilter.id || rombelFilter.class_id) {
      whereClause.rombels = { some: rombelFilter };
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
