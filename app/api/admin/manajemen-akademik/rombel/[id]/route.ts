import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const updateSchema = z.object({
  class_id: z.number().int().optional(),
  program_id: z.string().optional(),
  tahunAjaranId: z.string().optional(),
  name: z.string().min(1).optional(),
  capacity: z.number().int().optional()
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rombel = await prisma.rombel.findUnique({
      where: { id: BigInt(id), deleted_at: null },
      include: {
        class: true,
        program: { select: { id: true, name: true } },
        tahunAjaran: { select: { id: true, label: true } },
        students: {
          select: {
            id: true,
            fullName: true,
            nisn: true,
            gender: true,
            placeOfBirth: true,
            dateOfBirth: true,
            religion: true,
            phone: true
          },
          orderBy: { fullName: "asc" }
        }
      }
    });

    if (!rombel) {
      return NextResponse.json({ error: "Rombel not found" }, { status: 404 });
    }

    const serializedRombel = {
      ...rombel,
      id: Number(rombel.id),
      class_id: Number(rombel.class_id),
      class: {
        ...rombel.class,
        id: Number(rombel.class.id)
      },
      tahunAjaran: rombel.tahunAjaran
    };

    return NextResponse.json(serializedRombel);
  } catch (error) {
    console.error("Error fetching rombel:", error);
    return NextResponse.json({ error: "Failed to fetch rombel" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateSchema.parse(body);

    const rombel = await prisma.rombel.update({
      where: { id: BigInt(id) },
      data: {
        ...(validated.class_id && { class_id: BigInt(validated.class_id) }),
        ...(validated.program_id && { program_id: validated.program_id }),
        ...(validated.tahunAjaranId && { tahunAjaranId: validated.tahunAjaranId }),
        ...(validated.name && { name: validated.name }),
        ...(validated.capacity !== undefined && { capacity: validated.capacity })
      },
      include: {
        class: true,
        program: { select: { id: true, name: true } },
        tahunAjaran: { select: { id: true, label: true } },
        students: {
          select: {
            id: true,
            fullName: true,
            nisn: true,
            gender: true,
            placeOfBirth: true,
            dateOfBirth: true,
            religion: true,
            phone: true
          }
        }
      }
    });

    const serializedRombel = {
      ...rombel,
      id: Number(rombel.id),
      class_id: Number(rombel.class_id),
      class: {
        ...rombel.class,
        id: Number(rombel.class.id)
      },
      tahunAjaran: rombel.tahunAjaran
    };

    return NextResponse.json(serializedRombel);
  } catch (error) {
    console.error("Error updating rombel:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to update rombel" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.rombel.update({
      where: { id: BigInt(id) },
      data: { deleted_at: new Date() }
    });

    return NextResponse.json({ message: "Rombel deleted successfully" });
  } catch (error) {
    console.error("Error deleting rombel:", error);
    return NextResponse.json({ error: "Failed to delete rombel" }, { status: 500 });
  }
}
