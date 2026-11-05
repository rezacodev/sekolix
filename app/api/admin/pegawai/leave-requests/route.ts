import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { calculateLeaveDays, getStaffIdForUser } from "@/lib/staff-ops/server";
import { createApprovalRequest, logActivity, writeAuditTrail } from "@/lib/governance/server";

const leaveSchema = z.object({
  staffId: z.string().min(1),
  type: z.enum(["LEAVE", "SICK", "PERMISSION", "MATERNITY", "OTHER"]).default("LEAVE"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  reason: z.string().trim().min(3).max(2000),
  attachmentUrl: z.string().trim().url().optional().nullable(),
});

export async function GET() {
  const access = await requireApiPermission("read", "pegawai");
  if (!access.ok) return access.response;

  const requests = await db.staffLeaveRequest.findMany({
    include: {
      staff: { select: { id: true, name: true, nip: true, role: true } },
      reviewer: { select: { name: true } },
    },
    orderBy: [{ status: "asc" }, { start_date: "desc" }],
    take: 300,
  });
  return NextResponse.json({ data: requests });
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "pegawai");
  if (!access.ok) return access.response;

  const parsed = leaveSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const totalDays = calculateLeaveDays(parsed.data.startDate, parsed.data.endDate);
  if (totalDays < 1) return NextResponse.json({ error: "Tanggal selesai harus setelah tanggal mulai" }, { status: 400 });

  const staff = await db.staff.findFirst({ where: { id: parsed.data.staffId, deleted_at: null } });
  if (!staff) return NextResponse.json({ error: "Pegawai tidak ditemukan" }, { status: 404 });

  const leave = await db.staffLeaveRequest.create({
    data: {
      staff_id: staff.id,
      type: parsed.data.type,
      start_date: parsed.data.startDate,
      end_date: parsed.data.endDate,
      total_days: totalDays,
      reason: parsed.data.reason,
      attachment_url: parsed.data.attachmentUrl ?? null,
      status: "PENDING",
    },
  });

  await createApprovalRequest({
    module: "pegawai",
    action: "approve_leave",
    title: `Pengajuan ${parsed.data.type} - ${staff.name}`,
    description: parsed.data.reason,
    entityType: "StaffLeaveRequest",
    entityId: leave.id,
    requestedBy: access.context.user.id,
    requestedByName: access.context.user.name,
    payload: { leaveId: leave.id, staffId: staff.id, totalDays },
    steps: [{ approverRoleSlug: "KEPALA_SEKOLAH" }],
  });
  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "pegawai",
    action: "create_leave_request",
    entityType: "StaffLeaveRequest",
    entityId: leave.id,
    metadata: { staffName: staff.name, totalDays },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "StaffLeaveRequest",
    entityId: leave.id,
    action: "create",
    after: leave,
  });

  return NextResponse.json({ data: leave }, { status: 201 });
}

