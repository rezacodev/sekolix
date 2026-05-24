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

// Schema for creating/updating questions
const createQuestionSchema = z.object({
  subject_id: z.number(),
  question_type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER", "ESSAY", "MATCHING"]),
  difficulty: z.enum(["MUDAH", "SEDANG", "SULIT"]),
  cognitive_level: z.enum(["MENGINGAT", "MEMAHAMI", "MENERAPKAN", "MENGANALISIS", "MENGEVALUASI", "MENCIPTAKAN"]),
  question_text: z.string().min(1),
  options: z.array(z.string()).optional(),
  correct_answer: z.string().min(1),
  explanation: z.string().optional(),
  tags: z.array(z.string()),
  topic: z.string().optional(),
});

// Type for question bank filters
type QuestionBankFilters = {
  teacher_id: string;
  is_active: boolean;
  subject_id?: number;
  difficulty?: "MUDAH" | "SEDANG" | "SULIT";
  question_type?: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER" | "ESSAY" | "MATCHING";
  cognitive_level?: "MENGINGAT" | "MEMAHAMI" | "MENERAPKAN" | "MENGANALISIS" | "MENGEVALUASI" | "MENCIPTAKAN";
  OR?: Array<{
    question_text?: { contains: string; mode: "insensitive" };
    topic?: { contains: string; mode: "insensitive" };
    tags?: { hasSome: string[] };
  }>;
};

// GET - Fetch questions for logged-in teacher
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.staffRole !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const staffId = session.user.staffId!;
    const { searchParams } = new URL(request.url);

    // Build filter object
    const filters: QuestionBankFilters = {
      teacher_id: staffId,
      is_active: true,
    };

    // Add optional filters
    const subjectId = searchParams.get("subject_id");
    if (subjectId) filters.subject_id = parseInt(subjectId);

    const difficulty = searchParams.get("difficulty");
    if (difficulty) filters.difficulty = difficulty as "MUDAH" | "SEDANG" | "SULIT";

    const questionType = searchParams.get("question_type");
    if (questionType) filters.question_type = questionType as "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER" | "ESSAY" | "MATCHING";

    const cognitiveLevel = searchParams.get("cognitive_level");
    if (cognitiveLevel) filters.cognitive_level = cognitiveLevel as "MENGINGAT" | "MEMAHAMI" | "MENERAPKAN" | "MENGANALISIS" | "MENGEVALUASI" | "MENCIPTAKAN";

    const search = searchParams.get("search");
    if (search) {
      filters.OR = [
        { question_text: { contains: search, mode: "insensitive" } },
        { topic: { contains: search, mode: "insensitive" } },
        { tags: { hasSome: [search] } },
      ];
    }

    const questions = await prisma.questionBank.findMany({
      where: filters,
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
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json({ questions: questions.map(q => serializeQuestion(q as unknown as Record<string, unknown>)) });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new question
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.staffRole !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const staffId = session.user.staffId!;
    const body = await request.json();

    // Validate input
    const validatedData = createQuestionSchema.parse(body);

    // Create question
    const question = await prisma.questionBank.create({
      data: {
        teacher_id: staffId,
        ...validatedData,
        usage_count: 0,
        is_active: true,
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

    return NextResponse.json({ question: serializeQuestion(question as unknown as Record<string, unknown>) }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}