import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { serializeAttendanceStatus } from "@/lib/staff-ops/server";
import { AttendanceForm, AttendanceImportForm } from "../_components/StaffOpsForms";

export default async function StaffAttendancePage() {
  const access = await requirePermission("read", "pegawai");
  if (!access) redirect("/unauthorized");

  const [staff, attendances] = await Promise.all([
    db.staff.findMany({ where: { deleted_at: null, isActive: true }, orderBy: { name: "asc" }, take: 300 }),
    db.staffAttendance.findMany({ include: { staff: true, recorder: { select: { name: true } } }, orderBy: [{ date: "desc" }, { createdAt: "desc" }], take: 200 }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Manajemen Pegawai</p>
        <h1 className="text-2xl font-bold">Absensi Pegawai</h1>
      </div>

      <AttendanceForm staff={staff.map((item) => ({ id: item.id, label: `${item.name}${item.nip ? ` - ${item.nip}` : ""}` }))} />
      <AttendanceImportForm />

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr><th className="px-3 py-2">Tanggal</th><th className="px-3 py-2">Pegawai</th><th className="px-3 py-2">Masuk</th><th className="px-3 py-2">Pulang</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Sumber</th><th className="px-3 py-2">Petugas</th></tr>
          </thead>
          <tbody>
            {attendances.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-3 py-2">{item.date.toLocaleDateString("id-ID")}</td>
                <td className="px-3 py-2 font-medium">{item.staff.name}</td>
                <td className="px-3 py-2">{item.check_in?.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) ?? "-"}</td>
                <td className="px-3 py-2">{item.check_out?.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) ?? "-"}</td>
                <td className="px-3 py-2">{serializeAttendanceStatus(item.status)}</td>
                <td className="px-3 py-2">{item.source}</td>
                <td className="px-3 py-2">{item.recorder?.name ?? "-"}</td>
              </tr>
            ))}
            {attendances.length === 0 && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={7}>Belum ada absensi.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

