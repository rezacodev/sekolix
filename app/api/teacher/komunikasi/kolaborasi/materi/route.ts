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

const shareSchema = z.object({
  materialId: z.string().min(1),
  isShared: z.boolean(),
});

// GET /api/teacher/komunikasi/kolaborasi/materi — shared teaching materials from all teachers
export async function GET(request: Request) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";
    const subjectId = searchParams.get("subjectId") ?? "";
    const showMine = searchParams.get("showMine") === "true";
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? "20")));
    const skip = (page - 1) * limit;

    const where = {
      is_shared: true,
      deleted_at: null,
      ...(showMine ? { teacher_id: staffId } : {}),
      ...(subjectId ? { subject_id: BigInt(subjectId) } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              { description: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [materials, total] = await Promise.all([
      prisma.teachingMaterial.findMany({
        where,
        include: {
          teacher: { select: { id: true, name: true } },
          subject: { select: { id: true, name: true } },
        },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.teachingMaterial.count({ where }),
    ]);

    const result = materials.map((m) => ({
      id: String(m.id),
      title: m.title,
      description: m.description ?? null,
      fileUrl: m.file_url ?? null,
      fileType: m.file_type ?? null,
      is_shared: m.is_shared,
      isMine: m.teacher_id === staffId,
      teacher: { id: m.teacher.id, name: m.teacher.name },
      subject: m.subject ? { id: String(m.subject.id), name: m.subject.name } : null,
      created_at: m.created_at.toISOString(),
    }));

    return NextResponse.json({ materials: result, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Error fetching shared materials:", error);
    return NextResponse.json({ error: "Failed to fetch materials" }, { status: 500 });
  }
}

// PUT /api/teacher/komunikasi/kolaborasi/materi — toggle is_shared on own material
export async function PUT(request: Request) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const parsed = shareSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Validation error" }, { status: 400 });

    const { materialId, isShared } = parsed.data;

    const material = await prisma.teachingMaterial.findFirst({
      where: { id: BigInt(materialId), teacher_id: staffId, deleted_at: null },
    });
    if (!material) return NextResponse.json({ error: "Material not found or unauthorized" }, { status: 404 });

    const updated = await prisma.teachingMaterial.update({
      where: { id: BigInt(materialId) },
      data: { is_shared: isShared },
    });

    return NextResponse.json({ id: String(updated.id), is_shared: updated.is_shared });
  } catch (error) {
    console.error("Error updating material share:", error);
    return NextResponse.json({ error: "Failed to update material" }, { status: 500 });
  }
}
