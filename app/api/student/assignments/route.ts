import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession();

  if (!session || session.user.role !== "MURID") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const rombelId = searchParams.get("rombelId");
  const status = searchParams.get("status") || "all";
  const page = searchParams.get("page") || "1";

  // TODO: Fetch from database
  // SELECT * FROM assignments
  // WHERE rombel_id = rombelId AND status_assignment = status (or all)

  const assignments = [
    {
      id: "1",
      title: "PR Bab 1",
      description: "Kerjakan soal hal 15-20",
      type: "upload",
      dueDate: "2026-05-31",
      point: 20,
      status: "dinilai",
      grade: 85,
    },
  ];

  return NextResponse.json(assignments);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();

  if (!session || session.user.role !== "MURID") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { assignmentId, submission } = await req.json();

  // TODO: Save assignment submission
  // INSERT INTO assignment_submissions (assignment_id, peserta_didik_id, content, submitted_at)
  // VALUES (assignmentId, session.user.id, submission, NOW())

  return NextResponse.json({ success: true });
}
