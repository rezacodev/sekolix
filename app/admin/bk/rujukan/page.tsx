import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { serializeReferralStatus } from "@/lib/bk/server";
import { ReferralForm, SummonLetterForm } from "../_components/BkForms";

export default async function BkReferralsPage() {
  const access = await requirePermission("read", "bk");
  if (!access) redirect("/unauthorized");

  const [students, staff, cases, parents, referrals, letters] = await Promise.all([
    db.pesertaDidik.findMany({ where: { deleted_at: null }, select: { id: true, fullName: true, nisn: true }, orderBy: { fullName: "asc" }, take: 300 }),
    db.staff.findMany({ where: { deleted_at: null, isActive: true }, select: { id: true, name: true, position: true }, orderBy: { name: "asc" }, take: 100 }),
    db.studentCounselingCase.findMany({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } }, include: { student: { select: { fullName: true } } }, orderBy: { updatedAt: "desc" }, take: 100 }),
    db.parentGuardian.findMany({ select: { id: true, name: true, phone: true }, orderBy: { name: "asc" }, take: 200 }),
    db.counselingReferral.findMany({
      include: {
        student: { select: { fullName: true, nisn: true } },
        assignee: { select: { name: true } },
        creator: { select: { name: true } },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 100,
    }),
    db.parentSummonLetter.findMany({
      include: {
        student: { select: { fullName: true } },
        parent: { select: { name: true } },
        counselingCase: { select: { title: true } },
      },
      orderBy: { scheduled_at: "desc" },
      take: 100,
    }),
  ]);

  const studentOptions = students.map((item) => ({ id: item.id, label: `${item.fullName} ${item.nisn ? `(${item.nisn})` : ""}` }));
  const staffOptions = staff.map((item) => ({ id: item.id, label: `${item.name}${item.position ? ` - ${item.position}` : ""}` }));
  const caseOptions = cases.map((item) => ({ id: item.id, label: `${item.student.fullName} - ${item.title}` }));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">BK</p>
        <h1 className="text-2xl font-bold">Rujukan dan Surat Panggilan</h1>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Buat Rujukan</h2>
        <ReferralForm students={studentOptions} staff={staffOptions} cases={caseOptions} />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Buat Surat Panggilan Orang Tua</h2>
        <SummonLetterForm
          cases={caseOptions}
          parents={parents.map((item) => ({ id: item.id, label: `${item.name}${item.phone ? ` - ${item.phone}` : ""}` }))}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg border bg-white">
          <div className="border-b px-4 py-3 font-semibold">Rujukan BK</div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Siswa</th>
                <th className="px-3 py-2">Sumber</th>
                <th className="px-3 py-2">Tujuan</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-3 py-2">{item.student.fullName}</td>
                  <td className="px-3 py-2">{item.source}</td>
                  <td className="px-3 py-2">{item.assignee?.name ?? "-"}</td>
                  <td className="px-3 py-2">{serializeReferralStatus(item.status)}</td>
                </tr>
              ))}
              {referrals.length === 0 && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={4}>Belum ada rujukan.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="overflow-hidden rounded-lg border bg-white">
          <div className="border-b px-4 py-3 font-semibold">Surat Panggilan</div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Nomor</th>
                <th className="px-3 py-2">Siswa</th>
                <th className="px-3 py-2">Jadwal</th>
                <th className="px-3 py-2">PDF</th>
              </tr>
            </thead>
            <tbody>
              {letters.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-3 py-2">{item.letter_number}</td>
                  <td className="px-3 py-2">{item.student.fullName}</td>
                  <td className="px-3 py-2">{item.scheduled_at.toLocaleDateString("id-ID")}</td>
                  <td className="px-3 py-2"><Link href={`/api/admin/bk/summon-letters/${item.id}/pdf`} className="text-emerald-700 underline">PDF</Link></td>
                </tr>
              ))}
              {letters.length === 0 && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={4}>Belum ada surat panggilan.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
