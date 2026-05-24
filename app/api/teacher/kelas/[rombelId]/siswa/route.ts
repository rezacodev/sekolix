import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ rombelId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const params = await context.params;

    if (!session?.user?.staffId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rombelId = params.rombelId;
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const gender = searchParams.get("gender") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Verify teacher has access to this rombel
    const teacherId = session.user.staffId;
    const hasAccess = await prisma.teacherSubject.findFirst({
      where: {
        teacher_id: teacherId,
        deleted_at: null,
        OR: [
          { rombel_id: BigInt(rombelId) },
          {
            class: {
              rombels: {
                some: {
                  id: BigInt(rombelId),
                },
              },
            },
          },
        ],
      },
    });

    if (!hasAccess) {
      return NextResponse.json(
        { error: "You don't have access to this class" },
        { status: 403 }
      );
    }

    // Build where clause for filtering
    const whereClause: {
      rombels: { some: { id: bigint } };
      deleted_at: null;
      OR?: Array<{
        fullName?: { contains: string; mode: "insensitive" };
        nik?: { contains: string; mode: "insensitive" };
        nisn?: { contains: string; mode: "insensitive" };
      }>;
      gender?: string;
    } = {
      rombels: {
        some: {
          id: BigInt(rombelId),
        },
      },
      deleted_at: null,
    };

    // Search filter
    if (search) {
      whereClause.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { nik: { contains: search, mode: "insensitive" } },
        { nisn: { contains: search, mode: "insensitive" } },
      ];
    }

    // Gender filter
    if (gender && gender !== "all") {
      whereClause.gender = gender;
    }

    // Get students with pagination
    const [students, total, rombel] = await Promise.all([
      prisma.pesertaDidik.findMany({
        where: whereClause,
        include: {
          program: {
            select: {
              name: true,
            },
          },
          rombels: {
            where: {
              id: BigInt(rombelId),
            },
            select: {
              id: true,
              name: true,
              class: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          fullName: "asc",
        },
        skip,
        take: limit,
      }),
      prisma.pesertaDidik.count({ where: whereClause }),
      prisma.rombel.findUnique({
        where: { id: BigInt(rombelId) },
        select: {
          id: true,
          name: true,
          capacity: true,
          student_count: true,
          class: {
            select: {
              id: true,
              name: true,
            },
          },
          program: {
            select: {
              name: true,
            },
          },
          tahunAjaran: {
            select: {
              label: true,
              isActive: true,
            },
          },
        },
      }),
    ]);

    if (!rombel) {
      return NextResponse.json({ error: "Rombel not found" }, { status: 404 });
    }

    // Format response
    const formattedStudents = students.map((student) => {
      const currentRombel = student.rombels[0];
      
      return {
        id: student.id,
        fullName: student.fullName,
        nik: student.nik,
        nisn: student.nisn,
        gender: student.gender,
        placeOfBirth: student.placeOfBirth,
        dateOfBirth: student.dateOfBirth,
        phone: student.phone,
        email: student.email,
        address: student.address,
        program: student.program?.name || null,
        rombelName: currentRombel?.name || null,
        className: currentRombel?.class?.name || null,
        // Calculate age from dateOfBirth
        age: student.dateOfBirth
          ? new Date().getFullYear() -
            new Date(student.dateOfBirth).getFullYear()
          : null,
        // Placeholder for attendance percentage (to be calculated from attendance records)
        attendancePercentage: null,
        // Placeholder for average grade (to be calculated from grades)
        averageGrade: null,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        students: formattedStudents,
        rombel: {
          id: Number(rombel.id),
          name: rombel.name,
          className: rombel.class.name,
          program: rombel.program?.name || null,
          capacity: rombel.capacity,
          studentCount: rombel.student_count,
          tahunAjaran: rombel.tahunAjaran?.label || null,
          isActive: rombel.tahunAjaran?.isActive || false,
        },
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("[API Siswa] Error fetching students:", error);
    console.error("[API Siswa] Error stack:", error instanceof Error ? error.stack : "No stack");
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}
