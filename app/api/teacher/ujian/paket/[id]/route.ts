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

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  exam_type: z.enum(["KUIS", "UTS", "UAS", "ULANGAN_HARIAN", "LATIHAN"]).optional(),
  duration: z.number().int().min(1).optional(),
  passing_grade: z.number().int().min(0).max(100).optional(),
  randomize: z.boolean().optional(),
  question_ids: z.array(z.number().int()).optional(),
});

type Params = { params: Promise<{ id: string }> };

// GET /api/teacher/ujian/paket/[id]
export async function GET(_req: Request, { params }: Params) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const pkg = await prisma.examPackage.findFirst({
      where: { id: BigInt(id), teacher_id: staffId, deleted_at: null },
      include: {
        subject: { select: { id: true, name: true } },
        questions: {
          orderBy: { order: "asc" },
          include: {
            question: {
              select: {
                id: true,
                question_type: true,
                difficulty: true,
                cognitive_level: true,
                question_text: true,
                options: true,
                correct_answer: true,
                explanation: true,
                tags: true,
                topic: true,
              },
            },
          },
        },
      },
    });

    if (!pkg) return NextResponse.json({ error: "Package not found" }, { status: 404 });

    return NextResponse.json({
      id: String(pkg.id),
      teacher_id: pkg.teacher_id,
      subject_id: Number(pkg.subject_id),
      subjectName: pkg.subject.name,
      title: pkg.title,
      description: pkg.description,
      exam_type: pkg.exam_type,
      duration: pkg.duration,
      passing_grade: pkg.passing_grade,
      randomize: pkg.randomize,
      is_published: pkg.is_published,
      created_at: pkg.created_at.toISOString(),
      updated_at: pkg.updated_at.toISOString(),
      questions: pkg.questions.map((pq) => ({
        order: pq.order,
        id: String(pq.question.id),
        question_type: pq.question.question_type,
        difficulty: pq.question.difficulty,
        cognitive_level: pq.question.cognitive_level,
        question_text: pq.question.question_text,
        options: pq.question.options,
        correct_answer: pq.question.correct_answer,
        explanation: pq.question.explanation,
        tags: pq.question.tags,
        topic: pq.question.topic,
      })),
    });
  } catch (error) {
    console.error("Error fetching package:", error);
    return NextResponse.json({ error: "Failed to fetch package" }, { status: 500 });
  }
}

// PUT /api/teacher/ujian/paket/[id]
export async function PUT(request: Request, { params }: Params) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const existing = await prisma.examPackage.findFirst({
      where: { id: BigInt(id), teacher_id: staffId, deleted_at: null },
    });
    if (!existing) return NextResponse.json({ error: "Package not found" }, { status: 404 });

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 400 });
    }

    const { question_ids, ...fields } = parsed.data;

    const pkg = await prisma.$transaction(async (tx) => {
      // Replace questions if provided
      if (question_ids !== undefined) {
        await tx.examPackageQuestion.deleteMany({ where: { package_id: BigInt(id) } });
        if (question_ids.length > 0) {
          await tx.examPackageQuestion.createMany({
            data: question_ids.map((qid, idx) => ({
              package_id: BigInt(id),
              question_id: BigInt(qid),
              order: idx,
            })),
          });
        }
      }

      return tx.examPackage.update({
        where: { id: BigInt(id) },
        data: {
          ...(fields.title !== undefined ? { title: fields.title } : {}),
          ...(fields.description !== undefined ? { description: fields.description } : {}),
          ...(fields.exam_type !== undefined ? { exam_type: fields.exam_type } : {}),
          ...(fields.duration !== undefined ? { duration: fields.duration } : {}),
          ...(fields.passing_grade !== undefined ? { passing_grade: fields.passing_grade } : {}),
          ...(fields.randomize !== undefined ? { randomize: fields.randomize } : {}),
        },
        include: { questions: { select: { id: true } } },
      });
    });

    return NextResponse.json({
      id: String(pkg.id),
      title: pkg.title,
      is_published: pkg.is_published,
      question_count: pkg.questions.length,
    });
  } catch (error) {
    console.error("Error updating package:", error);
    return NextResponse.json({ error: "Failed to update package" }, { status: 500 });
  }
}

// DELETE /api/teacher/ujian/paket/[id]
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const existing = await prisma.examPackage.findFirst({
      where: { id: BigInt(id), teacher_id: staffId, deleted_at: null },
    });
    if (!existing) return NextResponse.json({ error: "Package not found" }, { status: 404 });

    await prisma.examPackage.update({
      where: { id: BigInt(id) },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting package:", error);
    return NextResponse.json({ error: "Failed to delete package" }, { status: 500 });
  }
}
