import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";

const updateReferralSchema = z.object({
  status: z.enum(["PENDING", "ACCEPTED", "IN_PROGRESS", "RESOLVED", "REJECTED"]),
  assignedTo: z.string().optional().nullable(),
  response: z.string().trim().max(5000).optional().nullable(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const access = await requireApiPermission("update", "bk");
  if (!access.ok) return access.response;

  const { id } = await context.params;
  const parsed = updateReferralSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const before = await db.counselingReferral.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: "Rujukan tidak ditemukan" }, { status: 404 });

  const after = await db.counselingReferral.update({
    where: { id },
    data: {
      status: parsed.data.status,
      assigned_to: parsed.data.assignedTo,
      response: parsed.data.response,
    },
  });

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "bk",
    action: "update_referral",
    entityType: "CounselingReferral",
    entityId: id,
    metadata: { status: after.status },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "CounselingReferral",
    entityId: id,
    action: "update",
    before,
    after,
  });

  return NextResponse.json({ data: after });
}
