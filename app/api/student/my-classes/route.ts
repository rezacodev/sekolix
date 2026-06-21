import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession();

  if (!session?.user || session.user.role !== "MURID") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Fetch from database
  // SELECT * FROM rosters WHERE peserta_didik_id = session.user.id
  const classes = [
    {
      id: "1",
      name: "X-A",
      grade: "Kelas 10",
      year: "2025/2026",
      subjects: [
        { name: "Matematika", teacher: "Budi Santoso" },
        { name: "Fisika", teacher: "Ahmad Rizki" },
      ],
    },
  ];

  return NextResponse.json(classes);
}
