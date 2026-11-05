import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { serializeMemberStatus, serializeRegistrationStatus } from "@/lib/extracurricular/server";
import { CoachForm, MemberForm, ReviewRegistrationButton } from "../_components/ExtracurricularForms";

export default async function ExtracurricularMembersPage() {
  const access = await requirePermission("read", "ekstrakurikuler");
  if (!access) redirect("/unauthorized");
  const [clubs, staff, students, coaches, members, registrations] = await Promise.all([
    db.extracurricular.findMany({ where: { is_active: true }, orderBy: { name: "asc" } }),
    db.staff.findMany({ where: { deleted_at: null, isActive: true }, orderBy: { name: "asc" }, take: 300 }),
    db.pesertaDidik.findMany({ where: { deleted_at: null }, orderBy: { fullName: "asc" }, take: 500 }),
    db.extracurricularCoach.findMany({ include: { extracurricular: true, staff: true }, orderBy: { createdAt: "desc" }, take: 100 }),
    db.extracurricularMember.findMany({ include: { extracurricular: true, student: true }, orderBy: { updatedAt: "desc" }, take: 300 }),
    db.extracurricularRegistration.findMany({ include: { extracurricular: true, student: true, reviewer: { select: { name: true } } }, orderBy: [{ status: "asc" }, { createdAt: "desc" }], take: 200 }),
  ]);
  const clubOptions = clubs.map((item) => ({ id: item.id, label: item.name }));
  return (
    <div className="space-y-6">
      <div><p className="text-sm text-muted-foreground">Ekstrakurikuler</p><h1 className="text-2xl font-bold">Pembina, Anggota, dan Pendaftaran</h1></div>
      <section className="grid gap-4 lg:grid-cols-2"><CoachForm clubs={clubOptions} staff={staff.map((item) => ({ id: item.id, label: item.name }))} /><MemberForm clubs={clubOptions} students={students.map((item) => ({ id: item.id, label: item.fullName }))} /></section>
      <section className="space-y-3"><h2 className="font-semibold">Pendaftaran Portal Siswa</h2><div className="overflow-hidden rounded-lg border bg-white"><table className="w-full text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-3 py-2">Siswa</th><th className="px-3 py-2">Ekskul</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Reviewer</th><th className="px-3 py-2"></th></tr></thead><tbody>{registrations.map((item) => <tr key={item.id} className="border-t"><td className="px-3 py-2 font-medium">{item.student.fullName}</td><td className="px-3 py-2">{item.extracurricular.name}</td><td className="px-3 py-2">{serializeRegistrationStatus(item.status)}</td><td className="px-3 py-2">{item.reviewer?.name ?? "-"}</td><td className="px-3 py-2">{item.status === "PENDING" ? <div className="flex gap-2"><ReviewRegistrationButton registrationId={item.id} status="APPROVED" /><ReviewRegistrationButton registrationId={item.id} status="REJECTED" /></div> : null}</td></tr>)}{registrations.length === 0 && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={5}>Belum ada pendaftaran.</td></tr>}</tbody></table></div></section>
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-4"><h2 className="font-semibold">Pembina</h2><div className="mt-3 space-y-2">{coaches.map((item) => <div key={item.id} className="rounded-md border p-3"><p className="font-medium">{item.staff.name}</p><p className="text-xs text-slate-500">{item.extracurricular.name} - {item.role}</p></div>)}</div></div>
        <div className="rounded-lg border bg-white p-4"><h2 className="font-semibold">Anggota</h2><div className="mt-3 space-y-2">{members.slice(0, 20).map((item) => <div key={item.id} className="rounded-md border p-3"><p className="font-medium">{item.student.fullName}</p><p className="text-xs text-slate-500">{item.extracurricular.name} - {serializeMemberStatus(item.status)}</p></div>)}</div></div>
      </section>
    </div>
  );
}

