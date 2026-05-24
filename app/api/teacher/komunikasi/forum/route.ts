import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

async function getStaffId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.staffId) return null;
  return session.user.staffId;
}

const createSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  rombel_id: z.number().int().optional(),
  subject_id: z.number().int().optional(),
  is_pinned: z.boolean().optional(),
});

// GET /api/teacher/komunikasi/forum
export async function GET(request: Request) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const rombelId = searchParams.get("rombelId");
    const status = searchParams.get("status"); // "open" | "closed"
    const search = searchParams.get("search") ?? "";
    const page = parseInt(searchParams.get("page") ?? "0");
    const pageSize = parseInt(searchParams.get("pageSize") ?? "20");

    const where = {
      teacher_id: staffId,
      deleted_at: null,
      ...(rombelId ? { rombel_id: BigInt(rombelId) } : {}),
      ...(status === "open" ? { is_closed: false } : status === "closed" ? { is_closed: true } : {}),
      ...(search ? { title: { contains: search, mode: "insensitive" as const } } : {}),
    };

    const [discussions, totalCount] = await Promise.all([
      prisma.discussion.findMany({
        where,
        skip: page * pageSize,
        take: pageSize,
        orderBy: [{ is_pinned: "desc" }, { created_at: "desc" }],
        include: {
          rombel: { select: { id: true, name: true, class: { select: { name: true } } } },
          subject: { select: { id: true, name: true } },
          _count: { select: { replies: { where: { deleted_at: null } } } },
        },
      }),
      prisma.discussion.count({ where }),
    ]);

    // Get teacher's rombels for filter
    const teacherSubjects = await prisma.teacherSubject.findMany({
      where: { teacher_id: staffId, deleted_at: null },
      include: {
        rombel: { select: { id: true, name: true, class: { select: { name: true } } } },
        subject: { select: { id: true, name: true } },
      },
    });
    const filterRombels = teacherSubjects
      .filter((ts) => ts.rombel)
      .map((ts) => ({ id: String(ts.rombel_id), name: ts.rombel!.name, className: ts.rombel!.class.name }))
      .filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i);

    return NextResponse.json({
      data: discussions.map((d) => ({
        id: String(d.id),
        title: d.title,
        content: d.content.slice(0, 200),
        is_pinned: d.is_pinned,
        is_closed: d.is_closed,
        reply_count: d._count.replies,
        created_at: d.created_at.toISOString(),
        rombel: d.rombel ? { id: String(d.rombel.id), name: d.rombel.name, className: d.rombel.class.name } : null,
        subject: d.subject ? { id: String(d.subject.id), name: d.subject.name } : null,
      })),
      totalCount,
      page,
      pageSize,
      filters: { rombels: filterRombels },
    });
  } catch (error) {
    console.error("Error fetching forum:", error);
    return NextResponse.json({ error: "Failed to fetch forum" }, { status: 500 });
  }
}

// POST /api/teacher/komunikasi/forum
export async function POST(request: Request) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 400 });

    const { title, content, rombel_id, subject_id, is_pinned } = parsed.data;

    const discussion = await prisma.discussion.create({
      data: {
        teacher_id: staffId,
        title,
        content,
        ...(rombel_id ? { rombel_id: BigInt(rombel_id) } : {}),
        ...(subject_id ? { subject_id: BigInt(subject_id) } : {}),
        is_pinned: is_pinned ?? false,
      },
    });

    return NextResponse.json({ id: String(discussion.id), title: discussion.title }, { status: 201 });
  } catch (error) {
    console.error("Error creating discussion:", error);
    return NextResponse.json({ error: "Failed to create discussion" }, { status: 500 });
  }
}
