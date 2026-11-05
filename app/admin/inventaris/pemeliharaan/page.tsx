import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { formatRupiah, serializeMaintenanceStatus } from "@/lib/inventory/server";
import { CompleteMaintenanceButton, MaintenanceForm } from "../_components/InventoryForms";

export default async function InventoryMaintenancePage() {
  const access = await requirePermission("read", "inventaris");
  if (!access) redirect("/unauthorized");

  const [assets, maintenances] = await Promise.all([
    db.asset.findMany({ orderBy: { name: "asc" }, take: 300 }),
    db.assetMaintenance.findMany({ include: { asset: true, technician: { select: { name: true } } }, orderBy: [{ status: "asc" }, { scheduled_at: "asc" }], take: 200 }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Inventaris/Sarpras</p>
        <h1 className="text-2xl font-bold">Pemeliharaan Aset</h1>
      </div>

      <MaintenanceForm assets={assets.map((asset) => ({ id: asset.id, label: `${asset.asset_code} - ${asset.name}` }))} />

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr><th className="px-3 py-2">Jadwal</th><th className="px-3 py-2">Aset</th><th className="px-3 py-2">Pekerjaan</th><th className="px-3 py-2">Petugas</th><th className="px-3 py-2">Biaya</th><th className="px-3 py-2">Status</th><th className="px-3 py-2"></th></tr>
          </thead>
          <tbody>
            {maintenances.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-3 py-2">{item.scheduled_at.toLocaleDateString("id-ID")}</td>
                <td className="px-3 py-2 font-medium">{item.asset.asset_code} - {item.asset.name}</td>
                <td className="px-3 py-2">{item.title}</td>
                <td className="px-3 py-2">{item.technician?.name ?? "-"}</td>
                <td className="px-3 py-2">{formatRupiah(item.cost)}</td>
                <td className="px-3 py-2">{serializeMaintenanceStatus(item.status)}</td>
                <td className="px-3 py-2 text-right">{item.status !== "DONE" ? <CompleteMaintenanceButton maintenanceId={item.id} /> : null}</td>
              </tr>
            ))}
            {maintenances.length === 0 && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={7}>Belum ada jadwal pemeliharaan.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

