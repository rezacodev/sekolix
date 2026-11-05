import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";

const scheduleSchema = z.object({
  extracurricularId: z.string().min(1),
  title: z.string().trim().min(2).max(180),
  type: z.enum(["TRAINING", "EVENT", "COMPETITION", "MEETING"]).default("TRAINING"),
  startAt: z.coerce.date(),
  endAt: z.coerce.date().optional().nullable(),
  location: z.string().trim().max(180).optional().nullable(),
  description: z.string().trim().max(2000).optional().nullable(),
  status: z.enum(["SCHEDULED", "DONE", "CANCELLED"]).default("SCHEDULED"),
});

export async function GET() {
  const access = await requireApiPermission("read", "ekstrakurikuler");
  if (!access.ok) return access.response;
  const schedules = await db.extracurricularSchedule.findMany({ include: { extracurricular: true, attendances: true }, orderBy: { start_at: "desc" }, take: 300 });
  return NextResponse.json({ data: schedules });
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "ekstrakurikuler");
  if (!access.ok) return access.response;
  const parsed = scheduleSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  const club = await db.extracurricular.findUnique({ where: { id: parsed.data.extracurricularId } });
  if (!club) return NextResponse.json({ error: "Ekskul tidak ditemukan" }, { status: 404 });
  const schedule = await db.extracurricularSchedule.create({
    data: { extracurricular_id: club.id, title: parsed.data.title, type: parsed.data.type, start_at: parsed.data.startAt, end_at: parsed.data.endAt ?? null, location: parsed.data.location ?? null, description: parsed.data.description ?? null, status: parsed.data.status },
  });
  await logActivity({ actorUserId: access.context.user.id, actorName: access.context.user.name, module: "ekstrakurikuler", action: "create_schedule", entityType: "ExtracurricularSchedule", entityId: schedule.id, metadata: { club: club.name, title: schedule.title }, request });
  await writeAuditTrail({ actorUserId: access.context.user.id, entityType: "ExtracurricularSchedule", entityId: schedule.id, action: "create", after: schedule });
  return NextResponse.json({ data: schedule }, { status: 201 });
}

