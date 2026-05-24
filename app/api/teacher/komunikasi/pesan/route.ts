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

const sendSchema = z.object({
  receiver_id: z.string().min(1),
  receiver_type: z.enum(["TEACHER", "STUDENT", "PARENT", "ADMIN"]).default("TEACHER"),
  subject: z.string().optional(),
  content: z.string().min(1),
});

// GET /api/teacher/komunikasi/pesan — list conversations (grouped by partner)
export async function GET(request: Request) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";

    // Get all messages involving this teacher
    const messages = await prisma.message.findMany({
      where: {
        deleted_at: null,
        OR: [
          { sender_id: staffId, sender_type: "TEACHER" },
          { receiver_id: staffId, receiver_type: "TEACHER" },
        ],
      },
      orderBy: { created_at: "desc" },
    });

    // Group by conversation partner
    const convMap = new Map<string, {
      partnerId: string;
      partnerType: string;
      lastMessage: string;
      lastAt: string;
      unread: number;
    }>();

    for (const msg of messages) {
      const isMe = msg.sender_id === staffId;
      const partnerId = isMe ? msg.receiver_id : msg.sender_id;
      const partnerType = isMe ? msg.receiver_type : msg.sender_type;
      const key = `${partnerType}:${partnerId}`;

      if (!convMap.has(key)) {
        convMap.set(key, {
          partnerId,
          partnerType,
          lastMessage: msg.content.slice(0, 100),
          lastAt: msg.created_at.toISOString(),
          unread: !isMe && !msg.is_read ? 1 : 0,
        });
      } else {
        const conv = convMap.get(key)!;
        if (!isMe && !msg.is_read) conv.unread++;
      }
    }

    // Fetch partner names
    const teacherIds = [...convMap.values()]
      .filter((c) => c.partnerType === "TEACHER")
      .map((c) => c.partnerId);

    const teachers = await prisma.staff.findMany({
      where: { id: { in: teacherIds } },
      select: { id: true, fullName: true, gtkPosition: true },
    });
    const teacherMap = new Map(teachers.map((t) => [t.id, t]));

    const conversations = Array.from(convMap.values())
      .map((conv) => {
        let partnerName = conv.partnerId;
        if (conv.partnerType === "TEACHER") {
          partnerName = teacherMap.get(conv.partnerId)?.fullName ?? conv.partnerId;
        }
        return { ...conv, partnerName };
      })
      .filter((c) => !search || c.partnerName.toLowerCase().includes(search.toLowerCase()));

    const unreadTotal = messages.filter((m) => m.receiver_id === staffId && !m.is_read).length;

    return NextResponse.json({ conversations, unreadTotal });
  } catch (error) {
    console.error("Error fetching pesan:", error);
    return NextResponse.json({ error: "Failed to fetch pesan" }, { status: 500 });
  }
}

// POST /api/teacher/komunikasi/pesan — send new message
export async function POST(request: Request) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const parsed = sendSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 400 });

    const { receiver_id, receiver_type, subject, content } = parsed.data;

    const message = await prisma.message.create({
      data: {
        sender_id: staffId,
        sender_type: "TEACHER",
        receiver_id,
        receiver_type,
        subject: subject ?? null,
        content,
      },
    });

    return NextResponse.json({ id: String(message.id), created_at: message.created_at.toISOString() }, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
