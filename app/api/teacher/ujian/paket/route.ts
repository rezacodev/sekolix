import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { teacherCanAccessSubject, teacherOwnsQuestions } from "@/lib/api/scope";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { z } from "zod";

async function getTeacherContext(): Promise<{ staffId: string; userId: string; name?: string | null } | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { staff: true },
  });
  const staffId = user?.staff?.[0]?.id;
  return user && staffId ? { staffId, userId: user.id, name: user.name } : null;
}

const createSchema = z.object({
  subject_id: z.coerce.bigint(),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  exam_type: z.enum(["KUIS", "UTS", "UAS", "ULANGAN_HARIAN", "LATIHAN"]).default("KUIS"),
  duration: z.coerce.number().int().min(1).default(60),
  passing_grade: z.coerce.number().int().min(0).max(100).default(70),
  randomize: z.boolean().default(false),
  question_ids: z.array(z.coerce.bigint()).default([]),
});

const listQuerySchema = z.object({
  subjectId: z.coerce.bigint().optional(),
  status: z.enum(["draft", "published"]).optional(),
  search: z.string().max(100).default(""),
  page: z.coerce.number().int().min(0).default(0),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

// GET /api/teacher/ujian/paket
export async function GET(request: Request) {
  try {
    const teacher = await getTeacherContext();
    if (!teacher) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { staffId } = teacher;

    const { searchParams } = new URL(request.url);
    const parsedQuery = listQuerySchema.safeParse(Object.fromEntries(searchParams));
    if (!parsedQuery.success) {
      return NextResponse.json({ error: "Invalid query", details: parsedQuery.error.flatten() }, { status: 400 });
    }

    const { subjectId, status, search, page, pageSize } = parsedQuery.data;

    const where = {
      teacher_id: staffId,
      deleted_at: null,
      ...(subjectId ? { subject_id: subjectId } : {}),
      ...(status === "published" ? { is_published: true } : status === "draft" ? { is_published: false } : {}),
      ...(search ? { title: { contains: search, mode: "insensitive" as const } } : {}),
    };

    const [packages, totalCount] = await Promise.all([
      prisma.examPackage.findMany({
        where,
        skip: page * pageSize,
        take: pageSize,
        orderBy: { created_at: "desc" },
        include: {
          subject: { select: { id: true, name: true } },
          questions: { select: { id: true } },
        },
      }),
      prisma.examPackage.count({ where }),
    ]);

    return NextResponse.json({
      data: packages.map((p) => ({
        id: String(p.id),
        teacher_id: p.teacher_id,
        subject_id: Number(p.subject_id),
        subjectName: p.subject.name,
        title: p.title,
        description: p.description,
        exam_type: p.exam_type,
        duration: p.duration,
        passing_grade: p.passing_grade,
        randomize: p.randomize,
        is_published: p.is_published,
        question_count: p.questions.length,
        created_at: p.created_at.toISOString(),
        updated_at: p.updated_at.toISOString(),
      })),
      totalCount,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("Error fetching exam packages:", error);
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 });
  }
}

// POST /api/teacher/ujian/paket
export async function POST(request: Request) {
  try {
    const teacher = await getTeacherContext();
    if (!teacher) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { staffId } = teacher;

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 400 });
    }

    const { question_ids, ...data } = parsed.data;
    const uniqueQuestionIds = Array.from(new Set(question_ids));

    const canUseSubject = await teacherCanAccessSubject(staffId, data.subject_id);
    if (!canUseSubject) {
      return NextResponse.json({ error: "Subject outside teacher scope" }, { status: 403 });
    }

    const canUseQuestions = await teacherOwnsQuestions(staffId, data.subject_id, uniqueQuestionIds);
    if (!canUseQuestions) {
      return NextResponse.json({ error: "One or more questions are outside teacher scope" }, { status: 403 });
    }

    const pkg = await prisma.examPackage.create({
      data: {
        teacher_id: staffId,
        subject_id: data.subject_id,
        title: data.title,
        description: data.description ?? null,
        exam_type: data.exam_type,
        duration: data.duration,
        passing_grade: data.passing_grade,
        randomize: data.randomize,
        questions: {
          create: uniqueQuestionIds.map((qid, idx) => ({
            question_id: qid,
            order: idx,
          })),
        },
      },
      include: { questions: { select: { id: true } } },
    });

    await logActivity({
      actorUserId: teacher.userId,
      actorName: teacher.name,
      module: "teacher.cbt",
      action: "create",
      entityType: "ExamPackage",
      entityId: String(pkg.id),
      metadata: {
        subjectId: String(pkg.subject_id),
        questionCount: pkg.questions.length,
      },
      request,
    });
    await writeAuditTrail({
      actorUserId: teacher.userId,
      entityType: "ExamPackage",
      entityId: String(pkg.id),
      action: "create",
      after: pkg,
      reason: "Teacher CBT package create",
      metadata: {
        subjectId: String(pkg.subject_id),
        questionCount: pkg.questions.length,
      },
    });

    return NextResponse.json(
      {
        id: String(pkg.id),
        teacher_id: pkg.teacher_id,
        subject_id: Number(pkg.subject_id),
        title: pkg.title,
        description: pkg.description,
        exam_type: pkg.exam_type,
        duration: pkg.duration,
        passing_grade: pkg.passing_grade,
        randomize: pkg.randomize,
        is_published: pkg.is_published,
        question_count: pkg.questions.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating exam package:", error);
    return NextResponse.json({ error: "Failed to create package" }, { status: 500 });
  }
}
