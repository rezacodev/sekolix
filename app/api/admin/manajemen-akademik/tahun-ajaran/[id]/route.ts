import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const updateSchema = z.object({
  label: z.string().min(1).optional(),
  yearCode: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().optional(),
  registrationFee: z.number().int().optional()
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const tahunAjaran = await prisma.tahunAjaran.findUnique({
      where: { id, deleted_at: null }
    });

    if (!tahunAjaran) {
      return NextResponse.json({ error: "Tahun ajaran not found" }, { status: 404 });
    }

    return NextResponse.json(tahunAjaran);
  } catch (error) {
    console.error("Error fetching tahun ajaran:", error);
    return NextResponse.json({ error: "Failed to fetch tahun ajaran" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateSchema.parse(body);

    const tahunAjaran = await prisma.tahunAjaran.update({
      where: { id },
      data: {
        ...validated,
        startDate: validated.startDate ? new Date(validated.startDate) : undefined,
        endDate: validated.endDate ? new Date(validated.endDate) : undefined
      }
    });

    return NextResponse.json(tahunAjaran);
  } catch (error) {
    console.error("Error updating tahun ajaran:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to update tahun ajaran" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.tahunAjaran.update({
      where: { id },
      data: { deleted_at: new Date() }
    });

    return NextResponse.json({ message: "Tahun ajaran deleted successfully" });
  } catch (error) {
    console.error("Error deleting tahun ajaran:", error);
    return NextResponse.json({ error: "Failed to delete tahun ajaran" }, { status: 500 });
  }
}
