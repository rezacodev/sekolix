import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await requireApiPermission("create", "ekstrakurikuler");
  if (!access.ok) return access.response;
  const { id } = await context.params;
  const schedule = await db.extracurricularSchedule.findUnique({ where: { id }, include: { extracurricular: true } });
  if (!schedule) return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });
  const event = await db.event.create({
    data: {
      title: `${schedule.extracurricular.name}: ${schedule.title}`,
      slug: `${slugify(schedule.extracurricular.code)}-${slugify(schedule.title)}-${randomUUID().slice(0, 8)}`,
      description: schedule.description ?? `Kegiatan ${schedule.extracurricular.name}`,
      startDate: schedule.start_at,
      endDate: schedule.end_at,
      location: schedule.location,
      isPublished: true,
    },
  });
  const updated = await db.extracurricularSchedule.update({ where: { id }, data: { is_published: true, published_event_id: event.id } });
  await logActivity({ actorUserId: access.context.user.id, actorName: access.context.user.name, module: "ekstrakurikuler", action: "publish_schedule_to_landing", entityType: "ExtracurricularSchedule", entityId: id, metadata: { eventId: event.id }, request });
  await writeAuditTrail({ actorUserId: access.context.user.id, entityType: "ExtracurricularSchedule", entityId: id, action: "publish", before: schedule, after: updated });
  return NextResponse.json({ data: updated });
}
