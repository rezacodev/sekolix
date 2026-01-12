import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rombelId = BigInt(id);

    // Get rombel with program info
    const rombel = await prisma.rombel.findUnique({
      where: { id: rombelId },
      include: {
        program: {
          include: {
            subjects: true
          }
        }
      }
    });

    if (!rombel) {
      return NextResponse.json(
        { error: "Rombel not found" },
        { status: 404 }
      );
    }

    // Get currently generated subjects for this rombel
    const currentSubjects = await prisma.teacherSubject.findMany({
      where: {
        class_id: BigInt(rombel.class_id),
        rombel_id: rombelId
      }
    });

    // Get total subjects in program
    const programSubjectsCount = rombel.program?.subjects?.length || 0;
    const currentSubjectsCount = currentSubjects.length;

    // Can regenerate if program has more subjects than currently generated
    const canRegenerate = programSubjectsCount > currentSubjectsCount;

    return NextResponse.json({
      canRegenerate,
      programSubjectsCount,
      currentSubjectsCount
    });
  } catch (error) {
    console.error("Error checking generation status:", error);
    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 }
    );
  }
}
