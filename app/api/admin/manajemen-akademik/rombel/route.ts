import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const createSchema = z.object({
  class_id: z.number().int(),
  program_id: z.string(),
  tahunAjaranId: z.string().min(1),
  name: z.string().min(1),
  capacity: z.number().int().optional()
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "0");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const search = searchParams.get("search") || "";
  const class_id = searchParams.get("class_id");
  const program_id = searchParams.get("program_id");
  const yearId = searchParams.get("yearId");
  const includeCapacity = searchParams.get("includeCapacity") === "true";

  const where: {
    name?: { contains: string; mode: "insensitive" };
    class_id?: bigint;
    program_id?: string;
    tahunAjaranId?: string;
    deleted_at: null;
  } = { deleted_at: null };
  if (search) where.name = { contains: search, mode: "insensitive" };
  if (class_id) where.class_id = BigInt(class_id);
  if (program_id) where.program_id = program_id;
  if (yearId) where.tahunAjaranId = yearId;

  const [data, totalCount] = await Promise.all([
    prisma.rombel.findMany({
      where,
      include: {
        class: true,
        program: { 
          select: { 
            id: true, 
            name: true,
            subjects: true
          } 
        },
        tahunAjaran: { select: { id: true, label: true } },
        students: {
          select: { id: true, fullName: true, nisn: true },
          orderBy: { fullName: "asc" }
        },
        teacherSubjects: {
          include: {
            schedules: true
          }
        },
        ...(includeCapacity && {
          _count: {
            select: { students: true }
          }
        })
      },
      skip: page * pageSize,
      take: pageSize,
      orderBy: { created_at: "desc" }
    }),
    prisma.rombel.count({ where })
  ]);

  const serializedData = data.map(item => {
    // Calculate progress
    const totalSubjects = item.program?.subjects?.length || 0;
    const generatedSubjects = item.teacherSubjects?.length || 0;
    const assignedTeachers = item.teacherSubjects?.filter((ts: { teacher_id: string | null }) => ts.teacher_id !== null).length || 0;
    const scheduledSubjects = item.teacherSubjects?.filter((ts: { schedules: unknown[] }) => ts.schedules && ts.schedules.length > 0).length || 0;
    
    const teacherProgress = generatedSubjects > 0 ? Math.round((assignedTeachers / generatedSubjects) * 100) : 0;
    const scheduleProgress = generatedSubjects > 0 ? Math.round((scheduledSubjects / generatedSubjects) * 100) : 0;
    
    return {
      id: Number(item.id),
      class_id: Number(item.class_id),
      program_id: item.program_id,
      name: item.name,
      capacity: item.capacity,
      student_count: item.students?.length || 0,
      class: {
        id: Number(item.class.id),
        name: item.class.name
      },
      program: {
        id: item.program.id,
        name: item.program.name
      },
      tahunAjaran: item.tahunAjaran,
      students: item.students.map(student => ({
        id: student.id,
        fullName: student.fullName,
        nisn: student.nisn
      })),
      progress: {
        totalSubjects,
        generatedSubjects,
        assignedTeachers,
        scheduledSubjects,
        teacherProgress,
        scheduleProgress
      },
      ...(includeCapacity && (item as { _count?: { students: number } })._count ? { _count: (item as { _count?: { students: number } })._count } : {})
    };
  });

  return NextResponse.json({ data: serializedData, totalCount });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createSchema.parse(body);
    const rombel = await prisma.rombel.create({
      data: {
        class_id: BigInt(validated.class_id),
        program_id: validated.program_id,
        tahunAjaranId: validated.tahunAjaranId,
        name: validated.name,
        capacity: validated.capacity,
        student_count: 0
      },
      include: {
        class: true,
        program: { select: { id: true, name: true } },
        tahunAjaran: { select: { id: true, label: true } },
        students: {
          select: { id: true, fullName: true, nisn: true }
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

    return NextResponse.json(serializedRombel, { status: 201 });
  } catch (error) {
    console.error("Error creating rombel:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to create rombel" }, { status: 500 });
  }
}
