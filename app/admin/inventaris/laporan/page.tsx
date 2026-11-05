import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { serializeAssetCondition, serializeAssetStatus } from "@/lib/inventory/server";

export default async function InventoryReportPage() {
  const access = await requirePermission("read", "inventaris");
  if (!access) redirect("/unauthorized");

  const now = new Date();
  const [metrics, damagedAssets, dueMaintenances] = await Promise.all([
    Promise.all([
      db.asset.count(),
      db.asset.count({ where: { condition: { in: ["DAMAGED", "BROKEN"] } } }),
      db.asset.count({ where: { status: "LOST" } }),
      db.asset.count({ where: { status: "MAINTENANCE" } }),
    ]),
    db.asset.findMany({
      where: { OR: [{ condition: { in: ["DAMAGED", "BROKEN"] } }, { status: { in: ["LOST", "MAINTENANCE"] } }] },
      include: { category: true, location: true, room: true },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      take: 100,
    }),
    db.assetMaintenance.findMany({
      where: { status: { in: ["SCHEDULED", "IN_PROGRESS"] }, scheduled_at: { lte: now } },
      include: { asset: { include: { location: true } } },
      orderBy: { scheduled_at: "asc" },
      take: 50,
    }),
  ]);

  const [totalAssets, damagedCount, lostCount, maintenanceCount] = metrics;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Inventaris/Sarpras</p>
        <h1 className="text-2xl font-bold">Laporan Aset</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Total Aset" value={totalAssets} />
        <Metric label="Rusak" value={damagedCount} />
        <Metric label="Hilang" value={lostCount} />
        <Metric label="Perlu Pemeliharaan" value={maintenanceCount + dueMaintenances.length} />
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Aset Rusak/Hilang/Perawatan</h2>
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr><th className="px-3 py-2">Kode</th><th className="px-3 py-2">Aset</th><th className="px-3 py-2">Lokasi</th><th className="px-3 py-2">Kondisi</th><th className="px-3 py-2">Status</th></tr>
            </thead>
            <tbody>
              {damagedAssets.map((asset) => (
                <tr key={asset.id} className="border-t">
                  <td className="px-3 py-2 font-mono text-xs">{asset.asset_code}</td>
                  <td className="px-3 py-2 font-medium">{asset.name}</td>
                  <td className="px-3 py-2">{asset.location?.name ?? asset.room?.name ?? "-"}</td>
                  <td className="px-3 py-2">{serializeAssetCondition(asset.condition)}</td>
                  <td className="px-3 py-2">{serializeAssetStatus(asset.status)}</td>
                </tr>
              ))}
              {damagedAssets.length === 0 && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={5}>Tidak ada aset bermasalah.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Pemeliharaan Jatuh Tempo</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {dueMaintenances.map((item) => (
            <div key={item.id} className="rounded-lg border bg-white p-4">
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm">{item.asset.asset_code} - {item.asset.name}</p>
              <p className="text-xs text-slate-500">{item.scheduled_at.toLocaleDateString("id-ID")} - {item.asset.location?.name ?? "-"}</p>
            </div>
          ))}
          {dueMaintenances.length === 0 && <p className="text-sm text-slate-500">Tidak ada pemeliharaan jatuh tempo.</p>}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

