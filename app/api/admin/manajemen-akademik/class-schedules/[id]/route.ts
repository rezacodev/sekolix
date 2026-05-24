import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const updateSchema = z.object({
  class_id: z.number().int().optional(),
  teacher_subject_id: z.number().int().optional(),
  day: z
    .enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"])
    .optional(),
  start_time: z.string().optional(), // Format: HH:mm
  end_time: z.string().optional(), // Format: HH:mm
  room: z.string().optional()
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const classSchedule = await prisma.classSchedule.findUnique({
      where: { id: BigInt(id), deleted_at: null },
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

    if (!classSchedule) {
      return NextResponse.json({ error: "Class schedule not found" }, { status: 404 });
    }

    // Convert BigInt to number for JSON serialization
    const serializedSchedule = {
      ...classSchedule,
      id: Number(classSchedule.id),
      class_id: Number(classSchedule.class_id),
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

    return NextResponse.json(serializedSchedule);
  } catch (error) {
    console.error("Error fetching class schedule:", error);
    return NextResponse.json({ error: "Failed to fetch class schedule" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateSchema.parse(body);

    // Validate time format and logic if times are provided
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

    // Get current schedule to check for conflicts
    const currentSchedule = await prisma.classSchedule.findUnique({
      where: { id: BigInt(id) }
    });

    if (!currentSchedule) {
      return NextResponse.json({ error: "Class schedule not found" }, { status: 404 });
    }

    // Check for scheduling conflicts if class_id, day, or times are being updated
    if (validated.class_id || validated.day || validated.start_time || validated.end_time) {
      const checkClassId = validated.class_id
        ? BigInt(validated.class_id)
        : currentSchedule.class_id;
      const checkDay = validated.day || currentSchedule.day;
      const checkStartTime = startTime || currentSchedule.start_time;
      const checkEndTime = endTime || currentSchedule.end_time;

      // Only check for conflicts if we have both start and end times
      if (checkStartTime && checkEndTime) {
        const conflict = await prisma.classSchedule.findFirst({
          where: {
            id: { not: BigInt(id) },
            class_id: checkClassId,
            day: checkDay,
            deleted_at: null,
            OR: [
              {
                AND: [{ start_time: { lte: checkStartTime } }, { end_time: { gt: checkStartTime } }]
              },
              {
                AND: [{ start_time: { lt: checkEndTime } }, { end_time: { gte: checkEndTime } }]
              },
              {
                AND: [{ start_time: { gte: checkStartTime } }, { end_time: { lte: checkEndTime } }]
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
    }

    const updateData: Prisma.ClassScheduleUpdateInput = {};
    if (validated.class_id) {
      updateData.class = { connect: { id: BigInt(validated.class_id) } };
    }
    if (validated.teacher_subject_id) {
      updateData.teacherSubject = { connect: { id: BigInt(validated.teacher_subject_id) } };
    }
    if (validated.day) updateData.day = validated.day;
    if (startTime) updateData.start_time = startTime;
    if (endTime) updateData.end_time = endTime;
    if (validated.room !== undefined) updateData.room = validated.room;

    const classSchedule = await prisma.classSchedule.update({
      where: { id: BigInt(id) },
      data: updateData,
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

    return NextResponse.json(serializedSchedule);
  } catch (error) {
    console.error("Error updating class schedule:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to update class schedule" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.classSchedule.update({
      where: { id: BigInt(id) },
      data: { deleted_at: new Date() }
    });

    return NextResponse.json({ message: "Class schedule deleted successfully" });
  } catch (error) {
    console.error("Error deleting class schedule:", error);
    return NextResponse.json({ error: "Failed to delete class schedule" }, { status: 500 });
  }
}
