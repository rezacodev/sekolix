import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const createSchema = z.object({
  class_id: z.number().int(),
  rombel_id: z.number().int().optional(),
  teacher_subject_id: z.number().int(),
  day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
  period: z.number().int().optional(),
  start_time: z.string().optional(), // Format: HH:mm
  end_time: z.string().optional(), // Format: HH:mm
  room: z.string().optional()
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "0");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const class_id = searchParams.get("class_id");
  const rombel_id = searchParams.get("rombel_id");
  const teacher_id = searchParams.get("teacher_id");
  const day = searchParams.get("day");

  const where: {
    class_id?: bigint;
    rombel_id?: bigint;
    teacher_id?: string;
    day?: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
    deleted_at: null;
  } = { deleted_at: null };
  if (class_id) where.class_id = BigInt(class_id);
  if (rombel_id) where.rombel_id = BigInt(rombel_id);
  if (teacher_id) where.teacher_id = teacher_id;
  if (
    day &&
    ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].includes(day)
  ) {
    where.day = day as
      | "MONDAY"
      | "TUESDAY"
      | "WEDNESDAY"
      | "THURSDAY"
      | "FRIDAY"
      | "SATURDAY"
      | "SUNDAY";
  }

  const [data, totalCount] = await Promise.all([
    prisma.classSchedule.findMany({
      where,
      include: {
        class: {
          select: { id: true, name: true }
        },
        teacherSubject: {
          include: {
            subject: {
              select: { id: true, name: true, code: true, is_practice: true }
            },
            teacher: { select: { id: true, name: true, nip: true, email: true } }
          }
        }
      },
      orderBy: [{ day: "asc" }, { start_time: "asc" }],
      skip: page * pageSize,
      take: pageSize
    }),
    prisma.classSchedule.count({ where })
  ]);

  // Convert BigInt to number for JSON serialization
  const serializedData = data.map(item => ({
    ...item,
    id: Number(item.id),
    class_id: Number(item.class_id),
    teacher_subject_id: Number(item.teacher_subject_id),
    start_time: item.start_time?.toISOString().substring(11, 16), // HH:mm format
    end_time: item.end_time?.toISOString().substring(11, 16), // HH:mm format
    class: {
      ...item.class,
      id: Number(item.class.id)
    },
    teacherSubject: {
      ...item.teacherSubject,
      id: Number(item.teacherSubject.id),
      subject_id: Number(item.teacherSubject.subject_id),
      subject: {
        ...item.teacherSubject.subject,
        id: Number(item.teacherSubject.subject.id)
      },
      teacher: item.teacherSubject.teacher ? {
        ...item.teacherSubject.teacher,
        id: item.teacherSubject.teacher.id
      } : null
    }
  }));

  return NextResponse.json({ data: serializedData, totalCount });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createSchema.parse(body);

    // Validate time format and logic if both times are provided
    let startTime: Date | undefined;
    let endTime: Date | undefined;
    
    if (validated.start_time) {
      startTime = new Date(`1970-01-01T${validated.start_time}:00`);
    }
    if (validated.end_time) {
      endTime = new Date(`1970-01-01T${validated.end_time}:00`);
    }

    if (startTime && endTime && startTime >= endTime) {
      return NextResponse.json({ error: "Start time must be before end time" }, { status: 400 });
    }

    // Check for scheduling conflicts only if times are provided
    if (startTime && endTime) {
      const conflict = await prisma.classSchedule.findFirst({
        where: {
          class_id: BigInt(validated.class_id),
          day: validated.day,
          deleted_at: null,
          OR: [
            {
              AND: [{ start_time: { lte: startTime } }, { end_time: { gt: startTime } }]
            },
            {
              AND: [{ start_time: { lt: endTime } }, { end_time: { gte: endTime } }]
            },
            {
              AND: [{ start_time: { gte: startTime } }, { end_time: { lte: endTime } }]
            }
          ]
        }
      });

      if (conflict) {
        return NextResponse.json(
          { error: "Schedule conflict detected for this class and time slot" },
          { status: 400 }
        );
      }
    }

    const classSchedule = await prisma.classSchedule.create({
      data: {
        class_id: BigInt(validated.class_id),
        rombel_id: validated.rombel_id ? BigInt(validated.rombel_id) : null,
        teacher_subject_id: BigInt(validated.teacher_subject_id),
        day: validated.day,
        period: validated.period,
        start_time: startTime,
        end_time: endTime,
        room: validated.room
      },
      include: {
        class: {
          select: { id: true, name: true }
        },
        teacherSubject: {
          include: {
            subject: {
              select: { id: true, name: true, code: true, is_practice: true }
            },
            teacher: { select: { id: true, name: true, nip: true, email: true } }
          }
        }
      }
    });

    // Convert BigInt to number for JSON serialization
    const serializedSchedule = {
      ...classSchedule,
      id: Number(classSchedule.id),
      class_id: Number(classSchedule.class_id),
      rombel_id: classSchedule.rombel_id ? Number(classSchedule.rombel_id) : null,
      teacher_subject_id: Number(classSchedule.teacher_subject_id),
      start_time: classSchedule.start_time?.toISOString().substring(11, 16),
      end_time: classSchedule.end_time?.toISOString().substring(11, 16),
      class: {
        ...classSchedule.class,
        id: Number(classSchedule.class.id)
      },
      teacherSubject: {
        ...classSchedule.teacherSubject,
        id: Number(classSchedule.teacherSubject.id),
        subject_id: Number(classSchedule.teacherSubject.subject_id),
        subject: {
          ...classSchedule.teacherSubject.subject,
          id: Number(classSchedule.teacherSubject.subject.id)
        },
        teacher: classSchedule.teacherSubject.teacher ? {
          ...classSchedule.teacherSubject.teacher,
          id: classSchedule.teacherSubject.teacher.id
        } : null
      }
    };

    return NextResponse.json(serializedSchedule, { status: 201 });
  } catch (error) {
    console.error("Error creating class schedule:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to create class schedule" }, { status: 500 });
  }
}
