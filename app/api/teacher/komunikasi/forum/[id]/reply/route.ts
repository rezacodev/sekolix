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

const replySchema = z.object({ content: z.string().min(1) });
type Params = { params: Promise<{ id: string }> };

// POST /api/teacher/komunikasi/forum/[id]/reply
export async function POST(request: Request, { params }: Params) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const parsed = replySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Validation error" }, { status: 400 });

    const discussion = await prisma.discussion.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });
    if (!discussion) return NextResponse.json({ error: "Discussion not found" }, { status: 404 });
    if (discussion.is_closed) return NextResponse.json({ error: "Diskusi sudah ditutup" }, { status: 400 });

    const reply = await prisma.discussionReply.create({
      data: {
        discussion_id: BigInt(id),
        author_id: staffId,
        author_type: "TEACHER",
        content: parsed.data.content,
      },
    });

    return NextResponse.json({
      id: String(reply.id),
      content: reply.content,
      author_type: reply.author_type,
      created_at: reply.created_at.toISOString(),
    }, { status: 201 });
  } catch (error) {
    console.error("Error posting reply:", error);
    return NextResponse.json({ error: "Failed to post reply" }, { status: 500 });
  }
}
