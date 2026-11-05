import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { getReturnAssetStatus, getStaffIdForUser } from "@/lib/inventory/server";

const returnSchema = z.object({
  condition: z.enum(["GOOD", "FAIR", "DAMAGED", "BROKEN"]).default("GOOD"),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await requireApiPermission("update", "inventaris");
  if (!access.ok) return access.response;

  const { id } = await context.params;
  const parsed = returnSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const [loan, staffId] = await Promise.all([
    db.assetLoan.findUnique({ where: { id }, include: { asset: true } }),
    getStaffIdForUser(access.context.user.id),
  ]);
  if (!loan) return NextResponse.json({ error: "Peminjaman tidak ditemukan" }, { status: 404 });
  if (loan.status === "RETURNED") return NextResponse.json({ error: "Peminjaman sudah dikembalikan" }, { status: 400 });

  const nextStatus = getReturnAssetStatus(parsed.data.condition);
  const result = await db.$transaction(async (tx) => {
    const returned = await tx.assetLoan.update({
      where: { id },
      data: {
        status: "RETURNED",
        returned_at: new Date(),
        condition_in: parsed.data.condition,
        notes: parsed.data.notes ?? loan.notes,
      },
    });
    const updatedAsset = await tx.asset.update({
      where: { id: loan.asset_id },
      data: {
        condition: parsed.data.condition,
        status: nextStatus,
      },
    });
    const conditionHistory = await tx.assetConditionHistory.create({
      data: {
        asset_id: loan.asset_id,
        condition: parsed.data.condition,
        status: nextStatus,
        checked_by: staffId,
        description: `Pengembalian dari ${loan.borrower_name}. ${parsed.data.notes ?? ""}`.trim(),
      },
    });
    return { returned, updatedAsset, conditionHistory };
  });

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "inventaris",
    action: "return_asset_loan",
    entityType: "AssetLoan",
    entityId: id,
    metadata: { assetCode: loan.asset.asset_code, borrowerName: loan.borrower_name, condition: parsed.data.condition },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "AssetLoan",
    entityId: id,
    action: "return",
    before: loan,
    after: result,
  });

  return NextResponse.json({ data: result.returned });
}

