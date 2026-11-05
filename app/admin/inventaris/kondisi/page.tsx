import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { serializeAssetCondition, serializeAssetStatus } from "@/lib/inventory/server";
import { AssetConditionForm } from "../_components/InventoryForms";

export default async function InventoryConditionPage() {
  const access = await requirePermission("read", "inventaris");
  if (!access) redirect("/unauthorized");

  const [assets, histories] = await Promise.all([
    db.asset.findMany({ orderBy: { name: "asc" }, take: 300 }),
    db.assetConditionHistory.findMany({
      include: { asset: true, checker: { select: { name: true } } },
      orderBy: { checked_at: "desc" },
      take: 100,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Inventaris/Sarpras</p>
        <h1 className="text-2xl font-bold">Kondisi Aset</h1>
      </div>

      <AssetConditionForm assets={assets.map((asset) => ({ id: asset.id, label: `${asset.asset_code} - ${asset.name}` }))} />

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr><th className="px-3 py-2">Waktu</th><th className="px-3 py-2">Aset</th><th className="px-3 py-2">Kondisi</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Petugas</th><th className="px-3 py-2">Catatan</th></tr>
          </thead>
          <tbody>
            {histories.map((history) => (
              <tr key={history.id} className="border-t">
                <td className="px-3 py-2">{history.checked_at.toLocaleDateString("id-ID")}</td>
                <td className="px-3 py-2 font-medium">{history.asset.asset_code} - {history.asset.name}</td>
                <td className="px-3 py-2">{serializeAssetCondition(history.condition)}</td>
                <td className="px-3 py-2">{history.status ? serializeAssetStatus(history.status) : "-"}</td>
                <td className="px-3 py-2">{history.checker?.name ?? "-"}</td>
                <td className="px-3 py-2">{history.description ?? "-"}</td>
              </tr>
            ))}
            {histories.length === 0 && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={6}>Belum ada riwayat kondisi.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

