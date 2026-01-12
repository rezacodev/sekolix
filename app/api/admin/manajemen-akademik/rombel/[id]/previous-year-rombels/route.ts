import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rombelId = BigInt(id);

    // Get current rombel with tahun ajaran
    const currentRombel = await prisma.rombel.findUnique({
      where: { id: rombelId },
      include: {
        tahunAjaran: true,
        class: true
      }
    });

    if (!currentRombel || !currentRombel.tahunAjaran) {
      return NextResponse.json(
        { error: "Rombel atau tahun ajaran tidak ditemukan" },
        { status: 404 }
      );
    }

    if (!currentRombel.tahunAjaran.startDate) {
      return NextResponse.json(
        { error: "Tahun ajaran tidak memiliki tanggal mulai" },
        { status: 400 }
      );
    }

    // Get previous year based on current year's startDate
    const currentYearStart = new Date(currentRombel.tahunAjaran.startDate);
    const previousYearStart = new Date(currentYearStart);
    previousYearStart.setFullYear(currentYearStart.getFullYear() - 1);

    // Find tahun ajaran from previous year
    const previousYears = await prisma.tahunAjaran.findMany({
      where: {
        startDate: {
          lt: currentRombel.tahunAjaran.startDate
        },
        deleted_at: null
      },
      orderBy: {
        startDate: 'desc'
      },
      take: 3 // Get last 3 years for flexibility
    });

    if (previousYears.length === 0) {
      return NextResponse.json([]);
    }

    // Get rombels from previous years
    const previousRombels = await prisma.rombel.findMany({
      where: {
        tahunAjaranId: {
          in: previousYears.map(y => y.id)
        },
        deleted_at: null
      },
      include: {
        class: true,
        program: true,
        tahunAjaran: true,
        students: {
          select: {
            id: true,
            nisn: true,
            fullName: true
          }
        }
      },
      orderBy: [
        { tahunAjaranId: 'desc' },
        { name: 'asc' }
      ]
    });

    const serializedRombels = previousRombels.map(rombel => ({
      id: Number(rombel.id),
      name: rombel.name,
      class: {
        id: Number(rombel.class.id),
        name: rombel.class.name
      },
      program: {
        id: rombel.program.id,
        name: rombel.program.name
      },
      tahunAjaran: {
        id: rombel.tahunAjaran?.id,
        label: rombel.tahunAjaran?.label
      },
      studentCount: rombel.students.length,
      students: rombel.students.map(s => ({
        id: s.id,
        nisn: s.nisn,
        fullName: s.fullName
      }))
    }));

    return NextResponse.json(serializedRombels);
  } catch (error) {
    console.error("Error fetching previous year rombels:", error);
    return NextResponse.json(
      { error: "Failed to fetch previous year rombels" },
      { status: 500 }
    );
  }
}
