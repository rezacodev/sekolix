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
  const page = searchParams.get("page") || "1";

  // TODO: Fetch from database
  // SELECT * FROM learning_materials 
  // WHERE rombel_id = rombelId AND subject_id = subjectId AND status = 'published'
  // LIMIT 10 OFFSET (page-1)*10

  const materials = [
    {
      id: "1",
      title: "Bab 1: Pendahuluan",
      description: "Pengenalan konsep dasar",
      type: "pdf",
      url: "/materials/bab1.pdf",
      uploadedBy: "Budi Santoso",
      uploadedDate: "2026-05-01",
      releaseDate: "2026-05-01",
      isPublished: true,
      accessCount: 45,
    },
  ];

  return NextResponse.json(materials);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();

  if (!session?.user || session.user.role !== "MURID") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { materialId } = await req.json();

  // TODO: Track material access
  // INSERT INTO material_accesses (learning_material_id, peserta_didik_id, first_accessed_at)
  // VALUES (materialId, session.user.id, NOW())

  return NextResponse.json({ success: true });
}
