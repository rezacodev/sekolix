import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { ClubForm } from "../_components/ExtracurricularForms";

export default async function ExtracurricularMasterPage() {
  const access = await requirePermission("read", "ekstrakurikuler");
  if (!access) redirect("/unauthorized");
  const clubs = await db.extracurricular.findMany({ include: { coaches: { include: { staff: true } }, _count: { select: { members: true, schedules: true } } }, orderBy: { name: "asc" } });
  return <div className="space-y-6"><div><p className="text-sm text-muted-foreground">Ekstrakurikuler</p><h1 className="text-2xl font-bold">Master Ekstrakurikuler</h1></div><ClubForm /><div className="grid gap-3 md:grid-cols-3">{clubs.map((club) => <div key={club.id} className="rounded-lg border bg-white p-4"><p className="font-mono text-xs text-slate-500">{club.code}</p><p className="font-semibold">{club.name}</p><p className="text-xs text-slate-500">{club.category ?? "-"} - {club._count.members} anggota - {club._count.schedules} jadwal</p><p className="mt-2 text-sm text-slate-600">{club.description ?? "Tanpa deskripsi"}</p></div>)}</div></div>;
}

