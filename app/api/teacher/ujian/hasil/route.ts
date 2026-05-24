import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getStaffId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { staff: true },
  });
  return user?.staff?.[0]?.id ?? null;
}

// GET /api/teacher/ujian/hasil — list jadwal yang sudah CLOSED + statistik
export async function GET(request: Request) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";
    const page = parseInt(searchParams.get("page") ?? "0");
    const pageSize = parseInt(searchParams.get("pageSize") ?? "20");

    const where = {
      teacher_id: staffId,
      deleted_at: null,
      status: { in: ["CLOSED", "OPEN", "PAUSED"] },
      ...(search ? { title: { contains: search, mode: "insensitive" as const } } : {}),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any;

    const [schedules, totalCount] = await Promise.all([
      db.examSchedule.findMany({
        where,
        skip: page * pageSize,
        take: pageSize,
        orderBy: { end_at: "desc" },
        include: {
          package: {
            select: {
              id: true,
              title: true,
              exam_type: true,
              duration: true,
              passing_grade: true,
              questions: { select: { id: true } },
            },
          },
          rombel: {
            select: {
              id: true,
              name: true,
              class: { select: { name: true } },
              students: { where: { deleted_at: null }, select: { id: true } },
            },
          },
          attempts: {
            where: { deleted_at: null },
            select: {
              id: true,
              status: true,
              score: true,
              submitted_at: true,
            },
          },
        },
      }),
      db.examSchedule.count({ where }),
    ]);

    return NextResponse.json({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: schedules.map((s: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const submitted = s.attempts.filter((a: any) => a.status !== "IN_PROGRESS");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const scored = submitted.filter((a: any) => a.score !== null);
        const passed = scored.filter(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (a: any) => Number(a.score) >= s.package.passing_grade
        );
        const avgScore =
          scored.length > 0
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? scored.reduce((sum: number, a: any) => sum + Number(a.score), 0) / scored.length
            : null;

        return {
          id: String(s.id),
          title: s.title,
          token: s.token,
          start_at: s.start_at.toISOString(),
          end_at: s.end_at.toISOString(),
          status: s.status,
          package: {
            id: String(s.package.id),
            title: s.package.title,
            exam_type: s.package.exam_type,
            duration: s.package.duration,
            passing_grade: s.package.passing_grade,
            question_count: s.package.questions.length,
          },
          rombel: {
            id: String(s.rombel.id),
            name: s.rombel.name,
            className: s.rombel.class.name,
            student_count: s.rombel.students.length,
          },
          stats: {
            total_students: s.rombel.students.length,
            submitted_count: submitted.length,
            scored_count: scored.length,
            passed_count: passed.length,
            avg_score: avgScore ? Math.round(avgScore * 10) / 10 : null,
            has_pending_essay: submitted.length > scored.length,
          },
        };
      }),
      totalCount,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("Error fetching hasil ujian:", error);
    return NextResponse.json({ error: "Failed to fetch hasil ujian" }, { status: 500 });
  }
}
