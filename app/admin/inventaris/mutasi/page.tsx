import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { AssetMoveForm } from "../_components/InventoryForms";

export default async function InventoryMovePage() {
  const access = await requirePermission("read", "inventaris");
  if (!access) redirect("/unauthorized");

  const [assets, locations, rooms, histories] = await Promise.all([
    db.asset.findMany({ orderBy: { name: "asc" }, take: 300 }),
    db.assetLocation.findMany({ where: { is_active: true }, orderBy: { name: "asc" } }),
    db.room.findMany({ where: { deleted_at: null, is_active: true }, orderBy: { name: "asc" } }),
    db.assetLocationHistory.findMany({
      include: { asset: true, fromLocation: true, toLocation: true, fromRoom: true, toRoom: true, mover: { select: { name: true } } },
      orderBy: { moved_at: "desc" },
      take: 100,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Inventaris/Sarpras</p>
        <h1 className="text-2xl font-bold">Mutasi Aset</h1>
      </div>

      <AssetMoveForm
        assets={assets.map((asset) => ({ id: asset.id, label: `${asset.asset_code} - ${asset.name}` }))}
        locations={locations.map((location) => ({ id: location.id, label: location.name }))}
        rooms={rooms.map((room) => ({ id: String(room.id), label: `${room.code ?? "-"} - ${room.name}` }))}
      />

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr><th className="px-3 py-2">Waktu</th><th className="px-3 py-2">Aset</th><th className="px-3 py-2">Dari</th><th className="px-3 py-2">Ke</th><th className="px-3 py-2">Petugas</th><th className="px-3 py-2">Alasan</th></tr>
          </thead>
          <tbody>
            {histories.map((history) => (
              <tr key={history.id} className="border-t">
                <td className="px-3 py-2">{history.moved_at.toLocaleDateString("id-ID")}</td>
                <td className="px-3 py-2 font-medium">{history.asset.asset_code} - {history.asset.name}</td>
                <td className="px-3 py-2">{history.fromLocation?.name ?? history.fromRoom?.name ?? "-"}</td>
                <td className="px-3 py-2">{history.toLocation?.name ?? history.toRoom?.name ?? "-"}</td>
                <td className="px-3 py-2">{history.mover?.name ?? "-"}</td>
                <td className="px-3 py-2">{history.reason ?? "-"}</td>
              </tr>
            ))}
            {histories.length === 0 && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={6}>Belum ada mutasi aset.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

