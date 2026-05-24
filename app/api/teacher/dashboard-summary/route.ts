import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.staffRole !== "TEACHER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const teacherId = session.user.staffId!;

    // Get teacher data
    const teacher = await prisma.staff.findUnique({
      where: { id: teacherId },
      include: {
        teacherSubjects: {
          include: {
            class: true,
            subject: true,
            rombel: {
              include: {
                students: true,
              },
            },
          },
        },
      },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Calculate total classes
    const uniqueClasses = new Set(teacher.teacherSubjects.map(ts => ts.class_id));
    const totalClasses = uniqueClasses.size;

    // Calculate total students (from rombels)
    const totalStudents = teacher.teacherSubjects.reduce((sum, ts) => {
      if (ts.rombel) {
        return sum + ts.rombel.students.length;
      }
      return sum;
    }, 0);

    // Get today's schedule - mock data for now since ClassSchedule needs room field
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase() as "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
    
    const todaySchedules = await prisma.classSchedule.findMany({
      where: {
        teacherSubject: {
          teacher_id: teacherId,
        },
        day: dayOfWeek,
      },
      include: {
        teacherSubject: {
          include: {
            subject: true,
            class: true,
            rombel: true,
          },
        },
      },
      orderBy: {
        period: "asc",
      },
    });

    // Format schedules with status
    const currentTime = new Date().toTimeString().slice(0, 5); // "HH:MM"
    const schedules = todaySchedules.map((schedule) => {
      let status: "upcoming" | "ongoing" | "completed" = "upcoming";
      
      if (schedule.start_time && schedule.end_time) {
        const startTime = schedule.start_time.toTimeString().slice(0, 5);
        const endTime = schedule.end_time.toTimeString().slice(0, 5);
        
        if (currentTime >= endTime) {
          status = "completed";
        } else if (currentTime >= startTime && currentTime < endTime) {
          status = "ongoing";
        }
      }

      return {
        id: schedule.id.toString(),
        subject: schedule.teacherSubject.subject.name,
        class: schedule.teacherSubject.rombel?.name || schedule.teacherSubject.class.name,
        time: schedule.start_time && schedule.end_time 
          ? `${schedule.start_time.toTimeString().slice(0, 5)} - ${schedule.end_time.toTimeString().slice(0, 5)}`
          : `Jam ke-${schedule.period || "-"}`,
        room: schedule.room || "-",
        status,
      };
    });

    // Mock data for features not yet in schema
    const pendingGrading = 0; // TODO: implement when Assignment/AssignmentSubmission exists
    const pendingAttendance = schedules.filter(s => s.status === "completed").length; // Estimate based on completed classes
    const totalMaterials = 0; // TODO: implement when Material model exists

    const pendingTasks = [];

    if (pendingGrading > 0) {
      pendingTasks.push({
        id: "task-1",
        type: "koreksi" as const,
        title: "Koreksi Tugas Siswa",
        class: "Berbagai Kelas",
        count: pendingGrading,
      });
    }

    if (pendingAttendance > 0) {
      pendingTasks.push({
        id: "task-2",
        type: "absensi" as const,
        title: "Isi Absensi Hari Ini",
        class: `${pendingAttendance} Kelas`,
        count: pendingAttendance,
      });
    }

    // Calculate average grade - mock for now
    const averageGrade = 0;

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalClasses,
          totalStudents,
          totalMaterials,
          pendingGrading,
        },
        schedules,
        pendingTasks,
        averageGrade,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard summary" },
      { status: 500 }
    );
  }
}
