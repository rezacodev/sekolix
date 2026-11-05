import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { DutyScheduleForm } from "../_components/StaffOpsForms";

export default async function StaffDutyPage() {
  const access = await requirePermission("read", "pegawai");
  if (!access) redirect("/unauthorized");

  const [staff, schedules] = await Promise.all([
    db.staff.findMany({ where: { deleted_at: null, isActive: true }, orderBy: { name: "asc" }, take: 300 }),
    db.staffDutySchedule.findMany({ include: { staff: true, creator: { select: { name: true } } }, orderBy: [{ duty_date: "desc" }, { createdAt: "desc" }], take: 200 }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Manajemen Pegawai</p>
        <h1 className="text-2xl font-bold">Jadwal Piket</h1>
      </div>

      <DutyScheduleForm staff={staff.map((item) => ({ id: item.id, label: item.name }))} />

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr><th className="px-3 py-2">Tanggal</th><th className="px-3 py-2">Pegawai</th><th className="px-3 py-2">Shift</th><th className="px-3 py-2">Lokasi</th><th className="px-3 py-2">Tugas</th><th className="px-3 py-2">Status</th></tr>
          </thead>
          <tbody>
            {schedules.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-3 py-2">{item.duty_date.toLocaleDateString("id-ID")}</td>
                <td className="px-3 py-2 font-medium">{item.staff.name}</td>
                <td className="px-3 py-2">{item.shift ?? "-"}</td>
                <td className="px-3 py-2">{item.location ?? "-"}</td>
                <td className="px-3 py-2">{item.task}</td>
                <td className="px-3 py-2">{item.status}</td>
              </tr>
            ))}
            {schedules.length === 0 && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={6}>Belum ada jadwal piket.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

