import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { serializeLeaveStatus } from "@/lib/staff-ops/server";
import { LeaveRequestForm, ReviewLeaveButton } from "../_components/StaffOpsForms";

export default async function StaffLeavePage() {
  const access = await requirePermission("read", "pegawai");
  if (!access) redirect("/unauthorized");

  const [staff, requests] = await Promise.all([
    db.staff.findMany({ where: { deleted_at: null, isActive: true }, orderBy: { name: "asc" }, take: 300 }),
    db.staffLeaveRequest.findMany({ include: { staff: true, reviewer: { select: { name: true } } }, orderBy: [{ status: "asc" }, { start_date: "desc" }], take: 200 }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Manajemen Pegawai</p>
        <h1 className="text-2xl font-bold">Cuti dan Izin</h1>
      </div>

      <LeaveRequestForm staff={staff.map((item) => ({ id: item.id, label: `${item.name}${item.nip ? ` - ${item.nip}` : ""}` }))} />

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr><th className="px-3 py-2">Pegawai</th><th className="px-3 py-2">Jenis</th><th className="px-3 py-2">Tanggal</th><th className="px-3 py-2">Hari</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Reviewer</th><th className="px-3 py-2"></th></tr>
          </thead>
          <tbody>
            {requests.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-3 py-2 font-medium">{item.staff.name}</td>
                <td className="px-3 py-2">{item.type}</td>
                <td className="px-3 py-2">{item.start_date.toLocaleDateString("id-ID")} - {item.end_date.toLocaleDateString("id-ID")}</td>
                <td className="px-3 py-2">{item.total_days}</td>
                <td className="px-3 py-2">{serializeLeaveStatus(item.status)}</td>
                <td className="px-3 py-2">{item.reviewer?.name ?? "-"}</td>
                <td className="px-3 py-2">
                  {item.status === "PENDING" ? <div className="flex gap-2"><ReviewLeaveButton leaveId={item.id} status="APPROVED" /><ReviewLeaveButton leaveId={item.id} status="REJECTED" /></div> : null}
                </td>
              </tr>
            ))}
            {requests.length === 0 && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={7}>Belum ada pengajuan.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

