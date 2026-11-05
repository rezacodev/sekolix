import { redirect } from "next/navigation";
import { AlertTriangle, Award, ClipboardList, Send, Users } from "lucide-react";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";

export default async function BkReportsPage() {
  const access = await requirePermission("read", "bk");
  if (!access) redirect("/unauthorized");

  const [cases, records, achievements, referrals, letters] = await Promise.all([
    db.studentCounselingCase.findMany({ select: { status: true, priority: true, category: true } }),
    db.disciplineRecord.findMany({
      include: { student: { select: { id: true, fullName: true, nisn: true } } },
      orderBy: { incident_date: "desc" },
      take: 500,
    }),
    db.studentAchievement.findMany({
      include: { student: { select: { fullName: true } } },
      orderBy: { achievement_date: "desc" },
      take: 25,
    }),
    db.counselingReferral.count({ where: { status: "PENDING" } }),
    db.parentSummonLetter.count({ where: { status: "SENT" } }),
  ]);

  const disciplineByStudent = new Map<string, { fullName: string; nisn: string | null; points: number; records: number }>();
  for (const record of records) {
    const current = disciplineByStudent.get(record.student_id) ?? {
      fullName: record.student.fullName,
      nisn: record.student.nisn,
      points: 0,
      records: 0,
    };
    current.points += record.points;
    current.records += 1;
    disciplineByStudent.set(record.student_id, current);
  }
  const attention = Array.from(disciplineByStudent.values()).sort((a, b) => b.points - a.points).slice(0, 20);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">BK</p>
        <h1 className="text-2xl font-bold">Laporan Perkembangan Siswa</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Metric icon={ClipboardList} label="Kasus aktif" value={cases.filter((item) => ["OPEN", "IN_PROGRESS"].includes(item.status)).length} />
        <Metric icon={AlertTriangle} label="Pelanggaran" value={records.length} />
        <Metric icon={Award} label="Prestasi" value={achievements.length} />
        <Metric icon={Send} label="Rujukan pending" value={referrals} />
        <Metric icon={Users} label="Panggilan aktif" value={letters} />
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg border bg-white">
          <div className="border-b px-4 py-3 font-semibold">Siswa Perlu Perhatian</div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Siswa</th>
                <th className="px-3 py-2 text-right">Poin</th>
                <th className="px-3 py-2 text-right">Catatan</th>
              </tr>
            </thead>
            <tbody>
              {attention.map((item) => (
                <tr key={item.fullName} className="border-t">
                  <td className="px-3 py-2">
                    <div className="font-medium">{item.fullName}</div>
                    <div className="text-xs text-slate-500">{item.nisn ?? "-"}</div>
                  </td>
                  <td className="px-3 py-2 text-right">{item.points}</td>
                  <td className="px-3 py-2 text-right">{item.records}</td>
                </tr>
              ))}
              {attention.length === 0 && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={3}>Belum ada siswa dengan poin disiplin.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="overflow-hidden rounded-lg border bg-white">
          <div className="border-b px-4 py-3 font-semibold">Prestasi Terbaru</div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Tanggal</th>
                <th className="px-3 py-2">Siswa</th>
                <th className="px-3 py-2">Prestasi</th>
              </tr>
            </thead>
            <tbody>
              {achievements.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-3 py-2">{item.achievement_date.toLocaleDateString("id-ID")}</td>
                  <td className="px-3 py-2">{item.student.fullName}</td>
                  <td className="px-3 py-2">{item.title}</td>
                </tr>
              ))}
              {achievements.length === 0 && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={3}>Belum ada prestasi.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof ClipboardList; label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <Icon className="mb-3 h-5 w-5 text-emerald-700" />
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
