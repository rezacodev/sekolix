/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

async function getStaffId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { staff: true },
  });
  return user?.staff?.[0]?.id ?? null;
}

const koreksiSchema = z.object({
  attempt_id: z.string(),
  corrections: z.array(
    z.object({
      answer_record_id: z.string(),
      score: z.number().min(0).max(100),
      essay_note: z.string().optional(),
    })
  ),
});

type Params = { params: Promise<{ jadwalId: string }> };

// GET /api/teacher/ujian/hasil/[jadwalId]/koreksi — essay answers pending correction
export async function GET(_req: Request, { params }: Params) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { jadwalId } = await params;
    const db = prisma as any;

    const schedule: any = await db.examSchedule.findFirst({
      where: { id: BigInt(jadwalId), teacher_id: staffId, deleted_at: null },
      select: {
        id: true,
        title: true,
        package: {
          select: {
            passing_grade: true,
            questions: {
              select: {
                question: {
                  select: {
                    id: true,
                    question_type: true,
                    question_text: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!schedule) return NextResponse.json({ error: "Schedule not found" }, { status: 404 });

    const essayQuestionIds: bigint[] = schedule.package.questions
      .filter((pq: any) => pq.question.question_type === "ESSAY")
      .map((pq: any) => pq.question.id);

    if (essayQuestionIds.length === 0) {
      return NextResponse.json({ attempts: [], essay_question_count: 0 });
    }

    const attempts: any[] = await db.examAttempt.findMany({
      where: {
        schedule_id: BigInt(jadwalId),
        status: { in: ["SUBMITTED", "GRADED"] },
        deleted_at: null,
        answers: {
          some: {
            question_id: { in: essayQuestionIds },
          },
        },
      },
      include: {
        student: { select: { id: true, fullName: true, nisn: true } },
        answers: {
          where: { question_id: { in: essayQuestionIds } },
          include: {
            question: {
              select: {
                id: true,
                question_text: true,
                question_type: true,
              },
            },
          },
        },
      },
      orderBy: { submitted_at: "asc" },
    });

    return NextResponse.json({
      schedule_id: String(jadwalId),
      schedule_title: schedule.title,
      essay_question_count: essayQuestionIds.length,
      attempts: attempts.map((a: any) => ({
        id: String(a.id),
        student: {
          id: a.student.id,
          fullName: a.student.fullName,
          nisn: a.student.nisn ?? "",
        },
        status: a.status,
        submitted_at: a.submitted_at?.toISOString() ?? null,
        graded_at: a.graded_at?.toISOString() ?? null,
        essay_answers: a.answers.map((ans: any) => ({
          id: String(ans.id),
          question_id: String(ans.question_id),
          question_text: ans.question.question_text,
          answer: ans.answer,
          score: ans.score !== null ? Number(ans.score) : null,
          essay_note: ans.essay_note ?? "",
          is_graded: ans.score !== null,
        })),
        all_graded: a.answers.every((ans: any) => ans.score !== null),
      })),
    });
  } catch (error) {
    console.error("Error fetching koreksi data:", error);
    return NextResponse.json({ error: "Failed to fetch koreksi data" }, { status: 500 });
  }
}

// PUT /api/teacher/ujian/hasil/[jadwalId]/koreksi — save essay corrections
export async function PUT(request: Request, { params }: Params) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { jadwalId } = await params;
    const db = prisma as any;

    const schedule: any = await db.examSchedule.findFirst({
      where: { id: BigInt(jadwalId), teacher_id: staffId, deleted_at: null },
      select: { id: true, package: { select: { passing_grade: true } } },
    });
    if (!schedule) return NextResponse.json({ error: "Schedule not found" }, { status: 404 });

    const body = await request.json();
    const parsed = koreksiSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 400 });
    }

    const { attempt_id, corrections } = parsed.data;

    const attempt: any = await db.examAttempt.findFirst({
      where: {
        id: BigInt(attempt_id),
        schedule_id: BigInt(jadwalId),
        deleted_at: null,
      },
    });
    if (!attempt) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });

    // Update each essay answer record
    await Promise.all(
      corrections.map((c) =>
        db.examAnswerRecord.update({
          where: { id: BigInt(c.answer_record_id) },
          data: {
            score: c.score,
            essay_note: c.essay_note ?? null,
          },
        })
      )
    );

    // Recalculate final score for the attempt
    const updatedAnswers: any[] = await db.examAnswerRecord.findMany({
      where: { attempt_id: BigInt(attempt_id) },
      select: { score: true, is_correct: true },
    });

    const totalQuestions = updatedAnswers.length;
    if (totalQuestions === 0) {
      return NextResponse.json({ success: true });
    }

    const allGraded = updatedAnswers.every((a: any) => a.score !== null || a.is_correct !== null);
    if (!allGraded) {
      return NextResponse.json({ success: true, message: "Sebagian soal belum dikoreksi" });
    }

    const totalScore = updatedAnswers.reduce((sum: number, a: any) => {
      if (a.score !== null) return sum + Number(a.score);
      if (a.is_correct === true) return sum + 100 / totalQuestions;
      return sum;
    }, 0);
    const finalScore = Math.round((totalScore / totalQuestions) * 10) / 10;

    await db.examAttempt.update({
      where: { id: BigInt(attempt_id) },
      data: {
        score: finalScore,
        essay_score: corrections.reduce((sum, c) => sum + c.score, 0) / corrections.length,
        status: "GRADED",
        graded_at: new Date(),
        graded_by: staffId,
      },
    });

    return NextResponse.json({
      success: true,
      final_score: finalScore,
      is_passed: finalScore >= schedule.package.passing_grade,
    });
  } catch (error) {
    console.error("Error saving koreksi:", error);
    return NextResponse.json({ error: "Failed to save koreksi" }, { status: 500 });
  }
}
