import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";

export default async function ExtracurricularReportPage() {
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
  return <div className="space-y-6"><div><p className="text-sm text-muted-foreground">Ekstrakurikuler</p><h1 className="text-2xl font-bold">Laporan Ekskul</h1></div><div className="grid gap-4 md:grid-cols-3"><Metric label="Ekskul Aktif" value={clubs} /><Metric label="Anggota Aktif" value={members} /><Metric label="Jadwal Aktif" value={schedules} /><Metric label="Pendaftaran Pending" value={registrations} /><Metric label="Prestasi" value={achievements} /><Metric label="Publikasi Landing" value={published} /></div></div>;
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-lg border bg-white p-4"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></div>;
}

