import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch attendance statistics
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ rombelId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const rombelId = BigInt(params.rombelId);
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");

    if (!subjectId) {
      return NextResponse.json(
        { error: "subjectId is required" },
        { status: 400 }
      );
    }

    const staffId = session.user.staffId;
    if (!staffId) {
      return NextResponse.json(
        { error: "Staff ID not found in session" },
        { status: 403 }
      );
    }

    // Verify teacher has access
    const teacherSubject = await prisma.teacherSubject.findFirst({
      where: {
        teacher_id: staffId,
        subject_id: BigInt(subjectId),
        rombel_id: rombelId,
        deleted_at: null,
      },
      include: {
        subject: true,
        rombel: {
          include: {
            students: {
              where: { deleted_at: null },
              select: {
                id: true,
                fullName: true,
                nisn: true,
              },
            },
          },
        },
      },
    });

    if (!teacherSubject) {
      return NextResponse.json(
        { error: "You don't have access to this class" },
        { status: 403 }
      );
    }

    // Get total meetings (count unique dates)
    const uniqueDates = await prisma.attendance.findMany({
      where: {
        teacher_subject_id: teacherSubject.id,
        rombel_id: rombelId,
        deleted_at: null,
      },
      select: {
        date: true,
      },
      distinct: ['date'],
    });

    const meetingCount = uniqueDates.length;

    // Get all attendance records for this subject + rombel
    const attendances = await prisma.attendance.findMany({
      where: {
        teacher_subject_id: teacherSubject.id,
        rombel_id: rombelId,
        deleted_at: null,
      },
      select: {
        student_id: true,
        status: true,
        meeting_number: true,
      },
    });

    // Calculate statistics per student
    const studentStats = teacherSubject.rombel!.students.map((student) => {
      const studentAttendances = attendances.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (att: any) => att.student_id === student.id
      );

      const hadir = studentAttendances.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (att: any) => att.status === "HADIR"
      ).length;
      const sakit = studentAttendances.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (att: any) => att.status === "SAKIT"
      ).length;
      const izin = studentAttendances.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (att: any) => att.status === "IZIN"
      ).length;
      const alpha = studentAttendances.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (att: any) => att.status === "ALPHA"
      ).length;

      const attendancePercentage =
        meetingCount > 0 ? (hadir / meetingCount) * 100 : 0;

      return {
        studentId: student.id,
        studentName: student.fullName,
        nisn: student.nisn,
        hadir,
        sakit,
        izin,
        alpha,
        totalRecorded: studentAttendances.length,
        totalMeetings: meetingCount,
        attendancePercentage: Math.round(attendancePercentage * 100) / 100,
      };
    });

    // Calculate class statistics
    const totalHadir = attendances.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (att: any) => att.status === "HADIR"
    ).length;
    const totalSakit = attendances.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (att: any) => att.status === "SAKIT"
    ).length;
    const totalIzin = attendances.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (att: any) => att.status === "IZIN"
    ).length;
    const totalAlpha = attendances.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (att: any) => att.status === "ALPHA"
    ).length;

    const totalStudents = teacherSubject.rombel!.students.length;
    const totalPossibleAttendances = totalStudents * meetingCount;
    const classAttendancePercentage =
      totalPossibleAttendances > 0
        ? (totalHadir / totalPossibleAttendances) * 100
        : 0;

    return NextResponse.json({
      subject: {
        id: Number(teacherSubject.subject.id),
        name: teacherSubject.subject.name,
      },
      rombel: {
        id: Number(teacherSubject.rombel!.id),
        name: teacherSubject.rombel!.name,
      },
      totalMeetings: meetingCount,
      totalStudents,
      classStats: {
        hadir: totalHadir,
        sakit: totalSakit,
        izin: totalIzin,
        alpha: totalAlpha,
        attendancePercentage:
          Math.round(classAttendancePercentage * 100) / 100,
      },
      studentStats: studentStats.sort(
        (a, b) => b.attendancePercentage - a.attendancePercentage
      ),
    });
  } catch (error) {
    console.error("Error fetching attendance statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance statistics" },
      { status: 500 }
    );
  }
}
