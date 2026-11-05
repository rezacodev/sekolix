import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { AchievementForm } from "../_components/ExtracurricularForms";

export default async function ExtracurricularAchievementPage() {
  const access = await requirePermission("read", "ekstrakurikuler");
  if (!access) redirect("/unauthorized");
  const [clubs, students, achievements] = await Promise.all([
    db.extracurricular.findMany({ where: { is_active: true }, orderBy: { name: "asc" } }),
    db.pesertaDidik.findMany({ where: { deleted_at: null }, orderBy: { fullName: "asc" }, take: 500 }),
    db.extracurricularAchievement.findMany({ include: { extracurricular: true, student: true, verifier: { select: { name: true } } }, orderBy: { achieved_at: "desc" }, take: 300 }),
  ]);
  return <div className="space-y-6"><div><p className="text-sm text-muted-foreground">Ekstrakurikuler</p><h1 className="text-2xl font-bold">Prestasi dan Portofolio Non-Akademik</h1></div><AchievementForm clubs={clubs.map((item) => ({ id: item.id, label: item.name }))} students={students.map((item) => ({ id: item.id, label: item.fullName }))} /><div className="grid gap-3 md:grid-cols-3">{achievements.map((item) => <div key={item.id} className="rounded-lg border bg-white p-4"><p className="text-xs text-slate-500">{item.extracurricular.name} - {item.level ?? "-"}</p><p className="font-semibold">{item.title}</p><p className="text-sm">{item.student?.fullName ?? "Tim"}</p><p className="text-xs text-slate-500">{item.rank ?? "-"} - {item.achieved_at?.toLocaleDateString("id-ID") ?? "-"}</p></div>)}</div></div>;
}

