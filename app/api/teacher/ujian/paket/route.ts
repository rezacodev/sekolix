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

const createSchema = z.object({
  subject_id: z.number().int(),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  exam_type: z.enum(["KUIS", "UTS", "UAS", "ULANGAN_HARIAN", "LATIHAN"]).default("KUIS"),
  duration: z.number().int().min(1).default(60),
  passing_grade: z.number().int().min(0).max(100).default(70),
  randomize: z.boolean().default(false),
  question_ids: z.array(z.number().int()).default([]),
});

function serializePackage(p: Record<string, unknown>) {
  return {
    ...p,
    id: String(p.id),
    subject_id: Number(p.subject_id),
    question_count: (p.questions as unknown[])?.length ?? p.question_count ?? 0,
  };
}

// GET /api/teacher/ujian/paket
export async function GET(request: Request) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");
    const status = searchParams.get("status"); // "draft" | "published"
    const search = searchParams.get("search") ?? "";
    const page = parseInt(searchParams.get("page") ?? "0");
    const pageSize = parseInt(searchParams.get("pageSize") ?? "20");

    const where = {
      teacher_id: staffId,
      deleted_at: null,
      ...(subjectId ? { subject_id: BigInt(subjectId) } : {}),
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
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 400 });
    }

    const { question_ids, ...data } = parsed.data;

    const pkg = await prisma.examPackage.create({
      data: {
        teacher_id: staffId,
        subject_id: BigInt(data.subject_id),
        title: data.title,
        description: data.description ?? null,
        exam_type: data.exam_type,
        duration: data.duration,
        passing_grade: data.passing_grade,
        randomize: data.randomize,
        questions: {
          create: question_ids.map((qid, idx) => ({
            question_id: BigInt(qid),
            order: idx,
          })),
        },
      },
      include: { questions: { select: { id: true } } },
    });

    return NextResponse.json(
      serializePackage(pkg as unknown as Record<string, unknown>),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating exam package:", error);
    return NextResponse.json({ error: "Failed to create package" }, { status: 500 });
  }
}
