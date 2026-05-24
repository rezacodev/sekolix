import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Helper function to translate day names to Indonesian
const getDayLabel = (day: string): string => {
  const dayMap: Record<string, string> = {
    'MONDAY': 'Senin',
    'TUESDAY': 'Selasa',
    'WEDNESDAY': 'Rabu',
    'THURSDAY': 'Kamis',
    'FRIDAY': 'Jumat',
    'SATURDAY': 'Sabtu',
    'SUNDAY': 'Minggu'
  };
  return dayMap[day] || day;
};

// GET - Fetch subjects with current mappings
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const rombelId = parseInt(id);

    // Get rombel with class info
    const rombel = await prisma.rombel.findUnique({
      where: { id: rombelId },
      include: {
        class: true
      }
    });

    if (!rombel) {
      return NextResponse.json({ error: "Rombel not found" }, { status: 404 });
    }

    // Get existing teacher-subject mappings for this rombel
    const existingMappings = await prisma.teacherSubject.findMany({
      where: {
        class_id: rombel.class_id,
        rombel_id: rombelId
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true
          }
        },
        subject: true
      }
    });

    // Get existing schedules for this rombel
    const existingSchedules = await prisma.classSchedule.findMany({
      where: {
        class_id: rombel.class_id,
        rombel_id: rombelId
      },
      include: {
        teacherSubject: {
          include: {
            subject: true
          }
        }
      }
    });

    // Build the subjects mapping from existing teacher-subject assignments
    const subjectsMapping = existingMappings.map(mapping => {
      const schedule = existingSchedules.find(s => s.teacher_subject_id === mapping.id);

      return {
        subjectId: Number(mapping.subject.id),
        subjectCode: mapping.subject.code,
        subjectName: mapping.subject.name,
        teacherId: mapping.teacher_id || null,
        teacherName: mapping.teacher?.name || null,
        day: schedule?.day || null,
        period: schedule?.period || null,
        room: schedule?.room || null
      };
    });

    return NextResponse.json(subjectsMapping);
  } catch (error) {
    console.error("Error fetching subjects mapping:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Save subjects mapping (teachers and schedules)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const rombelId = parseInt(id);
    const { subjects } = await request.json();


    // Get rombel with class info
    const rombel = await prisma.rombel.findUnique({
      where: { id: rombelId },
      include: { class: true }
    });

    if (!rombel) {
      return NextResponse.json({ error: "Rombel not found" }, { status: 404 });
    }

    // Validate for scheduling conflicts (same day + period + room)
    const scheduleMap = new Map<string, string>();
    const teacherScheduleMap = new Map<string, string>();
    
    for (const subject of subjects) {
      if (subject.day && subject.period && subject.room) {
        // Check room conflict within this rombel
        const scheduleKey = `${subject.day}-${subject.period}-${subject.room}`;
        if (scheduleMap.has(scheduleKey)) {
          const dayLabel = getDayLabel(subject.day);
          return NextResponse.json({ 
            error: `Konflik jadwal: ${subject.subjectName} bentrok dengan ${scheduleMap.get(scheduleKey)} pada ${dayLabel} jam ke-${subject.period} di ${subject.room}` 
          }, { status: 400 });
        }
        scheduleMap.set(scheduleKey, subject.subjectName);
      }
      
      // Check teacher conflict within this rombel
      if (subject.teacherId && subject.day && subject.period) {
        const teacherKey = `${subject.teacherId}-${subject.day}-${subject.period}`;
        if (teacherScheduleMap.has(teacherKey)) {
          const dayLabel = getDayLabel(subject.day);
          return NextResponse.json({ 
            error: `Konflik jadwal guru: ${subject.teacherName || 'Guru'} sudah mengajar ${teacherScheduleMap.get(teacherKey)} pada ${dayLabel} jam ke-${subject.period}` 
          }, { status: 400 });
        }
        teacherScheduleMap.set(teacherKey, subject.subjectName);
      }
    }

    // Check against existing schedules in other rombels
    for (const subject of subjects) {
      if (subject.day && subject.period && subject.room) {
        // Check room availability
        const existingSchedule = await prisma.classSchedule.findFirst({
          where: {
            class_id: rombel.class_id,
            rombel_id: { not: BigInt(rombelId) }, // Exclude current rombel
            day: subject.day,
            period: subject.period,
            room: subject.room,
            deleted_at: null
          },
          include: {
            rombel: true,
            teacherSubject: {
              include: {
                subject: true
              }
            }
          }
        });

        if (existingSchedule) {
          const dayLabel = getDayLabel(subject.day);
          return NextResponse.json({ 
            error: `Ruangan ${subject.room} sudah digunakan oleh ${existingSchedule.rombel?.name} untuk ${existingSchedule.teacherSubject.subject.name} pada ${dayLabel} jam ke-${subject.period}` 
          }, { status: 400 });
        }
      }
      
      // Check teacher availability across all rombels
      if (subject.teacherId && subject.day && subject.period) {
        const teacherConflict = await prisma.classSchedule.findFirst({
          where: {
            rombel_id: { not: BigInt(rombelId) }, // Exclude current rombel
            day: subject.day,
            period: subject.period,
            deleted_at: null,
            teacherSubject: {
              teacher_id: subject.teacherId
            }
          },
          include: {
            rombel: true,
            teacherSubject: {
              include: {
                teacher: true,
                subject: true
              }
            }
          }
        });

        if (teacherConflict) {
          const dayLabel = getDayLabel(subject.day);
          return NextResponse.json({ 
            error: `Guru ${teacherConflict.teacherSubject.teacher?.name} sudah mengajar di ${teacherConflict.rombel?.name} (${teacherConflict.teacherSubject.subject.name}) pada ${dayLabel} jam ke-${subject.period}` 
          }, { status: 400 });
        }
      }
    }

    // Process each subject
    for (const subject of subjects) {
      // Find existing TeacherSubject record for this subject and rombel
      const existing = await prisma.teacherSubject.findFirst({
        where: {
          subject_id: BigInt(subject.subjectId),
          class_id: rombel.class_id,
          rombel_id: BigInt(rombelId)
        }
      });

      if (!subject.teacherId) {
        // If no teacher assigned, update existing to set teacher_id = null
        if (existing && existing.teacher_id !== null) {
          await prisma.teacherSubject.update({
            where: { id: existing.id },
            data: { teacher_id: null }
          });
          
          // Delete schedules when teacher is removed
          await prisma.classSchedule.deleteMany({
            where: { teacher_subject_id: existing.id }
          });
        }
        continue;
      }

      // Upsert teacher-subject mapping
      const teacherSubject = existing
        ? await prisma.teacherSubject.update({
            where: { id: existing.id },
            data: { teacher_id: subject.teacherId }
          })
        : await prisma.teacherSubject.create({
            data: {
              teacher_id: subject.teacherId,
              subject_id: BigInt(subject.subjectId),
              class_id: rombel.class_id,
              rombel_id: BigInt(rombelId)
            }
          });

      // Handle schedule
      if (subject.day && subject.period) {
        // Delete existing schedule for this teacher_subject first
        await prisma.classSchedule.deleteMany({
          where: { teacher_subject_id: teacherSubject.id }
        });
        
        // Create new schedule
        await prisma.classSchedule.create({
          data: {
            teacher_subject_id: teacherSubject.id,
            class_id: rombel.class_id,
            rombel_id: BigInt(rombelId),
            day: subject.day,
            period: subject.period,
            room: subject.room || null
          }
        });
      } else {
        // Delete existing schedule if day/period removed
        await prisma.classSchedule.deleteMany({
          where: { teacher_subject_id: teacherSubject.id }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving subjects mapping:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
