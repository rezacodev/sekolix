import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { getStaffIdForUser } from "@/lib/staff-ops/server";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";

const reviewSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "CANCELLED"]),
  reviewNote: z.string().trim().max(1000).optional().nullable(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await requireApiPermission("approve", "pegawai");
  if (!access.ok) return access.response;

  const { id } = await context.params;
  const parsed = reviewSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const [before, reviewerId] = await Promise.all([
    db.staffLeaveRequest.findUnique({ where: { id }, include: { staff: true } }),
    getStaffIdForUser(access.context.user.id),
  ]);
  if (!before) return NextResponse.json({ error: "Pengajuan tidak ditemukan" }, { status: 404 });

  const result = await db.$transaction(async (tx) => {
    const leave = await tx.staffLeaveRequest.update({
      where: { id },
      data: {
        status: parsed.data.status,
        reviewed_by: reviewerId,
        reviewed_at: new Date(),
        review_note: parsed.data.reviewNote ?? null,
      },
    });
    if (parsed.data.status === "APPROVED") {
      await tx.staffAttendance.createMany({
        data: Array.from({ length: leave.total_days }).map((_, index) => {
          const date = new Date(leave.start_date);
          date.setDate(date.getDate() + index);
          return {
            staff_id: leave.staff_id,
            date,
            status: leave.type === "SICK" ? "SICK" : "LEAVE",
            source: "LEAVE_REQUEST",
            recorded_by: reviewerId,
            notes: `Disetujui dari pengajuan ${leave.type}.`,
          };
        }),
        skipDuplicates: true,
      });
    }
    return leave;
  });

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "pegawai",
    action: "review_leave_request",
    entityType: "StaffLeaveRequest",
    entityId: id,
    metadata: { status: parsed.data.status, staffName: before.staff.name },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "StaffLeaveRequest",
    entityId: id,
    action: "review",
    before,
    after: result,
    reason: parsed.data.reviewNote ?? null,
  });

  return NextResponse.json({ data: result });
}

