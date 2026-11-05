import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { getStaffIdForUser } from "@/lib/inventory/server";

const completeSchema = z.object({
  condition: z.enum(["GOOD", "FAIR", "DAMAGED", "BROKEN"]).default("GOOD"),
  resultNote: z.string().trim().max(2000).optional().nullable(),
  cost: z.coerce.number().min(0).optional().nullable(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await requireApiPermission("update", "inventaris");
  if (!access.ok) return access.response;

  const { id } = await context.params;
  const parsed = completeSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const [maintenance, staffId] = await Promise.all([
    db.assetMaintenance.findUnique({ where: { id }, include: { asset: true } }),
    getStaffIdForUser(access.context.user.id),
  ]);
  if (!maintenance) return NextResponse.json({ error: "Pemeliharaan tidak ditemukan" }, { status: 404 });
  if (maintenance.status === "DONE") return NextResponse.json({ error: "Pemeliharaan sudah selesai" }, { status: 400 });

  const assetStatus = parsed.data.condition === "BROKEN" || parsed.data.condition === "DAMAGED" ? "MAINTENANCE" : "ACTIVE";
  const result = await db.$transaction(async (tx) => {
    const completed = await tx.assetMaintenance.update({
      where: { id },
      data: {
        status: "DONE",
        completed_at: new Date(),
        result_note: parsed.data.resultNote ?? null,
        cost: parsed.data.cost ?? maintenance.cost,
      },
    });
    const updatedAsset = await tx.asset.update({
      where: { id: maintenance.asset_id },
      data: {
        condition: parsed.data.condition,
        status: assetStatus,
      },
    });
    const conditionHistory = await tx.assetConditionHistory.create({
      data: {
        asset_id: maintenance.asset_id,
        condition: parsed.data.condition,
        status: assetStatus,
        checked_by: staffId,
        description: parsed.data.resultNote ?? "Pemeliharaan selesai.",
      },
    });
    return { completed, updatedAsset, conditionHistory };
  });

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "inventaris",
    action: "complete_maintenance",
    entityType: "AssetMaintenance",
    entityId: id,
    metadata: { assetCode: maintenance.asset.asset_code, condition: parsed.data.condition },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "AssetMaintenance",
    entityId: id,
    action: "complete",
    before: maintenance,
    after: result,
  });

  return NextResponse.json({ data: result.completed });
}

