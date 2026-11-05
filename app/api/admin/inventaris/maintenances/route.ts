import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { getStaffIdForUser } from "@/lib/inventory/server";

const maintenanceSchema = z.object({
  assetId: z.string().min(1),
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().max(2000).optional().nullable(),
  scheduledAt: z.coerce.date(),
  cost: z.coerce.number().min(0).optional().nullable(),
});

export async function GET() {
  const access = await requireApiPermission("read", "inventaris");
  if (!access.ok) return access.response;

  const maintenances = await db.assetMaintenance.findMany({
    include: {
      asset: { include: { category: true, location: true } },
      technician: { select: { name: true } },
    },
    orderBy: [{ status: "asc" }, { scheduled_at: "asc" }],
    take: 300,
  });
  return NextResponse.json({
    data: maintenances.map((item) => ({ ...item, cost: item.cost?.toNumber() ?? null })),
  });
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "inventaris");
  if (!access.ok) return access.response;

  const parsed = maintenanceSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const [asset, staffId] = await Promise.all([
    db.asset.findUnique({ where: { id: parsed.data.assetId } }),
    getStaffIdForUser(access.context.user.id),
  ]);
  if (!asset) return NextResponse.json({ error: "Aset tidak ditemukan" }, { status: 404 });

  const result = await db.$transaction(async (tx) => {
    const maintenance = await tx.assetMaintenance.create({
      data: {
        asset_id: asset.id,
        technician_id: staffId,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        scheduled_at: parsed.data.scheduledAt,
        cost: parsed.data.cost ?? null,
        status: "SCHEDULED",
      },
    });
    const updatedAsset = await tx.asset.update({
      where: { id: asset.id },
      data: { status: "MAINTENANCE" },
    });
    return { maintenance, updatedAsset };
  });

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "inventaris",
    action: "schedule_maintenance",
    entityType: "AssetMaintenance",
    entityId: result.maintenance.id,
    metadata: { assetCode: asset.asset_code, title: result.maintenance.title },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "AssetMaintenance",
    entityId: result.maintenance.id,
    action: "create",
    before: asset,
    after: result,
  });

  return NextResponse.json({ data: result.maintenance }, { status: 201 });
}

