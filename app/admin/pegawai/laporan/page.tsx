import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { serializeAttendanceStatus } from "@/lib/staff-ops/server";

export default async function StaffReportPage() {
  const access = await requirePermission("read", "pegawai");
  if (!access) redirect("/unauthorized");

  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const reminderLimit = new Date();
  reminderLimit.setDate(reminderLimit.getDate() + 60);

  const [staffCount, attendances, pendingLeaves, expiringContracts, expiringDocuments] = await Promise.all([
    db.staff.count({ where: { deleted_at: null, isActive: true } }),
    db.staffAttendance.findMany({ where: { date: { gte: from, lte: now } }, include: { staff: true }, orderBy: [{ date: "desc" }, { staff: { name: "asc" } }], take: 500 }),
    db.staffLeaveRequest.count({ where: { status: "PENDING" } }),
    db.staffContract.findMany({ where: { status: { in: ["ACTIVE", "EXPIRING"] }, OR: [{ end_date: { lte: reminderLimit } }, { reminder_date: { lte: reminderLimit } }] }, include: { staff: true }, orderBy: { end_date: "asc" }, take: 50 }),
    db.staffDocument.findMany({ where: { expires_at: { lte: reminderLimit } }, include: { staff: true }, orderBy: { expires_at: "asc" }, take: 50 }),
  ]);

  const byStatus = attendances.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Manajemen Pegawai</p>
        <h1 className="text-2xl font-bold">Laporan SDM</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Metric label="Pegawai Aktif" value={staffCount} />
        <Metric label="Hadir Bulan Ini" value={byStatus.PRESENT ?? 0} />
        <Metric label="Terlambat" value={byStatus.LATE ?? 0} />
        <Metric label="Cuti Pending" value={pendingLeaves} />
        <Metric label="Reminder" value={expiringContracts.length + expiringDocuments.length} />
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Rekap Absensi Bulan Ini</h2>
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-3 py-2">Tanggal</th><th className="px-3 py-2">Pegawai</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Catatan</th></tr></thead>
            <tbody>
              {attendances.map((item) => <tr key={item.id} className="border-t"><td className="px-3 py-2">{item.date.toLocaleDateString("id-ID")}</td><td className="px-3 py-2 font-medium">{item.staff.name}</td><td className="px-3 py-2">{serializeAttendanceStatus(item.status)}</td><td className="px-3 py-2">{item.notes ?? "-"}</td></tr>)}
              {attendances.length === 0 && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={4}>Belum ada data absensi bulan ini.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <ReminderList title="Kontrak/Sertifikasi Akan Berakhir" items={expiringContracts.map((item) => ({ id: item.id, title: item.title, subtitle: `${item.staff.name} - ${item.end_date?.toLocaleDateString("id-ID") ?? item.reminder_date?.toLocaleDateString("id-ID") ?? "-"}` }))} />
        <ReminderList title="Dokumen Akan Kadaluarsa" items={expiringDocuments.map((item) => ({ id: item.id, title: item.title, subtitle: `${item.staff.name} - ${item.expires_at?.toLocaleDateString("id-ID") ?? "-"}` }))} />
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

function ReminderList({ title, items }: { title: string; items: Array<{ id: string; title: string; subtitle: string }> }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-3 space-y-2">
        {items.map((item) => <div key={item.id} className="rounded-md border p-3"><p className="font-medium">{item.title}</p><p className="text-xs text-slate-500">{item.subtitle}</p></div>)}
        {items.length === 0 && <p className="text-sm text-slate-500">Tidak ada reminder.</p>}
      </div>
    </div>
  );
}

