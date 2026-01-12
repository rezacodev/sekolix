import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const createSchema = z.object({
  code: z.string().optional(),
  curriculum_ids: z.array(z.number().int()).min(1, "Minimal 1 kurikulum harus dipilih"),
  class_ids: z.array(z.number().int()).optional(),
  program_ids: z.array(z.string()).optional(),
  name: z.string().min(1),
  is_practice: z.boolean().optional()
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "0");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const search = searchParams.get("search") || "";
  const curriculum_id = searchParams.get("curriculum_id");

  const where: {
    name?: { contains: string; mode: "insensitive" };
    curriculums?: { some: { curriculum_id: bigint } };
    deleted_at: null;
  } = { deleted_at: null };
  if (search) where.name = { contains: search, mode: "insensitive" };
  if (curriculum_id) where.curriculums = { some: { curriculum_id: BigInt(curriculum_id) } };

  const [data, totalCount] = await Promise.all([
    prisma.subject.findMany({
      where,
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
      },
      skip: page * pageSize,
      take: pageSize,
      orderBy: { id: "desc" }
    }),
    prisma.subject.count({ where })
  ]);

  // Convert BigInt to number for JSON serialization
  const serializedData = data.map(item => ({
    ...item,
    id: Number(item.id),
    curriculums: item.curriculums.map(sc => ({
      ...sc,
      id: Number(sc.id),
      subject_id: Number(sc.subject_id),
      curriculum_id: Number(sc.curriculum_id),
      curriculum: {
        ...sc.curriculum,
        id: Number(sc.curriculum.id)
      }
    })),
    classes: item.classes.map(sc => ({
      ...sc,
      id: Number(sc.id),
      subject_id: Number(sc.subject_id),
      class_id: Number(sc.class_id),
      class: {
        ...sc.class,
        id: Number(sc.class.id)
      }
    })),
    programs: item.programs.map(sp => ({
      ...sp,
      id: Number(sp.id),
      subject_id: Number(sp.subject_id),
      program: {
        ...sp.program,
        id: sp.program.id
      }
    }))
  }));

  return NextResponse.json({ data: serializedData, totalCount });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createSchema.parse(body);

    // Create subject with relations
    const subject = await prisma.subject.create({
      data: {
        code: validated.code,
        name: validated.name,
        is_practice: validated.is_practice || false,
        curriculums: {
          create: validated.curriculum_ids.map(curriculum_id => ({
            curriculum_id: BigInt(curriculum_id)
          }))
        },
        classes: validated.class_ids ? {
          create: validated.class_ids.map(class_id => ({
            class_id: BigInt(class_id)
          }))
        } : undefined,
        programs: validated.program_ids ? {
          create: validated.program_ids.map(program_id => ({
            program_id: program_id
          }))
        } : undefined
      },
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

    return NextResponse.json(serializedSubject, { status: 201 });
  } catch (error) {
    console.error("Error creating subject:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to create subject" }, { status: 500 });
  }
}
