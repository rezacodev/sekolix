import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

function serializeQuestion(q: Record<string, unknown>) {
  return {
    ...q,
    id: String(q.id),
    subject_id: Number(q.subject_id),
    options: Array.isArray(q.options) ? q.options : (q.options != null ? q.options : undefined),
  };
}

// Schema for updating questions
const updateQuestionSchema = z.object({
  subject_id: z.number().optional(),
  question_type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER", "ESSAY", "MATCHING"]).optional(),
  difficulty: z.enum(["MUDAH", "SEDANG", "SULIT"]).optional(),
  cognitive_level: z.enum(["MENGINGAT", "MEMAHAMI", "MENERAPKAN", "MENGANALISIS", "MENGEVALUASI", "MENCIPTAKAN"]).optional(),
  question_text: z.string().min(1).optional(),
  options: z.array(z.string()).optional(),
  correct_answer: z.string().min(1).optional(),
  explanation: z.string().optional(),
  tags: z.array(z.string()).optional(),
  topic: z.string().optional(),
  is_active: z.boolean().optional(),
});

// GET - Fetch single question
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.staffRole !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const staffId = session.user.staffId!;
    const questionId = id;

    const question = await prisma.questionBank.findFirst({
      where: {
        id: BigInt(questionId),
        teacher_id: staffId, // Ensure teacher can only access their own questions
      },
      include: {
        subject: {
          select: {
            name: true,
          },
        },
        teacher: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ question: serializeQuestion(question as unknown as Record<string, unknown>) });
  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update question
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.staffRole !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const staffId = session.user.staffId!;
    const questionId = id;
    const body = await request.json();

    // Validate input
    const validatedData = updateQuestionSchema.parse(body);

    // Check if question exists and belongs to teacher
    const existingQuestion = await prisma.questionBank.findFirst({
      where: {
        id: BigInt(questionId),
        teacher_id: staffId,
      },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Update question
    const question = await prisma.questionBank.update({
      where: {
        id: BigInt(questionId),
      },
      data: validatedData,
      include: {
        subject: {
          select: {
            name: true,
          },
        },
        teacher: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ question: serializeQuestion(question as unknown as Record<string, unknown>) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating question:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete question
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.staffRole !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const staffId = session.user.staffId!;
    const questionId = id;

    // Check if question exists and belongs to teacher
    const existingQuestion = await prisma.questionBank.findFirst({
      where: {
        id: BigInt(questionId),
        teacher_id: staffId,
      },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Soft delete by setting is_active to false
    await prisma.questionBank.update({
      where: {
        id: BigInt(questionId),
      },
      data: {
        is_active: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}