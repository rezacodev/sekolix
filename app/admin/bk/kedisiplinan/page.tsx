import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { DisciplineRecordForm, DisciplineRuleForm } from "../_components/BkForms";

export default async function BkDisciplinePage() {
  const access = await requirePermission("read", "bk");
  if (!access) redirect("/unauthorized");

  const [students, rules, cases, records] = await Promise.all([
    db.pesertaDidik.findMany({ where: { deleted_at: null }, select: { id: true, fullName: true, nisn: true }, orderBy: { fullName: "asc" }, take: 300 }),
    db.disciplineRule.findMany({ orderBy: [{ is_active: "desc" }, { points: "desc" }] }),
    db.studentCounselingCase.findMany({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } }, include: { student: { select: { fullName: true } } }, orderBy: { updatedAt: "desc" }, take: 100 }),
    db.disciplineRecord.findMany({
      include: {
        student: { select: { fullName: true, nisn: true } },
        rule: true,
        recorder: { select: { name: true } },
      },
      orderBy: { incident_date: "desc" },
      take: 100,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">BK</p>
        <h1 className="text-2xl font-bold">Kedisiplinan</h1>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Master Pelanggaran</h2>
        <DisciplineRuleForm />
        <div className="grid gap-3 md:grid-cols-3">
          {rules.map((rule) => (
            <div key={rule.id} className="rounded-lg border bg-white p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{rule.title}</p>
                  <p className="text-xs text-slate-500">{rule.code} - {rule.category}</p>
                </div>
                <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">{rule.points} poin</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">{rule.severity}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Catat Pelanggaran</h2>
        <DisciplineRecordForm
          students={students.map((item) => ({ id: item.id, label: `${item.fullName} ${item.nisn ? `(${item.nisn})` : ""}` }))}
          rules={rules.filter((item) => item.is_active).map((item) => ({ id: item.id, label: `${item.code} - ${item.title} (${item.points})` }))}
          cases={cases.map((item) => ({ id: item.id, label: `${item.student.fullName} - ${item.title}` }))}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Riwayat Pelanggaran</h2>
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Tanggal</th>
                <th className="px-3 py-2">Siswa</th>
                <th className="px-3 py-2">Pelanggaran</th>
                <th className="px-3 py-2 text-right">Poin</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Petugas</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-t">
                  <td className="px-3 py-2">{record.incident_date.toLocaleDateString("id-ID")}</td>
                  <td className="px-3 py-2">{record.student.fullName}</td>
                  <td className="px-3 py-2">{record.rule?.title ?? record.description}</td>
                  <td className="px-3 py-2 text-right">{record.points}</td>
                  <td className="px-3 py-2">{record.status}</td>
                  <td className="px-3 py-2">{record.recorder?.name ?? "-"}</td>
                </tr>
              ))}
              {records.length === 0 && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={6}>Belum ada catatan pelanggaran.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
