import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

// GET — list semua mata pelajaran dengan KKM-nya
export async function GET() {
  try {
    if (!await requireAdmin()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subjects = await prisma.subject.findMany({
      where: { deleted_at: null },
      select: { id: true, code: true, name: true, is_practice: true, kkm: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      subjects: subjects.map(s => ({
        id: Number(s.id),
        code: s.code,
        name: s.name,
        is_practice: s.is_practice,
        kkm: s.kkm ?? 75,
      })),
    });
  } catch (error) {
    console.error("Error fetching KKM:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const updateSchema = z.object({
  updates: z.array(
    z.object({
      id: z.number().int().positive(),
      kkm: z.number().int().min(0).max(100),
    })
  ).min(1),
});

// PUT — batch update KKM untuk banyak mata pelajaran sekaligus
export async function PUT(request: NextRequest) {
  try {
    if (!await requireAdmin()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { updates } = updateSchema.parse(body);

    await Promise.all(
      updates.map(({ id, kkm }) =>
        prisma.subject.update({
          where: { id: BigInt(id) },
          data: { kkm },
        })
      )
    );

    return NextResponse.json({ success: true, updated: updates.length });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    console.error("Error updating KKM:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
