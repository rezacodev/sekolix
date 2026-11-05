import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgeCheck, CalendarCheck, ClipboardList, FileText, ReceiptText, UserCheck, UsersRound } from "lucide-react";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";

export default async function StaffOpsDashboardPage() {
  const access = await requirePermission("read", "pegawai");
  if (!access) redirect("/unauthorized");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const reminderLimit = new Date();
  reminderLimit.setDate(reminderLimit.getDate() + 60);

  const [staffCount, todayAttendance, pendingLeaves, dutyToday, documents, expiringContracts] = await Promise.all([
    db.staff.count({ where: { deleted_at: null, isActive: true } }),
    db.staffAttendance.count({ where: { date: today } }),
    db.staffLeaveRequest.count({ where: { status: "PENDING" } }),
    db.staffDutySchedule.count({ where: { duty_date: today, status: "SCHEDULED" } }),
    db.staffDocument.count(),
    db.staffContract.count({ where: { status: { in: ["ACTIVE", "EXPIRING"] }, OR: [{ end_date: { lte: reminderLimit } }, { reminder_date: { lte: reminderLimit } }] } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Operasional</p>
        <h1 className="text-2xl font-bold">Manajemen Pegawai</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Metric icon={UsersRound} label="Pegawai Aktif" value={staffCount} />
        <Metric icon={UserCheck} label="Absensi Hari Ini" value={todayAttendance} />
        <Metric icon={CalendarCheck} label="Cuti Pending" value={pendingLeaves} />
        <Metric icon={ClipboardList} label="Piket Hari Ini" value={dutyToday} />
        <Metric icon={FileText} label="Dokumen" value={documents} />
        <Metric icon={BadgeCheck} label="Reminder Kontrak" value={expiringContracts} />
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <QuickLink href="/admin/pegawai/absensi" title="Absensi" description="Input manual dan import absensi pegawai." icon={UserCheck} />
        <QuickLink href="/admin/pegawai/cuti" title="Cuti/Izin" description="Pengajuan dan approval cuti pegawai." icon={CalendarCheck} />
        <QuickLink href="/admin/pegawai/piket" title="Piket" description="Jadwal piket dan tugas harian." icon={ClipboardList} />
        <QuickLink href="/admin/pegawai/dokumen" title="Dokumen" description="Dokumen kepegawaian dan masa berlaku." icon={FileText} />
        <QuickLink href="/admin/pegawai/kontrak" title="Kontrak" description="Masa kontrak dan sertifikasi." icon={BadgeCheck} />
        <QuickLink href="/admin/pegawai/surat-tugas" title="Surat Tugas" description="SK/surat tugas untuk integrasi TU." icon={UsersRound} />
        <QuickLink href="/admin/pegawai/laporan" title="Laporan" description="Rekap kehadiran dan reminder SDM." icon={ReceiptText} />
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof UsersRound; label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <Icon className="mb-3 h-5 w-5 text-cyan-700" />
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

function QuickLink({ href, title, description, icon: Icon }: { href: string; title: string; description: string; icon: typeof UsersRound }) {
  return (
    <Link href={href} className="rounded-lg border bg-white p-4 transition hover:border-cyan-300 hover:bg-cyan-50/50">
      <Icon className="mb-4 h-5 w-5 text-cyan-700" />
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}

