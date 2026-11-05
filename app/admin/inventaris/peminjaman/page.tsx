import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { serializeLoanStatus } from "@/lib/inventory/server";
import { AssetLoanForm, AssetReturnButton } from "../_components/InventoryForms";

export default async function InventoryLoanPage() {
  const access = await requirePermission("read", "inventaris");
  if (!access) redirect("/unauthorized");

  const [availableAssets, rooms, loans] = await Promise.all([
    db.asset.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" }, take: 300 }),
    db.room.findMany({ where: { deleted_at: null, is_active: true }, orderBy: { name: "asc" } }),
    db.assetLoan.findMany({ include: { asset: true, room: true }, orderBy: [{ status: "asc" }, { start_at: "desc" }], take: 200 }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Inventaris/Sarpras</p>
        <h1 className="text-2xl font-bold">Peminjaman Barang/Ruang</h1>
      </div>

      <AssetLoanForm
        assets={availableAssets.map((asset) => ({ id: asset.id, label: `${asset.asset_code} - ${asset.name}` }))}
        rooms={rooms.map((room) => ({ id: String(room.id), label: `${room.code ?? "-"} - ${room.name}` }))}
      />

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr><th className="px-3 py-2">Aset</th><th className="px-3 py-2">Peminjam</th><th className="px-3 py-2">Ruang</th><th className="px-3 py-2">Mulai</th><th className="px-3 py-2">Tempo</th><th className="px-3 py-2">Status</th><th className="px-3 py-2"></th></tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan.id} className="border-t">
                <td className="px-3 py-2 font-medium">{loan.asset.asset_code} - {loan.asset.name}</td>
                <td className="px-3 py-2">{loan.borrower_name}</td>
                <td className="px-3 py-2">{loan.room?.name ?? "-"}</td>
                <td className="px-3 py-2">{loan.start_at.toLocaleDateString("id-ID")}</td>
                <td className="px-3 py-2">{loan.due_at.toLocaleDateString("id-ID")}</td>
                <td className="px-3 py-2">{serializeLoanStatus(loan.status)}</td>
                <td className="px-3 py-2 text-right">{loan.status !== "RETURNED" ? <AssetReturnButton loanId={loan.id} /> : null}</td>
              </tr>
            ))}
            {loans.length === 0 && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={7}>Belum ada peminjaman.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

