import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/teacher/nilai/rubrik/scores
 * Get existing rubric scores for a specific student and rubric
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const rubricId = searchParams.get("rubricId");

    if (!studentId || !rubricId) {
      return NextResponse.json(
        { error: "studentId and rubricId are required" },
        { status: 400 }
      );
    }

    // Verify teacher access to this rubric
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { staff: true }
    });

    const staffId = user?.staff?.[0]?.id;
    if (!staffId) {
      return NextResponse.json(
        { error: "Staff ID not found" },
        { status: 403 }
      );
    }

    // Get rubric scores for this student and rubric
    const rubricScores = await prisma.rubricScore.findMany({
      where: {
        grade: {
          student_id: studentId,
          rubric_id: BigInt(rubricId),
          deleted_at: null
        },
        deleted_at: null
      },
      include: {
        rubricCriterion: true
      }
    });

    return NextResponse.json({
      scores: rubricScores.map(score => ({
        rubric_criterion_id: Number(score.rubric_criterion_id),
        score: score.score
      }))
    });

  } catch (error) {
    console.error("Error fetching rubric scores:", error);
    return NextResponse.json(
      { error: "Failed to fetch rubric scores" },
      { status: 500 }
    );
  }
}