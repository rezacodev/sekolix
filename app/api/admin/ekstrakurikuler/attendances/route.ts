import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { getStaffIdForUser } from "@/lib/extracurricular/server";

const attendanceSchema = z.object({
  scheduleId: z.string().min(1),
  records: z.array(z.object({
    studentId: z.string().min(1),
    status: z.enum(["PRESENT", "SICK", "PERMISSION", "ABSENT"]).default("PRESENT"),
    notes: z.string().trim().max(500).optional().nullable(),
  })).min(1).max(200),
});

export async function GET() {
  const access = await requireApiPermission("read", "ekstrakurikuler");
  if (!access.ok) return access.response;
  const attendances = await db.extracurricularAttendance.findMany({ include: { schedule: { include: { extracurricular: true } }, student: true, recorder: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 500 });
  return NextResponse.json({ data: attendances });
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "ekstrakurikuler");
  if (!access.ok) return access.response;
  const parsed = attendanceSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  const [schedule, recorderId] = await Promise.all([db.extracurricularSchedule.findUnique({ where: { id: parsed.data.scheduleId }, include: { extracurricular: true } }), getStaffIdForUser(access.context.user.id)]);
  if (!schedule) return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });
  const result = await db.$transaction(async (tx) => {
    const saved = [];
    for (const record of parsed.data.records) {
      const member = await tx.extracurricularMember.findUnique({ where: { extracurricular_id_student_id: { extracurricular_id: schedule.extracurricular_id, student_id: record.studentId } } });
      const attendance = await tx.extracurricularAttendance.upsert({
        where: { schedule_id_student_id: { schedule_id: schedule.id, student_id: record.studentId } },
        update: { status: record.status, notes: record.notes ?? null, recorded_by: recorderId, member_id: member?.id ?? null },
        create: { schedule_id: schedule.id, student_id: record.studentId, member_id: member?.id ?? null, status: record.status, notes: record.notes ?? null, recorded_by: recorderId },
      });
      saved.push(attendance);
    }
    return saved;
  });
  await logActivity({ actorUserId: access.context.user.id, actorName: access.context.user.name, module: "ekstrakurikuler", action: "record_attendance", entityType: "ExtracurricularAttendance", entityId: result[0]?.id ?? null, metadata: { schedule: schedule.title, count: result.length }, request });
  await writeAuditTrail({ actorUserId: access.context.user.id, entityType: "ExtracurricularAttendance", entityId: result[0]?.id ?? "bulk", action: "bulk_upsert", after: result });
  return NextResponse.json({ data: result }, { status: 201 });
}

