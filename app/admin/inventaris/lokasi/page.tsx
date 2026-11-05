import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { AssetLocationForm } from "../_components/InventoryForms";

export default async function InventoryLocationsPage() {
  const access = await requirePermission("read", "inventaris");
  if (!access) redirect("/unauthorized");

  const [rooms, locations] = await Promise.all([
    db.room.findMany({ where: { deleted_at: null, is_active: true }, orderBy: { name: "asc" } }),
    db.assetLocation.findMany({ include: { room: true, _count: { select: { assets: true } } }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Inventaris/Sarpras</p>
        <h1 className="text-2xl font-bold">Lokasi Aset</h1>
      </div>

      <AssetLocationForm rooms={rooms.map((room) => ({ id: String(room.id), label: `${room.code ?? "-"} - ${room.name}` }))} />

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr><th className="px-3 py-2">Kode</th><th className="px-3 py-2">Lokasi</th><th className="px-3 py-2">Ruang</th><th className="px-3 py-2">Gedung</th><th className="px-3 py-2 text-right">Aset</th></tr>
          </thead>
          <tbody>
            {locations.map((location) => (
              <tr key={location.id} className="border-t">
                <td className="px-3 py-2 font-mono text-xs">{location.code}</td>
                <td className="px-3 py-2 font-medium">{location.name}</td>
                <td className="px-3 py-2">{location.room?.name ?? "-"}</td>
                <td className="px-3 py-2">{location.building ?? "-"} {location.floor ? `/ ${location.floor}` : ""}</td>
                <td className="px-3 py-2 text-right">{location._count.assets}</td>
              </tr>
            ))}
            {locations.length === 0 && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={5}>Belum ada lokasi.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

