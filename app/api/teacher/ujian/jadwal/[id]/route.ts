import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

async function getStaffId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { staff: true },
  });
  return user?.staff?.[0]?.id ?? null;
}

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  start_at: z.string().datetime().optional(),
  end_at: z.string().datetime().optional(),
  window_minutes: z.number().int().min(0).max(60).optional(),
  // Status transitions: DRAFT→OPEN, OPEN→PAUSED, PAUSED→OPEN, any→CLOSED
  status: z.enum(["DRAFT", "OPEN", "PAUSED", "CLOSED"]).optional(),
  // Extend end_at by N minutes
  extend_minutes: z.number().int().min(1).max(120).optional(),
});

type Params = { params: Promise<{ id: string }> };

// GET /api/teacher/ujian/jadwal/[id]  — detail + monitor data
export async function GET(_req: Request, { params }: Params) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const schedule = await prisma.examSchedule.findFirst({
      where: { id: BigInt(id), teacher_id: staffId, deleted_at: null },
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
            students: {
              where: { deleted_at: null },
              orderBy: { fullName: "asc" },
              select: { id: true, fullName: true, nisn: true },
            },
          },
        },
      },
    });

    if (!schedule) return NextResponse.json({ error: "Schedule not found" }, { status: 404 });

    return NextResponse.json({
      id: String(schedule.id),
      package_id: Number(schedule.package_id),
      rombel_id: Number(schedule.rombel_id),
      teacher_id: schedule.teacher_id,
      title: schedule.title,
      token: schedule.token,
      start_at: schedule.start_at.toISOString(),
      end_at: schedule.end_at.toISOString(),
      window_minutes: schedule.window_minutes,
      status: schedule.status,
      created_at: schedule.created_at.toISOString(),
      package: {
        id: String(schedule.package.id),
        title: schedule.package.title,
        exam_type: schedule.package.exam_type,
        duration: schedule.package.duration,
        passing_grade: schedule.package.passing_grade,
        question_count: schedule.package.questions.length,
      },
      rombel: {
        id: String(schedule.rombel.id),
        name: schedule.rombel.name,
        className: schedule.rombel.class.name,
        students: schedule.rombel.students.map((s) => ({
          id: s.id,
          fullName: s.fullName,
          nisn: s.nisn ?? "",
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 });
  }
}

// PUT /api/teacher/ujian/jadwal/[id]
export async function PUT(request: Request, { params }: Params) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const existing = await prisma.examSchedule.findFirst({
      where: { id: BigInt(id), teacher_id: staffId, deleted_at: null },
    });
    if (!existing) return NextResponse.json({ error: "Schedule not found" }, { status: 404 });

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 400 });
    }

    const { extend_minutes, status, start_at, end_at, ...fields } = parsed.data;

    // Validate time if both provided
    const newStart = start_at ? new Date(start_at) : existing.start_at;
    const newEnd = end_at ? new Date(end_at) : existing.end_at;
    if (newStart >= newEnd) {
      return NextResponse.json({ error: "Waktu mulai harus sebelum waktu selesai" }, { status: 400 });
    }

    const computedEndAt = extend_minutes
      ? new Date(existing.end_at.getTime() + extend_minutes * 60 * 1000)
      : newEnd;

    const schedule = await prisma.examSchedule.update({
      where: { id: BigInt(id) },
      data: {
        ...(fields.title !== undefined ? { title: fields.title } : {}),
        ...(fields.window_minutes !== undefined ? { window_minutes: fields.window_minutes } : {}),
        ...(start_at ? { start_at: new Date(start_at) } : {}),
        end_at: computedEndAt,
        ...(status ? { status } : {}),
      },
    });

    return NextResponse.json({
      id: String(schedule.id),
      status: schedule.status,
      start_at: schedule.start_at.toISOString(),
      end_at: schedule.end_at.toISOString(),
    });
  } catch (error) {
    console.error("Error updating schedule:", error);
    return NextResponse.json({ error: "Failed to update schedule" }, { status: 500 });
  }
}

// DELETE /api/teacher/ujian/jadwal/[id]
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const existing = await prisma.examSchedule.findFirst({
      where: { id: BigInt(id), teacher_id: staffId, deleted_at: null },
    });
    if (!existing) return NextResponse.json({ error: "Schedule not found" }, { status: 404 });

    if (existing.status === "OPEN") {
      return NextResponse.json({ error: "Tidak dapat menghapus jadwal yang sedang berlangsung" }, { status: 400 });
    }

    await prisma.examSchedule.update({
      where: { id: BigInt(id) },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json({ error: "Failed to delete schedule" }, { status: 500 });
  }
}
