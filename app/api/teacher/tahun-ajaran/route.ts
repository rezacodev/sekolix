import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch academic years for teacher (only active and upcoming years)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.staffRole !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tahunAjaran = await prisma.tahunAjaran.findMany({
      where: {
        deleted_at: null,
      },
      select: {
        id: true,
        label: true,
        isActive: true,
        startDate: true,
        endDate: true,
      },
      orderBy: [
        { isActive: "desc" }, // Active year first
        { startDate: "desc" }, // Then by start date descending
      ],
    });

    return NextResponse.json({
      success: true,
      academicYears: tahunAjaran.map((year) => ({
        id: year.id,
        label: year.label,
        isActive: year.isActive,
        startDate: year.startDate?.toISOString(),
        endDate: year.endDate?.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching academic years:", error);
    return NextResponse.json(
      { error: "Failed to fetch academic years" },
      { status: 500 }
    );
  }
}
