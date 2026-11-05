import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { serializeContractStatus } from "@/lib/staff-ops/server";
import { StaffContractForm } from "../_components/StaffOpsForms";

export default async function StaffContractPage() {
  const access = await requirePermission("read", "pegawai");
  if (!access) redirect("/unauthorized");

  const [staff, contracts] = await Promise.all([
    db.staff.findMany({ where: { deleted_at: null, isActive: true }, orderBy: { name: "asc" }, take: 300 }),
    db.staffContract.findMany({ include: { staff: true, creator: { select: { name: true } } }, orderBy: [{ end_date: "asc" }, { createdAt: "desc" }], take: 200 }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Manajemen Pegawai</p>
        <h1 className="text-2xl font-bold">Kontrak dan Sertifikasi</h1>
      </div>

      <StaffContractForm staff={staff.map((item) => ({ id: item.id, label: item.name }))} />

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr><th className="px-3 py-2">Pegawai</th><th className="px-3 py-2">Kontrak</th><th className="px-3 py-2">Mulai</th><th className="px-3 py-2">Selesai</th><th className="px-3 py-2">Reminder</th><th className="px-3 py-2">Status</th></tr>
          </thead>
          <tbody>
            {contracts.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-3 py-2 font-medium">{item.staff.name}</td>
                <td className="px-3 py-2">{item.title}<p className="text-xs text-slate-500">{item.contract_number ?? "-"}</p></td>
                <td className="px-3 py-2">{item.start_date.toLocaleDateString("id-ID")}</td>
                <td className="px-3 py-2">{item.end_date?.toLocaleDateString("id-ID") ?? "-"}</td>
                <td className="px-3 py-2">{item.reminder_date?.toLocaleDateString("id-ID") ?? "-"}</td>
                <td className="px-3 py-2">{serializeContractStatus(item.status)}</td>
              </tr>
            ))}
            {contracts.length === 0 && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={6}>Belum ada kontrak.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

