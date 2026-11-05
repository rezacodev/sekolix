import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { getStaffIdForUser } from "@/lib/staff-ops/server";

const dutySchema = z.object({
  staffId: z.string().min(1),
  dutyDate: z.coerce.date(),
  shift: z.string().trim().max(80).optional().nullable(),
  location: z.string().trim().max(160).optional().nullable(),
  task: z.string().trim().min(3).max(2000),
  status: z.enum(["SCHEDULED", "DONE", "CANCELLED"]).default("SCHEDULED"),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export async function GET() {
  const access = await requireApiPermission("read", "pegawai");
  if (!access.ok) return access.response;

  const schedules = await db.staffDutySchedule.findMany({
    include: { staff: { select: { id: true, name: true, nip: true } }, creator: { select: { name: true } } },
    orderBy: [{ duty_date: "desc" }, { createdAt: "desc" }],
    take: 300,
  });
  return NextResponse.json({ data: schedules });
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "pegawai");
  if (!access.ok) return access.response;

  const parsed = dutySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const [staff, creatorId] = await Promise.all([
    db.staff.findFirst({ where: { id: parsed.data.staffId, deleted_at: null } }),
    getStaffIdForUser(access.context.user.id),
  ]);
  if (!staff) return NextResponse.json({ error: "Pegawai tidak ditemukan" }, { status: 404 });

  const schedule = await db.staffDutySchedule.create({
    data: {
      staff_id: staff.id,
      duty_date: parsed.data.dutyDate,
      shift: parsed.data.shift ?? null,
      location: parsed.data.location ?? null,
      task: parsed.data.task,
      status: parsed.data.status,
      created_by: creatorId,
      notes: parsed.data.notes ?? null,
    },
  });

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "pegawai",
    action: "create_duty_schedule",
    entityType: "StaffDutySchedule",
    entityId: schedule.id,
    metadata: { staffName: staff.name, dutyDate: schedule.duty_date },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "StaffDutySchedule",
    entityId: schedule.id,
    action: "create",
    after: schedule,
  });

  return NextResponse.json({ data: schedule }, { status: 201 });
}

