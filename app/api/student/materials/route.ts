import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "MURID") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const rombelId = searchParams.get("rombelId");
  const subjectId = searchParams.get("subjectId");
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") || "10")));

  const student = session.user.email
    ? await prisma.pesertaDidik.findFirst({
        where: { email: session.user.email, deleted_at: null },
        include: { rombels: { where: { deleted_at: null }, select: { id: true, class_id: true } } },
      })
    : null;

  if (!student) return NextResponse.json([]);

  const scopedRombels = student.rombels;
  const selectedRombel = rombelId
    ? scopedRombels.find((rombel) => String(rombel.id) === rombelId)
    : scopedRombels[0];

  if (!selectedRombel) return NextResponse.json([]);

  const materials = await prisma.learningMaterial.findMany({
    where: {
      deleted_at: null,
      online_class: {
        class_id: selectedRombel.class_id,
        ...(subjectId ? { subject_id: BigInt(subjectId) } : {}),
      },
    },
    include: {
      online_class: {
        include: {
          subject: { select: { name: true } },
        },
      },
    },
    orderBy: [{ order: "asc" }, { created_at: "desc" }],
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const response = materials.map((material) => ({
    id: String(material.id),
    title: material.title,
    description: material.online_class.subject.name,
    type: material.type.toLowerCase(),
    url: material.content ?? "",
    uploadedBy: "Guru",
    uploadedDate: material.created_at.toISOString(),
    releaseDate: material.created_at.toISOString(),
    isPublished: true,
    accessCount: 0,
  }));

  return NextResponse.json(response);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "MURID") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { materialId } = await req.json();
  if (!materialId) {
    return NextResponse.json({ error: "materialId wajib diisi" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
