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

type Params = { params: Promise<{ id: string }> };

const replySchema = z.object({ content: z.string().min(1) });
const updateSchema = z.object({
  is_pinned: z.boolean().optional(),
  is_closed: z.boolean().optional(),
});

// GET /api/teacher/komunikasi/forum/[id] — detail + replies
export async function GET(_req: Request, { params }: Params) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const discussion = await prisma.discussion.findFirst({
      where: { id: BigInt(id), teacher_id: staffId, deleted_at: null },
      include: {
        rombel: { select: { id: true, name: true, class: { select: { name: true } } } },
        subject: { select: { id: true, name: true } },
        replies: {
          where: { deleted_at: null },
          orderBy: { created_at: "asc" },
        },
      },
    });

    if (!discussion) return NextResponse.json({ error: "Discussion not found" }, { status: 404 });

    // Fetch author names for replies
    const teacherReplies = discussion.replies.filter((r) => r.author_type === "TEACHER");
    const teacherIds = [...new Set(teacherReplies.map((r) => r.author_id))];
    const teachers = await prisma.staff.findMany({
      where: { id: { in: teacherIds } },
      select: { id: true, fullName: true },
    });
    const teacherMap = new Map(teachers.map((t) => [t.id, t.fullName]));

    return NextResponse.json({
      id: String(discussion.id),
      title: discussion.title,
      content: discussion.content,
      is_pinned: discussion.is_pinned,
      is_closed: discussion.is_closed,
      created_at: discussion.created_at.toISOString(),
      rombel: discussion.rombel
        ? { id: String(discussion.rombel.id), name: discussion.rombel.name, className: discussion.rombel.class.name }
        : null,
      subject: discussion.subject ? { id: String(discussion.subject.id), name: discussion.subject.name } : null,
      replies: discussion.replies.map((r) => ({
        id: String(r.id),
        author_id: r.author_id,
        author_type: r.author_type,
        author_name: r.author_type === "TEACHER"
          ? (teacherMap.get(r.author_id) ?? "Guru")
          : "Siswa",
        content: r.content,
        created_at: r.created_at.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching discussion:", error);
    return NextResponse.json({ error: "Failed to fetch discussion" }, { status: 500 });
  }
}

// PUT /api/teacher/komunikasi/forum/[id] — toggle pinned/closed
export async function PUT(request: Request, { params }: Params) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Validation error" }, { status: 400 });

    const discussion = await prisma.discussion.findFirst({
      where: { id: BigInt(id), teacher_id: staffId, deleted_at: null },
    });
    if (!discussion) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await prisma.discussion.update({
      where: { id: BigInt(id) },
      data: parsed.data,
    });

    return NextResponse.json({ id: String(updated.id), is_pinned: updated.is_pinned, is_closed: updated.is_closed });
  } catch (error) {
    console.error("Error updating discussion:", error);
    return NextResponse.json({ error: "Failed to update discussion" }, { status: 500 });
  }
}

// DELETE /api/teacher/komunikasi/forum/[id]
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const discussion = await prisma.discussion.findFirst({
      where: { id: BigInt(id), teacher_id: staffId, deleted_at: null },
    });
    if (!discussion) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.discussion.update({ where: { id: BigInt(id) }, data: { deleted_at: new Date() } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting discussion:", error);
    return NextResponse.json({ error: "Failed to delete discussion" }, { status: 500 });
  }
}

// POST /api/teacher/komunikasi/forum/[id]/reply handled in sub-route
export { replySchema };
