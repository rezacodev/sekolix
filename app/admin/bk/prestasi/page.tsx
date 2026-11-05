import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { AchievementForm } from "../_components/BkForms";

export default async function BkAchievementsPage() {
  const access = await requirePermission("read", "bk");
  if (!access) redirect("/unauthorized");

  const [students, achievements] = await Promise.all([
    db.pesertaDidik.findMany({ where: { deleted_at: null }, select: { id: true, fullName: true, nisn: true }, orderBy: { fullName: "asc" }, take: 300 }),
    db.studentAchievement.findMany({
      include: {
        student: { select: { fullName: true, nisn: true } },
        verifier: { select: { name: true } },
      },
      orderBy: { achievement_date: "desc" },
      take: 150,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">BK</p>
        <h1 className="text-2xl font-bold">Prestasi Siswa</h1>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Tambah Prestasi</h2>
        <AchievementForm students={students.map((item) => ({ id: item.id, label: `${item.fullName} ${item.nisn ? `(${item.nisn})` : ""}` }))} />
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {achievements.map((item) => (
          <article key={item.id} className="rounded-lg border bg-white p-4">
            <p className="text-xs font-medium uppercase text-emerald-700">{item.category} - {item.level}</p>
            <h2 className="mt-1 font-semibold">{item.title}</h2>
            <p className="text-sm text-slate-500">{item.student.fullName}</p>
            <p className="mt-2 text-xs text-slate-500">{item.achievement_date.toLocaleDateString("id-ID")} {item.organizer ? `- ${item.organizer}` : ""}</p>
            {item.certificate_url && <Link href={item.certificate_url} target="_blank" className="mt-2 inline-block text-xs text-emerald-700 underline">Sertifikat</Link>}
          </article>
        ))}
        {achievements.length === 0 && <div className="rounded-lg border bg-white p-6 text-center text-sm text-slate-500 md:col-span-3">Belum ada prestasi tercatat.</div>}
      </section>
    </div>
  );
}
