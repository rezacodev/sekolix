import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession();

  if (!session?.user || session.user.role !== "MURID") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const rombelId = searchParams.get("rombelId");
  const subjectId = searchParams.get("subjectId");

  // TODO: Fetch from database
  // SELECT * FROM forum_threads
  // WHERE rombel_id = rombelId AND subject_id = subjectId
  // ORDER BY is_pinned DESC, created_at DESC

  const threads = [
    {
      id: "1",
      title: "Bagaimana cara menyelesaikan soal limit?",
      author: "Andi Wijaya",
      content: "Saya kesulitan memahami aturan L'Hopital...",
      timestamp: "2026-05-28T10:30:00Z",
      isPinned: false,
      replyCount: 3,
      likes: 5,
    },
  ];

  return NextResponse.json(threads);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();

  if (!session?.user || session.user.role !== "MURID") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rombelId, title, content } = await req.json();

  // TODO: Save forum thread
  // INSERT INTO forum_threads (rombel_id, user_id, title, content, created_at)
  // VALUES (rombelId, session.user.id, title, content, NOW())

  return NextResponse.json({ success: true });
}
