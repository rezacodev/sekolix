import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const updateSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional()
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const validated = updateSchema.parse(body);
    const curriculum = await prisma.curriculum.update({
      where: { id: BigInt(id) },
      data: validated
    });

    // Convert BigInt to number for JSON serialization
    const serializedCurriculum = {
      ...curriculum,
      id: Number(curriculum.id)
    };

    return NextResponse.json(serializedCurriculum);
  } catch (error) {
    console.error("Error updating curriculum:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Invalid data or not found" }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.curriculum.update({
      where: { id: BigInt(id), deleted_at: null },
      data: { deleted_at: new Date() }
    });
    return NextResponse.json({ message: "Deleted" });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
