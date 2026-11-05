import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { getStaffIdForUser } from "@/lib/staff-ops/server";

const attendanceItemSchema = z.object({
  staffId: z.string().min(1),
  date: z.coerce.date(),
  checkIn: z.coerce.date().optional().nullable(),
  checkOut: z.coerce.date().optional().nullable(),
  status: z.enum(["PRESENT", "LATE", "SICK", "PERMISSION", "ABSENT", "LEAVE"]).default("PRESENT"),
  source: z.string().trim().max(40).default("MANUAL"),
  notes: z.string().trim().max(1000).optional().nullable(),
});

const attendanceSchema = z.union([
  attendanceItemSchema,
  z.object({ records: z.array(attendanceItemSchema).min(1).max(200) }),
]);

export async function GET(request: Request) {
  const access = await requireApiPermission("read", "pegawai");
  if (!access.ok) return access.response;

  const { searchParams } = new URL(request.url);
  const staffId = searchParams.get("staffId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const attendances = await db.staffAttendance.findMany({
    where: {
      ...(staffId ? { staff_id: staffId } : {}),
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    include: {
      staff: { select: { id: true, name: true, nip: true, role: true } },
      recorder: { select: { name: true } },
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: 500,
  });

  return NextResponse.json({ data: attendances });
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "pegawai");
  if (!access.ok) return access.response;

  const parsed = attendanceSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const records = "records" in parsed.data ? parsed.data.records : [parsed.data];
  const staffIds = [...new Set(records.map((record) => record.staffId))];
  const [staffCount, recorderId] = await Promise.all([
    db.staff.count({ where: { id: { in: staffIds }, deleted_at: null } }),
    getStaffIdForUser(access.context.user.id),
  ]);
  if (staffCount !== staffIds.length) return NextResponse.json({ error: "Sebagian pegawai tidak ditemukan" }, { status: 404 });

  const result = await db.$transaction(async (tx) => {
    const saved = [];
    for (const record of records) {
      const item = await tx.staffAttendance.upsert({
        where: { staff_id_date: { staff_id: record.staffId, date: record.date } },
        update: {
          check_in: record.checkIn ?? null,
          check_out: record.checkOut ?? null,
          status: record.status,
          source: record.source,
          recorded_by: recorderId,
          notes: record.notes ?? null,
        },
        create: {
          staff_id: record.staffId,
          date: record.date,
          check_in: record.checkIn ?? null,
          check_out: record.checkOut ?? null,
          status: record.status,
          source: record.source,
          recorded_by: recorderId,
          notes: record.notes ?? null,
        },
      });
      saved.push(item);
    }
    return saved;
  });

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "pegawai",
    action: records.length > 1 ? "import_attendance" : "upsert_attendance",
    entityType: "StaffAttendance",
    entityId: result[0]?.id ?? null,
    metadata: { count: result.length },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "StaffAttendance",
    entityId: result[0]?.id ?? "bulk",
    action: records.length > 1 ? "bulk_upsert" : "upsert",
    after: result,
  });

  return NextResponse.json({ data: result }, { status: 201 });
}

