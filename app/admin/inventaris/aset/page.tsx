import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { formatRupiah, serializeAssetCondition, serializeAssetStatus } from "@/lib/inventory/server";
import { AssetCategoryForm, AssetForm } from "../_components/InventoryForms";

export default async function InventoryAssetsPage() {
  const access = await requirePermission("read", "inventaris");
  if (!access) redirect("/unauthorized");

  const [categories, locations, rooms, staff, assets] = await Promise.all([
    db.assetCategory.findMany({ include: { _count: { select: { assets: true } } }, orderBy: { name: "asc" } }),
    db.assetLocation.findMany({ where: { is_active: true }, orderBy: { name: "asc" } }),
    db.room.findMany({ where: { deleted_at: null, is_active: true }, orderBy: { name: "asc" } }),
    db.staff.findMany({ where: { deleted_at: null, isActive: true }, orderBy: { name: "asc" }, take: 200 }),
    db.asset.findMany({
      include: { category: true, location: true, room: true, responsibleStaff: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
      take: 200,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Inventaris/Sarpras</p>
        <h1 className="text-2xl font-bold">Aset dan Kategori</h1>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Kategori Aset</h2>
        <AssetCategoryForm />
        <div className="grid gap-3 md:grid-cols-4">
          {categories.map((category) => (
            <div key={category.id} className="rounded-lg border bg-white p-3">
              <p className="font-semibold">{category.name}</p>
              <p className="text-xs text-slate-500">{category.code} - {category._count.assets} aset</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Tambah Aset</h2>
        <AssetForm
          categories={categories.filter((item) => item.is_active).map((item) => ({ id: item.id, label: item.name }))}
          locations={locations.map((item) => ({ id: item.id, label: item.name }))}
          rooms={rooms.map((item) => ({ id: String(item.id), label: `${item.code ?? "-"} - ${item.name}` }))}
          staff={staff.map((item) => ({ id: item.id, label: item.name }))}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Daftar Aset</h2>
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Kode</th>
                <th className="px-3 py-2">Aset</th>
                <th className="px-3 py-2">Lokasi</th>
                <th className="px-3 py-2">Kondisi</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Nilai</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id} className="border-t">
                  <td className="px-3 py-2 font-mono text-xs">{asset.asset_code}</td>
                  <td className="px-3 py-2">
                    <p className="font-medium">{asset.name}</p>
                    <p className="text-xs text-slate-500">{asset.category?.name ?? "-"} {asset.responsibleStaff ? `- ${asset.responsibleStaff.name}` : ""}</p>
                  </td>
                  <td className="px-3 py-2">{asset.location?.name ?? asset.room?.name ?? "-"}</td>
                  <td className="px-3 py-2">{serializeAssetCondition(asset.condition)}</td>
                  <td className="px-3 py-2">{serializeAssetStatus(asset.status)}</td>
                  <td className="px-3 py-2 text-right">{formatRupiah(asset.purchase_price)}</td>
                </tr>
              ))}
              {assets.length === 0 && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={6}>Belum ada aset.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

