import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";

export async function GET() {
  const access = await requireApiPermission("read", "inventaris");
  if (!access.ok) return access.response;

  const now = new Date();
  const [totalAssets, activeAssets, borrowedAssets, maintenanceAssets, lostAssets, brokenAssets, dueMaintenances, damagedAssets] = await Promise.all([
    db.asset.count(),
    db.asset.count({ where: { status: "ACTIVE" } }),
    db.asset.count({ where: { status: "BORROWED" } }),
    db.asset.count({ where: { status: "MAINTENANCE" } }),
    db.asset.count({ where: { status: "LOST" } }),
    db.asset.count({ where: { condition: "BROKEN" } }),
    db.assetMaintenance.findMany({
      where: { status: { in: ["SCHEDULED", "IN_PROGRESS"] }, scheduled_at: { lte: now } },
      include: { asset: { include: { location: true } } },
      orderBy: { scheduled_at: "asc" },
      take: 50,
    }),
    db.asset.findMany({
      where: { OR: [{ condition: { in: ["DAMAGED", "BROKEN"] } }, { status: { in: ["LOST", "MAINTENANCE"] } }] },
      include: { category: true, location: true, room: true },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      take: 100,
    }),
  ]);

  return NextResponse.json({
    data: {
      metrics: {
        totalAssets,
        activeAssets,
        borrowedAssets,
        maintenanceAssets,
        lostAssets,
        brokenAssets,
        dueMaintenanceCount: dueMaintenances.length,
      },
      damagedAssets,
      dueMaintenances: dueMaintenances.map((item) => ({ ...item, cost: item.cost?.toNumber() ?? null })),
    },
  });
}

