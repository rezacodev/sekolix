import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { getStaffIdForUser } from "@/lib/inventory/server";

const conditionSchema = z.object({
  condition: z.enum(["GOOD", "FAIR", "DAMAGED", "BROKEN"]),
  status: z.enum(["ACTIVE", "BORROWED", "MAINTENANCE", "LOST", "DISPOSED"]).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  photoUrl: z.string().trim().url().optional().nullable(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await requireApiPermission("update", "inventaris");
  if (!access.ok) return access.response;

  const { id } = await context.params;
  const parsed = conditionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const asset = await db.asset.findUnique({ where: { id } });
  if (!asset) return NextResponse.json({ error: "Aset tidak ditemukan" }, { status: 404 });

  const staffId = await getStaffIdForUser(access.context.user.id);
  const nextStatus = parsed.data.status ?? asset.status;
  const result = await db.$transaction(async (tx) => {
    const updated = await tx.asset.update({
      where: { id },
      data: {
        condition: parsed.data.condition,
        status: nextStatus,
      },
    });
    const history = await tx.assetConditionHistory.create({
      data: {
        asset_id: id,
        condition: parsed.data.condition,
        status: nextStatus,
        checked_by: staffId,
        description: parsed.data.description ?? null,
        photo_url: parsed.data.photoUrl ?? null,
      },
    });
    return { updated, history };
  });

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "inventaris",
    action: "update_asset_condition",
    entityType: "Asset",
    entityId: id,
    metadata: { fromCondition: asset.condition, toCondition: parsed.data.condition, status: nextStatus },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "Asset",
    entityId: id,
    action: "update_condition",
    before: asset,
    after: result,
  });

  return NextResponse.json({ data: result.updated });
}

