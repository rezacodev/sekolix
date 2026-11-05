import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { PublishScheduleButton, ScheduleForm } from "../_components/ExtracurricularForms";

export default async function ExtracurricularSchedulePage() {
  const access = await requirePermission("read", "ekstrakurikuler");
  if (!access) redirect("/unauthorized");
  const [clubs, schedules] = await Promise.all([
    db.extracurricular.findMany({ where: { is_active: true }, orderBy: { name: "asc" } }),
    db.extracurricularSchedule.findMany({ include: { extracurricular: true, attendances: true }, orderBy: { start_at: "desc" }, take: 300 }),
  ]);
  return <div className="space-y-6"><div><p className="text-sm text-muted-foreground">Ekstrakurikuler</p><h1 className="text-2xl font-bold">Jadwal Latihan dan Kegiatan</h1></div><ScheduleForm clubs={clubs.map((item) => ({ id: item.id, label: item.name }))} /><div className="overflow-hidden rounded-lg border bg-white"><table className="w-full text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-3 py-2">Waktu</th><th className="px-3 py-2">Ekskul</th><th className="px-3 py-2">Kegiatan</th><th className="px-3 py-2">Lokasi</th><th className="px-3 py-2">Presensi</th><th className="px-3 py-2">Publikasi</th><th className="px-3 py-2"></th></tr></thead><tbody>{schedules.map((item) => <tr key={item.id} className="border-t"><td className="px-3 py-2">{item.start_at.toLocaleString("id-ID")}</td><td className="px-3 py-2">{item.extracurricular.name}</td><td className="px-3 py-2 font-medium">{item.title}</td><td className="px-3 py-2">{item.location ?? "-"}</td><td className="px-3 py-2">{item.attendances.length}</td><td className="px-3 py-2">{item.is_published ? "Terpublikasi" : "Belum"}</td><td className="px-3 py-2">{!item.is_published ? <PublishScheduleButton scheduleId={item.id} /> : null}</td></tr>)}{schedules.length === 0 && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={7}>Belum ada jadwal.</td></tr>}</tbody></table></div></div>;
}

