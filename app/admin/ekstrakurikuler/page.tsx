import Link from "next/link";
import { redirect } from "next/navigation";
import { Award, CalendarDays, ClipboardCheck, Megaphone, Trophy, UserPlus, Users } from "lucide-react";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";

export default async function ExtracurricularDashboardPage() {
  const access = await requirePermission("read", "ekstrakurikuler");
  if (!access) redirect("/unauthorized");
  const [clubs, members, schedules, registrations, achievements, published] = await Promise.all([
    db.extracurricular.count({ where: { is_active: true } }),
    db.extracurricularMember.count({ where: { status: "ACTIVE" } }),
    db.extracurricularSchedule.count({ where: { status: "SCHEDULED" } }),
    db.extracurricularRegistration.count({ where: { status: "PENDING" } }),
    db.extracurricularAchievement.count(),
    db.extracurricularSchedule.count({ where: { is_published: true } }),
  ]);
  return (
    <div className="space-y-6">
      <div><p className="text-sm text-muted-foreground">Operasional</p><h1 className="text-2xl font-bold">Ekstrakurikuler & Kegiatan</h1></div>
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Metric icon={Trophy} label="Ekskul Aktif" value={clubs} />
        <Metric icon={Users} label="Anggota" value={members} />
        <Metric icon={CalendarDays} label="Jadwal Aktif" value={schedules} />
        <Metric icon={UserPlus} label="Pendaftaran" value={registrations} />
        <Metric icon={Award} label="Prestasi" value={achievements} />
        <Metric icon={Megaphone} label="Terpublikasi" value={published} />
      </div>
      <section className="grid gap-4 md:grid-cols-4">
        <QuickLink href="/admin/ekstrakurikuler/master" title="Master Ekskul" description="Kelola data ekstrakurikuler." icon={Trophy} />
        <QuickLink href="/admin/ekstrakurikuler/anggota" title="Pembina & Anggota" description="Pembina, anggota, dan pendaftaran." icon={Users} />
        <QuickLink href="/admin/ekstrakurikuler/kegiatan" title="Kegiatan" description="Jadwal latihan dan publikasi." icon={CalendarDays} />
        <QuickLink href="/admin/ekstrakurikuler/presensi" title="Presensi" description="Presensi latihan/kegiatan." icon={ClipboardCheck} />
        <QuickLink href="/admin/ekstrakurikuler/prestasi" title="Prestasi" description="Lomba dan portofolio siswa." icon={Award} />
        <QuickLink href="/admin/ekstrakurikuler/laporan" title="Laporan" description="Ringkasan aktivitas ekskul." icon={Megaphone} />
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: number }) {
  return <div className="rounded-lg border bg-white p-4"><Icon className="mb-3 h-5 w-5 text-rose-700" /><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></div>;
}

function QuickLink({ href, title, description, icon: Icon }: { href: string; title: string; description: string; icon: typeof Trophy }) {
  return <Link href={href} className="rounded-lg border bg-white p-4 transition hover:border-rose-300 hover:bg-rose-50/50"><Icon className="mb-4 h-5 w-5 text-rose-700" /><h2 className="font-semibold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></Link>;
}

