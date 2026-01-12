import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const createSchema = z.object({
  teacher_id: z.string(),
  subject_id: z.number().int(),
  class_id: z.number().int(),
  rombel_id: z.number().int().optional()
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "0");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const teacher_id = searchParams.get("teacher_id");
  const subject_id = searchParams.get("subject_id");
  const class_id = searchParams.get("class_id");
  const rombel_id = searchParams.get("rombel_id");

  const where: {
    teacher_id?: string;
    subject_id?: bigint;
    class_id?: bigint;
    rombel_id?: bigint;
    deleted_at: null;
  } = { deleted_at: null };
  if (teacher_id) where.teacher_id = teacher_id;
  if (subject_id) where.subject_id = BigInt(subject_id);
  if (class_id) where.class_id = BigInt(class_id);
  if (rombel_id) where.rombel_id = BigInt(rombel_id);

  const [data, totalCount] = await Promise.all([
    prisma.teacherSubject.findMany({
      where,
      include: {
        teacher: { select: { id: true, name: true, nip: true } },
        subject: {
          select: { id: true, name: true, code: true }
        },
        class: {
          select: { id: true, name: true }
        }
      },
      skip: page * pageSize,
      take: pageSize,
      orderBy: { created_at: "desc" }
    }),
    prisma.teacherSubject.count({ where })
  ]);

  // Convert BigInt to number for JSON serialization
  const serializedData = data.map(item => ({
    ...item,
    id: Number(item.id),
    subject_id: Number(item.subject_id),
    class_id: Number(item.class_id),
    subject: {
      ...item.subject,
      id: Number(item.subject.id)
    },
    class: {
      ...item.class,
      id: Number(item.class.id)
    }
  }));

  return NextResponse.json({ data: serializedData, totalCount });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createSchema.parse(body);

    // Check if assignment already exists
    const existing = await prisma.teacherSubject.findUnique({
      where: {
        teacher_id_subject_id_class_id: {
          teacher_id: validated.teacher_id,
          subject_id: BigInt(validated.subject_id),
          class_id: BigInt(validated.class_id)
        }
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: "Teacher-subject-class assignment already exists" },
        { status: 400 }
      );
    }

    const teacherSubject = await prisma.teacherSubject.create({
      data: {
        teacher_id: validated.teacher_id,
        subject_id: BigInt(validated.subject_id),
        class_id: BigInt(validated.class_id)
      },
      include: {
        teacher: { select: { id: true, name: true, nip: true } },
        subject: {
          select: { id: true, name: true, code: true }
        },
        class: {
          select: { id: true, name: true }
        }
      }
    });

    // Convert BigInt to number for JSON serialization
    const serializedTeacherSubject = {
      ...teacherSubject,
      id: Number(teacherSubject.id),
      subject_id: Number(teacherSubject.subject_id),
      class_id: Number(teacherSubject.class_id),
      subject: {
        ...teacherSubject.subject,
        id: Number(teacherSubject.subject.id)
      },
      class: {
        ...teacherSubject.class,
        id: Number(teacherSubject.class.id)
      }
    };

    return NextResponse.json(serializedTeacherSubject, { status: 201 });
  } catch (error) {
    console.error("Error creating teacher subject:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create teacher subject assignment" },
      { status: 500 }
    );
  }
}
