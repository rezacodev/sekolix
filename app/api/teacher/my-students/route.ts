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
    const rombelId = searchParams.get("rombelId");
    const classId = searchParams.get("classId");
    const search = searchParams.get("search");

    // Get teacher's rombels first
    const teacherSubjects = await prisma.teacherSubject.findMany({
      where: {
        teacher_id: teacherId,
        deleted_at: null,
        ...(rombelId ? { rombel_id: BigInt(rombelId) } : {}),
        ...(classId ? { class_id: BigInt(classId) } : {}),
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
      });
    }

    // Get students from these rombels
    const students = await prisma.pesertaDidik.findMany({
      where: {
        rombels: {
          some: {
            id: {
              in: rombelIds,
            },
          },
        },
        deleted_at: null,
        ...(search
          ? {
              OR: [
                { fullName: { contains: search, mode: "insensitive" } },
                { nisn: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        rombels: {
          where: {
            id: {
              in: rombelIds,
            },
          },
          include: {
            class: true,
            program: true,
          },
        },
      },
      orderBy: [
        { fullName: "asc" },
      ],
    });

    const formattedStudents = students.map((student) => {
      const rombel = student.rombels[0]; // Get first matching rombel
      return {
        id: student.id,
        name: student.fullName,
        nisn: student.nisn,
        nis: student.nisn, // Use nisn as nis since no nis field
        gender: student.gender,
        photo: null, // No photo field in schema
        email: student.email,
        phone: student.phone,
        address: student.address,
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
        status: student.status,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedStudents,
      total: formattedStudents.length,
    });
  } catch (error) {
    console.error("Error fetching teacher students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}
