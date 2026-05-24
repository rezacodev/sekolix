import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getStaffId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { staff: true },
  });
  return user?.staff?.[0]?.id ?? null;
}

// POST /api/teacher/ujian/paket/[id]/publish
// Body: { publish: boolean } — true to publish, false to unpublish
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const publish: boolean = body.publish !== false; // default true

    const existing = await prisma.examPackage.findFirst({
      where: { id: BigInt(id), teacher_id: staffId, deleted_at: null },
      include: { questions: { select: { id: true } } },
    });
    if (!existing) return NextResponse.json({ error: "Package not found" }, { status: 404 });

    if (publish && existing.questions.length === 0) {
      return NextResponse.json(
        { error: "Tidak dapat mempublikasi paket tanpa soal. Tambahkan soal terlebih dahulu." },
        { status: 400 }
      );
    }

    const pkg = await prisma.examPackage.update({
      where: { id: BigInt(id) },
      data: { is_published: publish },
    });

    return NextResponse.json({ success: true, is_published: pkg.is_published });
  } catch (error) {
    console.error("Error publishing package:", error);
    return NextResponse.json({ error: "Failed to update publish status" }, { status: 500 });
  }
}
