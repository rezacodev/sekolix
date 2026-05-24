/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getStaffId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { staff: true },
  });
  return user?.staff?.[0]?.id ?? null;
}

type Params = { params: Promise<{ jadwalId: string }> };

// GET /api/teacher/ujian/hasil/[jadwalId] — detail hasil per jadwal
export async function GET(_req: Request, { params }: Params) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { jadwalId } = await params;
    const db = prisma as any;

    const schedule: any = await db.examSchedule.findFirst({
      where: { id: BigInt(jadwalId), teacher_id: staffId, deleted_at: null },
      include: {
        package: {
          select: {
            id: true,
            title: true,
            exam_type: true,
            duration: true,
            passing_grade: true,
            questions: {
              orderBy: { order: "asc" },
              select: {
                order: true,
                question: {
                  select: {
                    id: true,
                    question_text: true,
                    question_type: true,
                    options: true,
                    correct_answer: true,
                  },
                },
              },
            },
          },
        },
        rombel: {
          select: {
            id: true,
            name: true,
            class: { select: { name: true } },
            students: {
              where: { deleted_at: null },
              orderBy: { fullName: "asc" },
              select: { id: true, fullName: true, nisn: true },
            },
          },
        },
        attempts: {
          where: { deleted_at: null },
          include: {
            answers: {
              select: {
                id: true,
                question_id: true,
                answer: true,
                is_correct: true,
                score: true,
                essay_note: true,
              },
            },
          },
        },
      },
    });

    if (!schedule) return NextResponse.json({ error: "Schedule not found" }, { status: 404 });

    const passingGrade: number = schedule.package.passing_grade;
    const questionCount: number = schedule.package.questions.length;

    const attemptByStudent = new Map<string, any>(
      schedule.attempts.map((a: any) => [a.student_id, a])
    );

    const students = schedule.rombel.students.map((student: any) => {
      const attempt: any = attemptByStudent.get(student.id);
      if (!attempt) {
        return {
          id: student.id,
          fullName: student.fullName,
          nisn: student.nisn ?? "",
          status: "BELUM" as const,
          score: null,
          auto_score: null,
          essay_score: null,
          started_at: null,
          submitted_at: null,
          graded_at: null,
          attempt_status: null,
          answered_count: 0,
          is_passed: false,
          has_pending_essay: false,
        };
      }

      const essayAnswers: any[] = attempt.answers.filter(
        (ans: any) => ans.is_correct === null && ans.score === null
      );

      return {
        id: student.id,
        fullName: student.fullName,
        nisn: student.nisn ?? "",
        status:
          attempt.status === "IN_PROGRESS"
            ? ("MENGERJAKAN" as const)
            : attempt.score !== null
              ? ("SELESAI" as const)
              : ("MENUNGGU_KOREKSI" as const),
        score: attempt.score !== null ? Number(attempt.score) : null,
        auto_score: attempt.auto_score !== null ? Number(attempt.auto_score) : null,
        essay_score: attempt.essay_score !== null ? Number(attempt.essay_score) : null,
        started_at: attempt.started_at.toISOString(),
        submitted_at: attempt.submitted_at?.toISOString() ?? null,
        graded_at: attempt.graded_at?.toISOString() ?? null,
        attempt_status: attempt.status,
        attempt_id: String(attempt.id),
        answered_count: attempt.answers.length,
        is_passed:
          attempt.score !== null && Number(attempt.score) >= passingGrade,
        has_pending_essay: essayAnswers.length > 0,
      };
    });

    const submitted = students.filter((s: any) => s.status !== "BELUM" && s.status !== "MENGERJAKAN");
    const scored = students.filter((s: any) => s.score !== null);
    const passed = scored.filter((s: any) => s.is_passed);
    const avgScore =
      scored.length > 0
        ? scored.reduce((sum: number, s: any) => sum + (s.score ?? 0), 0) / scored.length
        : null;
    const scores: number[] = scored.map((s: any) => s.score ?? 0);

    return NextResponse.json({
      id: String(schedule.id),
      title: schedule.title,
      token: schedule.token,
      start_at: schedule.start_at.toISOString(),
      end_at: schedule.end_at.toISOString(),
      status: schedule.status,
      package: {
        id: String(schedule.package.id),
        title: schedule.package.title,
        exam_type: schedule.package.exam_type,
        duration: schedule.package.duration,
        passing_grade: passingGrade,
        question_count: questionCount,
        questions: schedule.package.questions.map((pq: any) => ({
          id: String(pq.question.id),
          order: pq.order,
          question_text: pq.question.question_text,
          question_type: pq.question.question_type,
          options: pq.question.options,
          correct_answer: pq.question.correct_answer,
        })),
      },
      rombel: {
        id: String(schedule.rombel.id),
        name: schedule.rombel.name,
        className: schedule.rombel.class.name,
        student_count: schedule.rombel.students.length,
      },
      students,
      stats: {
        total: students.length,
        submitted: submitted.length,
        scored: scored.length,
        passed: passed.length,
        not_started: students.filter((s: any) => s.status === "BELUM").length,
        in_progress: students.filter((s: any) => s.status === "MENGERJAKAN").length,
        avg_score: avgScore !== null ? Math.round(avgScore * 10) / 10 : null,
        highest_score: scores.length > 0 ? Math.max(...scores) : null,
        lowest_score: scores.length > 0 ? Math.min(...scores) : null,
        pass_rate: scored.length > 0 ? Math.round((passed.length / scored.length) * 100) : null,
      },
    });
  } catch (error) {
    console.error("Error fetching detail hasil:", error);
    return NextResponse.json({ error: "Failed to fetch detail hasil" }, { status: 500 });
  }
}
