import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.staffId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacherId = session.user.staffId;

    // Get all classes taught by this teacher
    const teacherSubjects = await prisma.teacherSubject.findMany({
      where: {
        teacher_id: teacherId,
        deleted_at: null,
      },
      include: {
        class: true,
        subject: true,
      },
    });


    if (teacherSubjects.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
      });
    }

    // Get all class IDs this teacher teaches
    const classIds = [...new Set(teacherSubjects.map((ts) => ts.class_id))];

    // Get all rombels for these classes with active tahun ajaran
    const rombels = await prisma.rombel.findMany({
      where: {
        class_id: { in: classIds },
        deleted_at: null,
        tahunAjaran: {
          isActive: true,
        },
      },
      include: {
        class: true,
        program: true,
        tahunAjaran: true,
        _count: {
          select: { students: true },
        },
      },
      orderBy: [
        { class: { name: "asc" } },
        { name: "asc" },
      ],
    });


    // Build response with rombels and their subjects
    const classes = await Promise.all(rombels.map(async (rombel) => {
      // Get subjects taught by this teacher for this specific rombel
      const rombelSubjects = await Promise.all(
        teacherSubjects
          .filter((ts) => 
            ts.class_id === rombel.class_id && 
            ts.rombel_id === rombel.id // Only show subjects assigned to this specific rombel
          )
          .map(async (ts) => {
            // Get schedules for this specific teacher-subject-rombel combination
            const schedules = await prisma.classSchedule.findMany({
              where: {
                teacher_subject_id: ts.id,
                rombel_id: rombel.id,
                deleted_at: null,
              },
              select: {
                id: true,
                day: true,
                start_time: true,
                end_time: true,
                room: true,
                period: true,
              },
              orderBy: [
                { day: 'asc' },
                { start_time: 'asc' },
              ],
            });

            return {
              id: Number(ts.subject_id),
              name: ts.subject.name,
              teacherSubjectId: Number(ts.id),
              schedules: schedules.map(sch => ({
                id: Number(sch.id),
                day: sch.day,
                timeStart: sch.start_time?.toISOString() || '',
                timeEnd: sch.end_time?.toISOString() || '',
                room: sch.room || null,
                period: sch.period || null,
              })),
            };
          })
      );

      return {
        id: Number(rombel.id),
        rombelId: Number(rombel.id),
        classId: Number(rombel.class_id),
        type: "rombel",
        name: rombel.name,
        className: rombel.class.name,
        rombelName: rombel.name,
        program: rombel.program?.name || null,
        tahunAjaran: rombel.tahunAjaran?.label || null,
        tahunAjaranInfo: rombel.tahunAjaran ? {
          id: rombel.tahunAjaran.id,
          label: rombel.tahunAjaran.label,
          startDate: rombel.tahunAjaran.startDate,
          endDate: rombel.tahunAjaran.endDate,
          isActive: rombel.tahunAjaran.isActive,
        } : null,
        studentCount: rombel._count.students || 0,
        capacity: rombel.capacity || null,
        subjects: rombelSubjects,
      };
    }));

    // Filter out rombels with no subjects assigned to this teacher
    const classesWithSubjects = classes.filter(c => c.subjects.length > 0);


    return NextResponse.json({
      success: true,
      data: classesWithSubjects,
      total: classesWithSubjects.length,
    });
  } catch (error) {
    console.error("[my-classes] Error fetching teacher classes:", error);
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    );
  }
}
