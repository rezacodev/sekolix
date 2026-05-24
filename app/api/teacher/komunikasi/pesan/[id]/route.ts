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

const sendSchema = z.object({ content: z.string().min(1), subject: z.string().optional() });
type Params = { params: Promise<{ id: string }> }; // id = partnerId (staffId)

// GET /api/teacher/komunikasi/pesan/[id] — conversation history with partner
export async function GET(_req: Request, { params }: Params) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: partnerId } = await params;

    const messages = await prisma.message.findMany({
      where: {
        deleted_at: null,
        OR: [
          { sender_id: staffId, receiver_id: partnerId },
          { sender_id: partnerId, receiver_id: staffId },
        ],
      },
      orderBy: { created_at: "asc" },
    });

    // Mark messages from partner as read
    const unread = messages.filter((m) => m.receiver_id === staffId && !m.is_read).map((m) => m.id);
    if (unread.length > 0) {
      await prisma.message.updateMany({
        where: { id: { in: unread } },
        data: { is_read: true, read_at: new Date() },
      });
    }

    // Get partner info
    const partner = await prisma.staff.findFirst({
      where: { id: partnerId },
      select: { id: true, name: true, gtkPosition: true, jabatanPTK: true },
    });

    return NextResponse.json({
      partner: partner
        ? { id: partner.id, name: partner.name, position: partner.jabatanPTK ?? partner.gtkPosition ?? "" }
        : { id: partnerId, name: partnerId, position: "" },
      messages: messages.map((m) => ({
        id: String(m.id),
        sender_id: m.sender_id,
        is_mine: m.sender_id === staffId,
        subject: m.subject ?? null,
        content: m.content,
        is_read: m.is_read,
        created_at: m.created_at.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json({ error: "Failed to fetch conversation" }, { status: 500 });
  }
}

// POST /api/teacher/komunikasi/pesan/[id] — send reply to partner
export async function POST(request: Request, { params }: Params) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: partnerId } = await params;
    const body = await request.json();
    const parsed = sendSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Validation error" }, { status: 400 });

    const message = await prisma.message.create({
      data: {
        sender_id: staffId,
        sender_type: "TEACHER",
        receiver_id: partnerId,
        receiver_type: "TEACHER",
        subject: parsed.data.subject ?? null,
        content: parsed.data.content,
      },
    });

    return NextResponse.json({ id: String(message.id), created_at: message.created_at.toISOString() }, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
