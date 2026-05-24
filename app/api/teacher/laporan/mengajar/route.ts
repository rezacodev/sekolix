import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getStaffId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.staffId) return null;
  return session.user.staffId;
}

// GET /api/teacher/laporan/mengajar
// Query params: rombelId?, subjectId?, month? (YYYY-MM), semester? (1|2), year? (YYYY)
export async function GET(request: Request) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const rombelId = searchParams.get("rombelId");
    const subjectId = searchParams.get("subjectId");
    const month = searchParams.get("month"); // "2025-08"
    const yearStr = searchParams.get("year");

    // Get teacher's TeacherSubject assignments
    const teacherSubjects = await prisma.teacherSubject.findMany({
      where: {
        teacher_id: staffId,
        deleted_at: null,
        ...(rombelId ? { rombel_id: BigInt(rombelId) } : {}),
        ...(subjectId ? { subject_id: BigInt(subjectId) } : {}),
      },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        rombel: {
          select: {
            id: true,
            name: true,
            class: { select: { name: true } },
            students: { where: { deleted_at: null }, select: { id: true } },
          },
        },
      },
    });

    const tsIds = teacherSubjects.map((ts) => ts.id);
    const rombelIds = teacherSubjects
      .filter((ts) => ts.rombel_id !== null)
      .map((ts) => ts.rombel_id!);

    // Date range filter
    let dateFrom: Date | undefined;
    let dateTo: Date | undefined;
    if (month) {
      const [y, m] = month.split("-").map(Number);
      dateFrom = new Date(y, m - 1, 1);
      dateTo = new Date(y, m, 0, 23, 59, 59);
    } else if (yearStr) {
      const y = parseInt(yearStr);
      dateFrom = new Date(y, 0, 1);
      dateTo = new Date(y, 11, 31, 23, 59, 59);
    }

    const dateFilter = dateFrom && dateTo ? { date: { gte: dateFrom, lte: dateTo } } : {};

    // Fetch journals
    const journals = await prisma.teachingJournal.findMany({
      where: {
        recorded_by: staffId,
        deleted_at: null,
        teacher_subject_id: { in: tsIds },
        ...(rombelId ? { rombel_id: BigInt(rombelId) } : { rombel_id: { in: rombelIds } }),
        ...dateFilter,
      },
      orderBy: { date: "desc" },
      include: {
        teacherSubject: {
          include: { subject: { select: { id: true, name: true } } },
        },
        rombel: { select: { id: true, name: true, class: { select: { name: true } } } },
      },
    });

    // Fetch attendance records (grouped)
    const attendances = await prisma.attendance.findMany({
      where: {
        teacher_subject_id: { in: tsIds },
        deleted_at: null,
        ...(rombelId ? { rombel_id: BigInt(rombelId) } : { rombel_id: { in: rombelIds } }),
        ...dateFilter,
      },
      select: {
        id: true,
        student_id: true,
        teacher_subject_id: true,
        rombel_id: true,
        date: true,
        meeting_number: true,
        status: true,
      },
    });

    // Group attendance by meeting (teacher_subject_id + date + meeting_number)
    const meetingMap = new Map<string, { hadir: number; sakit: number; izin: number; alpha: number; total: number }>();
    for (const att of attendances) {
      const key = `${att.teacher_subject_id}-${att.date.toISOString().slice(0, 10)}-${att.meeting_number}`;
      const prev = meetingMap.get(key) ?? { hadir: 0, sakit: 0, izin: 0, alpha: 0, total: 0 };
      prev.total++;
      if (att.status === "HADIR") prev.hadir++;
      else if (att.status === "SAKIT") prev.sakit++;
      else if (att.status === "IZIN") prev.izin++;
      else if (att.status === "ALPHA") prev.alpha++;
      meetingMap.set(key, prev);
    }

    // Aggregate per rombel + subject
    const byRombel = new Map<string, {
      rombelId: string;
      rombelName: string;
      className: string;
      subjectId: string;
      subjectName: string;
      totalMeetings: number;
      avgHadir: number;
      topics: string[];
      journalIds: string[];
    }>();

    for (const j of journals) {
      const key = `${j.rombel_id}-${j.teacherSubject.subject_id}`;
      const prev = byRombel.get(key) ?? {
        rombelId: String(j.rombel_id),
        rombelName: j.rombel.name,
        className: j.rombel.class.name,
        subjectId: String(j.teacherSubject.subject_id),
        subjectName: j.teacherSubject.subject.name,
        totalMeetings: 0,
        avgHadir: 0,
        topics: [],
        journalIds: [],
      };
      prev.totalMeetings++;
      prev.topics.push(j.topic);
      prev.journalIds.push(String(j.id));
      byRombel.set(key, prev);
    }

    // Calculate avgHadir per group
    for (const [key, group] of byRombel) {
      const parts = key.split("-");
      const rid = parts[0];
      const sid = parts[1];
      // Filter attendances for this rombel+subject
      const relAttendances = attendances.filter(
        (a) => String(a.rombel_id) === rid && String(a.teacher_subject_id)
      );
      const hadir = relAttendances.filter((a) => a.status === "HADIR").length;
      const total = relAttendances.length;
      group.avgHadir = total > 0 ? Math.round((hadir / total) * 100) : 0;
      void sid;
    }

    // Weekly breakdown (for chart data)
    const weeklyData = new Map<string, number>(); // "2025-W32" -> count
    for (const j of journals) {
      const d = new Date(j.date);
      const year = d.getFullYear();
      const week = Math.ceil(
        ((d.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + new Date(year, 0, 1).getDay() + 1) / 7
      );
      const wk = `${year}-W${String(week).padStart(2, "0")}`;
      weeklyData.set(wk, (weeklyData.get(wk) ?? 0) + 1);
    }

    // Get available rombels and subjects for filter dropdowns
    const filterRombels = teacherSubjects
      .filter((ts) => ts.rombel_id !== null)
      .map((ts) => ({
        id: String(ts.rombel_id),
        name: ts.rombel?.name ?? "",
        className: ts.rombel?.class?.name ?? "",
      }))
      .filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i);

    const filterSubjects = teacherSubjects
      .map((ts) => ({
        id: String(ts.subject_id),
        name: ts.subject.name,
      }))
      .filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i);

    return NextResponse.json({
      summary: {
        totalJournals: journals.length,
        totalMeetings: journals.length,
        totalAttendanceRecords: attendances.length,
        avgHadirRate:
          attendances.length > 0
            ? Math.round(
                (attendances.filter((a) => a.status === "HADIR").length / attendances.length) * 100
              )
            : 0,
      },
      byClass: Array.from(byRombel.values()).map((g) => ({
        ...g,
        topics: g.topics.slice(0, 5), // last 5 topics
      })),
      weeklyChart: Array.from(weeklyData.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([week, count]) => ({ week, count })),
      journals: journals.slice(0, 50).map((j) => ({
        id: String(j.id),
        date: j.date.toISOString().slice(0, 10),
        rombelName: j.rombel.name,
        className: j.rombel.class.name,
        subjectName: j.teacherSubject.subject.name,
        topic: j.topic,
        teachingMethod: j.teaching_method ?? null,
        period: j.period,
        timeStart: j.time_start ?? null,
        timeEnd: j.time_end ?? null,
        notes: j.notes ?? null,
      })),
      filters: { rombels: filterRombels, subjects: filterSubjects },
    });
  } catch (error) {
    console.error("Error fetching laporan mengajar:", error);
    return NextResponse.json({ error: "Failed to fetch laporan mengajar" }, { status: 500 });
  }
}
