import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema
const attendanceRecordSchema = z.object({
  studentId: z.string(),
  status: z.enum(["HADIR", "SAKIT", "IZIN", "ALPHA"]),
  notes: z.string().optional(),
});

const createAttendanceSchema = z.object({
  date: z.string(), // ISO date string
  meetingNumber: z.number().int().positive(),
  subjectId: z.string().transform((val) => BigInt(val)),
  records: z.array(attendanceRecordSchema),
});

// GET - Fetch attendance records
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
    const date = searchParams.get("date");
    const meetingNumber = searchParams.get("meetingNumber");

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

    // Verify teacher has access to this subject + rombel
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
            class: true,
            program: true,
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

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      teacher_subject_id: teacherSubject.id,
      rombel_id: rombelId,
      deleted_at: null,
    };

    if (date) {
      where.date = new Date(date);
    }

    if (meetingNumber) {
      where.meeting_number = parseInt(meetingNumber);
    }

    // Fetch attendance records
    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            nisn: true,
            gender: true,
          },
        },
      },
      orderBy: [{ date: "desc" }, { meeting_number: "desc" }],
    });

    // Get all students in this rombel for reference
    const students = await prisma.pesertaDidik.findMany({
      where: {
        rombels: {
          some: {
            id: rombelId,
          },
        },
        deleted_at: null,
      },
      select: {
        id: true,
        fullName: true,
        nisn: true,
        gender: true,
      },
      orderBy: {
        fullName: "asc",
      },
    });

    // Get meeting count (count unique dates for this subject)
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

    return NextResponse.json({
      subject: {
        id: Number(teacherSubject.subject.id),
        name: teacherSubject.subject.name,
      },
      rombel: {
        id: Number(teacherSubject.rombel!.id),
        name: teacherSubject.rombel!.name,
        className: teacherSubject.rombel!.class.name,
        program: teacherSubject.rombel!.program.name,
      },
      students,
      attendances: attendances.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (att: any) => ({
          id: Number(att.id),
          studentId: att.student_id,
          studentName: att.student.fullName,
          date: att.date.toISOString().split("T")[0],
          meetingNumber: att.meeting_number,
          status: att.status,
          notes: att.notes,
        })
      ),
      totalMeetings: uniqueDates.length,
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance records" },
      { status: 500 }
    );
  }
}

// POST - Create attendance records for a meeting
export async function POST(
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
    const body = await request.json();
    
    // Validate request
    const validatedData = createAttendanceSchema.parse(body);
    const { date, meetingNumber, subjectId, records } = validatedData;

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
        subject_id: subjectId,
        rombel_id: rombelId,
        deleted_at: null,
      },
    });

    if (!teacherSubject) {
      return NextResponse.json(
        { error: "You don't have access to this class" },
        { status: 403 }
      );
    }

    // Create or update attendance records
    const attendanceDate = new Date(date);
    const results = await Promise.all(
      records.map(async (record) => {
        return await prisma.attendance.upsert({
          where: {
            student_id_teacher_subject_id_date_meeting_number: {
              student_id: record.studentId,
              teacher_subject_id: teacherSubject.id,
              date: attendanceDate,
              meeting_number: meetingNumber,
            },
          },
          update: {
            status: record.status,
            notes: record.notes,
            recorded_by: staffId,
          },
          create: {
            student_id: record.studentId,
            teacher_subject_id: teacherSubject.id,
            rombel_id: rombelId,
            date: attendanceDate,
            meeting_number: meetingNumber,
            status: record.status,
            notes: record.notes,
            recorded_by: staffId,
          },
        });
      })
    );

    return NextResponse.json({
      message: "Attendance records saved successfully",
      count: results.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error saving attendance:", error);
    return NextResponse.json(
      { error: "Failed to save attendance records" },
      { status: 500 }
    );
  }
}
