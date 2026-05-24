import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { randomBytes } from "crypto";

async function getStaffId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { staff: true },
  });
  return user?.staff?.[0]?.id ?? null;
}

function generateToken(): string {
  return randomBytes(3).toString("hex").toUpperCase(); // 6-char hex token e.g. "A1B2C3"
}

const createSchema = z.object({
  package_id: z.number().int(),
  rombel_id: z.number().int(),
  title: z.string().min(1),
  start_at: z.string().datetime(),
  end_at: z.string().datetime(),
  window_minutes: z.number().int().min(0).max(60).default(0),
});

function serializeSchedule(s: Record<string, unknown>) {
  return {
    ...s,
    id: String(s.id),
    package_id: Number(s.package_id),
    rombel_id: Number(s.rombel_id),
  };
}

// GET /api/teacher/ujian/jadwal
export async function GET(request: Request) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") ?? undefined;
    const search = searchParams.get("search") ?? "";
    const page = parseInt(searchParams.get("page") ?? "0");
    const pageSize = parseInt(searchParams.get("pageSize") ?? "20");

    const where = {
      teacher_id: staffId,
      deleted_at: null,
      ...(status ? { status: status as "DRAFT" | "OPEN" | "PAUSED" | "CLOSED" } : {}),
      ...(search ? { title: { contains: search, mode: "insensitive" as const } } : {}),
    };

    const [schedules, totalCount] = await Promise.all([
      prisma.examSchedule.findMany({
        where,
        skip: page * pageSize,
        take: pageSize,
        orderBy: { start_at: "desc" },
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
        },
      }),
      prisma.examSchedule.count({ where }),
    ]);

    const now = new Date();

    return NextResponse.json({
      data: schedules.map((s) => ({
        id: String(s.id),
        package_id: Number(s.package_id),
        rombel_id: Number(s.rombel_id),
        teacher_id: s.teacher_id,
        title: s.title,
        token: s.token,
        start_at: s.start_at.toISOString(),
        end_at: s.end_at.toISOString(),
        window_minutes: s.window_minutes,
        status: s.status,
        created_at: s.created_at.toISOString(),
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
        // Computed display status
        computedStatus: computeStatus(s.status, s.start_at, s.end_at, now),
      })),
      totalCount,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 });
  }
}

function computeStatus(
  dbStatus: string,
  startAt: Date,
  endAt: Date,
  now: Date
): "DRAFT" | "UPCOMING" | "OPEN" | "PAUSED" | "CLOSED" {
  if (dbStatus === "PAUSED") return "PAUSED";
  if (dbStatus === "CLOSED") return "CLOSED";
  if (dbStatus === "DRAFT") {
    if (now < startAt) return "UPCOMING";
    return "DRAFT";
  }
  // OPEN
  if (now > endAt) return "CLOSED";
  return "OPEN";
}

// POST /api/teacher/ujian/jadwal
export async function POST(request: Request) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 400 });
    }

    const { package_id, rombel_id, title, start_at, end_at, window_minutes } = parsed.data;

    if (new Date(start_at) >= new Date(end_at)) {
      return NextResponse.json({ error: "Waktu mulai harus sebelum waktu selesai" }, { status: 400 });
    }

    // Verify package belongs to teacher and is published
    const pkg = await prisma.examPackage.findFirst({
      where: { id: BigInt(package_id), teacher_id: staffId, deleted_at: null },
      include: { questions: { select: { id: true } } },
    });
    if (!pkg) return NextResponse.json({ error: "Paket ujian tidak ditemukan" }, { status: 404 });
    if (!pkg.is_published) {
      return NextResponse.json({ error: "Paket ujian belum dipublikasikan" }, { status: 400 });
    }
    if (pkg.questions.length === 0) {
      return NextResponse.json({ error: "Paket ujian tidak memiliki soal" }, { status: 400 });
    }

    // Generate unique token
    let token = generateToken();
    let attempts = 0;
    while (attempts < 5) {
      const exists = await prisma.examSchedule.findUnique({ where: { token } });
      if (!exists) break;
      token = generateToken();
      attempts++;
    }

    const schedule = await prisma.examSchedule.create({
      data: {
        package_id: BigInt(package_id),
        rombel_id: BigInt(rombel_id),
        teacher_id: staffId,
        title,
        token,
        start_at: new Date(start_at),
        end_at: new Date(end_at),
        window_minutes,
        status: "DRAFT",
      },
    });

    return NextResponse.json(
      serializeSchedule(schedule as unknown as Record<string, unknown>),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating schedule:", error);
    return NextResponse.json({ error: "Failed to create schedule" }, { status: 500 });
  }
}
