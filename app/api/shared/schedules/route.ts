import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const day = searchParams.get("day"); // MONDAY, TUESDAY, etc.
    const classId = searchParams.get("classId");
    const rombelId = searchParams.get("rombelId");

    // Check user role
    const isAdmin = session.user.role === "ADMIN";
    const isTeacher = session.user.staffRole === "TEACHER";
    const teacherId = session.user.staffId;

    const whereClause: Record<string, unknown> = {
      deleted_at: null,
    };

    // Role-based filtering
    if (!isAdmin && isTeacher && teacherId) {
      // Teacher only sees their schedules
      whereClause.teacherSubject = {
        teacher_id: teacherId,
        deleted_at: null,
      };
    }

    // Additional filters
    if (day) {
      whereClause.day = day.toUpperCase();
    }

    if (classId) {
      whereClause.class_id = BigInt(classId);
    }

    if (rombelId) {
      whereClause.rombel_id = BigInt(rombelId);
    }

    const schedules = await prisma.classSchedule.findMany({
      where: whereClause,
      include: {
        class: true,
        rombel: true,
        teacherSubject: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
              },
            },
            subject: true,
          },
        },
      },
      orderBy: [
        { day: "asc" },
        { period: "asc" },
      ],
    });

    const formattedSchedules = schedules.map((schedule) => ({
      id: schedule.id.toString(),
      day: schedule.day,
      period: schedule.period,
      startTime: schedule.start_time,
      endTime: schedule.end_time,
      room: schedule.room,
      class: {
        id: schedule.class.id.toString(),
        name: schedule.class.name,
      },
      rombel: schedule.rombel
        ? {
            id: schedule.rombel.id.toString(),
            name: schedule.rombel.name,
          }
        : null,
      subject: {
        id: schedule.teacherSubject.subject.id.toString(),
        name: schedule.teacherSubject.subject.name,
      },
      teacher: {
        id: schedule.teacherSubject.teacher?.id,
        name: schedule.teacherSubject.teacher?.name,
      },
    }));

    // Group by day if no day filter specified
    const groupedByDay = day
      ? { [day]: formattedSchedules }
      : formattedSchedules.reduce(
          (acc: Record<string, typeof formattedSchedules>, schedule) => {
          const dayKey = schedule.day;
          if (!acc[dayKey]) {
            acc[dayKey] = [];
          }
          acc[dayKey].push(schedule);
          return acc;
        }, {});

    return NextResponse.json({
      success: true,
      data: day ? formattedSchedules : groupedByDay,
      total: formattedSchedules.length,
      role: isAdmin ? "admin" : "teacher",
    });
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedules" },
      { status: 500 }
    );
  }
}
