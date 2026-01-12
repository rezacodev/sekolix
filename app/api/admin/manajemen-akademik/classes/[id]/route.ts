import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const updateSchema = z.object({
  name: z.string().min(1).optional()
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const classData = await prisma.class.findUnique({
      where: { id: BigInt(id), deleted_at: null },
      include: {
        rombels: {
          include: {
            program: { select: { id: true, name: true } },
            students: { select: { id: true, fullName: true } }
          }
        },
        teacherSubjects: {
          include: {
            teacher: { select: { id: true, name: true } },
            subject: { select: { id: true, name: true } }
          }
        }
      }
    });

    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Convert BigInt to number for JSON serialization
    const serializedClass = {
      ...classData,
      id: Number(classData.id),
      rombels: classData.rombels.map((cg) => ({
        ...cg,
        id: Number(cg.id),
        class_id: Number(cg.class_id)
      })),
      teacherSubjects: classData.teacherSubjects.map(ts => ({
        ...ts,
        id: Number(ts.id),
        subject_id: Number(ts.subject_id),
        class_id: Number(ts.class_id)
      }))
    };

    return NextResponse.json(serializedClass);
  } catch (error) {
    console.error("Error fetching class:", error);
    return NextResponse.json({ error: "Failed to fetch class" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateSchema.parse(body);

    const classData = await prisma.class.update({
      where: { id: BigInt(id) },
      data: validated
    });

    // Convert BigInt to number for JSON serialization
    const serializedClass = {
      ...classData,
      id: Number(classData.id)
    };

    return NextResponse.json(serializedClass);
  } catch (error) {
    console.error("Error updating class:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to update class" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.class.update({
      where: { id: BigInt(id) },
      data: { deleted_at: new Date() }
    });

    return NextResponse.json({ message: "Class deleted successfully" });
  } catch (error) {
    console.error("Error deleting class:", error);
    return NextResponse.json({ error: "Failed to delete class" }, { status: 500 });
  }
}
