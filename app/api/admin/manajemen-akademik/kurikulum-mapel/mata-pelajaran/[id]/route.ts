import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const updateSchema = z.object({
  code: z.string().optional(),
  curriculum_ids: z.array(z.number().int()).min(1, "Minimal 1 kurikulum harus dipilih").optional(),
  class_ids: z.array(z.number().int()).optional(),
  program_ids: z.array(z.string()).optional(),
  name: z.string().min(1).optional(),
  is_practice: z.boolean().optional()
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const validated = updateSchema.parse(body);

    const subjectId = BigInt(id);

    // Update subject basic data
    const updateData: Record<string, unknown> = {};
    if (validated.code !== undefined) updateData.code = validated.code;
    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.is_practice !== undefined) updateData.is_practice = validated.is_practice;

    // Update curriculums if provided
    if (validated.curriculum_ids !== undefined) {
      // Delete existing curriculums
      await prisma.subjectCurriculum.deleteMany({
        where: { subject_id: subjectId }
      });

      // Create new curriculums
      updateData.curriculums = {
        create: validated.curriculum_ids.map(curriculum_id => ({
          curriculum_id: BigInt(curriculum_id)
        }))
      };
    }

    // Update classes if provided
    if (validated.class_ids !== undefined) {
      // Delete existing classes
      await prisma.subjectClass.deleteMany({
        where: { subject_id: subjectId }
      });

      // Create new classes if array is not empty
      if (validated.class_ids.length > 0) {
        updateData.classes = {
          create: validated.class_ids.map(class_id => ({
            class_id: BigInt(class_id)
          }))
        };
      }
    }

    // Update programs if provided
    if (validated.program_ids !== undefined) {
      // Delete existing programs
      await prisma.subjectProgram.deleteMany({
        where: { subject_id: subjectId }
      });

      // Create new programs if array is not empty
      if (validated.program_ids.length > 0) {
        updateData.programs = {
          create: validated.program_ids.map(program_id => ({
            program_id: program_id
          }))
        };
      }
    }

    const subject = await prisma.subject.update({
      where: { id: subjectId },
      data: updateData,
      include: {
        curriculums: {
          include: { curriculum: true },
          where: { deleted_at: null }
        },
        classes: {
          include: { class: true },
          where: { deleted_at: null }
        },
        programs: {
          include: { program: true },
          where: { deleted_at: null }
        }
      }
    });

    // Convert BigInt to number for JSON serialization
    const serializedSubject = {
      ...subject,
      id: Number(subject.id),
      curriculums: subject.curriculums.map(sc => ({
        ...sc,
        id: Number(sc.id),
        subject_id: Number(sc.subject_id),
        curriculum_id: Number(sc.curriculum_id),
        curriculum: {
          ...sc.curriculum,
          id: Number(sc.curriculum.id)
        }
      })),
      classes: subject.classes.map(sc => ({
        ...sc,
        id: Number(sc.id),
        subject_id: Number(sc.subject_id),
        class_id: Number(sc.class_id),
        class: {
          ...sc.class,
          id: Number(sc.class.id)
        }
      })),
      programs: subject.programs.map(sp => ({
        ...sp,
        id: Number(sp.id),
        subject_id: Number(sp.subject_id),
        program: {
          ...sp.program,
          id: sp.program.id
        }
      }))
    };

    return NextResponse.json(serializedSubject);
  } catch (error) {
    console.error("Error updating subject:", error);
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
    await prisma.subject.update({
      where: { id: BigInt(id), deleted_at: null },
      data: { deleted_at: new Date() }
    });
    return NextResponse.json({ message: "Deleted" });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
