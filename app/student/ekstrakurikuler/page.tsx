import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Award, CalendarDays, Trophy, Users } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStudentForUser, serializeRegistrationStatus } from "@/lib/extracurricular/server";
import { StudentRegisterButton } from "@/app/admin/ekstrakurikuler/_components/ExtracurricularForms";

export default async function StudentExtracurricularPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "MURID") redirect("/login");
  const student = await getStudentForUser(session.user.email);
  if (!student) redirect("/student");
  const [clubs, registrations, memberships, achievements, schedules] = await Promise.all([
    db.extracurricular.findMany({ where: { is_active: true }, include: { coaches: { include: { staff: { select: { name: true } } } }, _count: { select: { members: true } } }, orderBy: { name: "asc" } }),
    db.extracurricularRegistration.findMany({ where: { student_id: student.id }, include: { extracurricular: true }, orderBy: { createdAt: "desc" } }),
    db.extracurricularMember.findMany({ where: { student_id: student.id }, include: { extracurricular: true }, orderBy: { joined_at: "desc" } }),
    db.extracurricularAchievement.findMany({ where: { student_id: student.id, portfolio_visible: true }, include: { extracurricular: true }, orderBy: { achieved_at: "desc" } }),
    db.extracurricularSchedule.findMany({ where: { status: "SCHEDULED", start_at: { gte: new Date() } }, include: { extracurricular: true }, orderBy: { start_at: "asc" }, take: 10 }),
  ]);
  const registeredIds = new Set([...registrations.map((item) => item.extracurricular_id), ...memberships.map((item) => item.extracurricular_id)]);
  return (
    <div className="space-y-6">
      <div><p className="text-sm text-slate-500">Portal Siswa</p><h1 className="text-2xl font-bold">Ekstrakurikuler</h1></div>
      <div className="grid gap-4 md:grid-cols-4"><Metric icon={Trophy} label="Ekskul tersedia" value={clubs.length} /><Metric icon={Users} label="Keanggotaan" value={memberships.length} /><Metric icon={CalendarDays} label="Agenda dekat" value={schedules.length} /><Metric icon={Award} label="Portofolio" value={achievements.length} /></div>
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-4"><h2 className="font-semibold">Daftar Ekskul</h2><div className="mt-3 space-y-3">{clubs.map((club) => <div key={club.id} className="rounded-lg border p-3"><div className="flex items-start justify-between gap-3"><div><p className="font-medium">{club.name}</p><p className="text-xs text-slate-500">{club.category ?? "-"} - {club._count.members} anggota</p><p className="mt-1 text-sm text-slate-600">{club.description ?? "Tanpa deskripsi"}</p></div>{registeredIds.has(club.id) ? <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold">Terdaftar</span> : <StudentRegisterButton extracurricularId={club.id} />}</div></div>)}</div></div>
        <div className="space-y-4">
          <div className="rounded-lg border bg-white p-4"><h2 className="font-semibold">Status Pendaftaran</h2><div className="mt-3 space-y-2">{registrations.map((item) => <div key={item.id} className="rounded-md border p-3"><p className="font-medium">{item.extracurricular.name}</p><p className="text-xs text-slate-500">{serializeRegistrationStatus(item.status)}</p></div>)}{registrations.length === 0 && <p className="text-sm text-slate-500">Belum ada pendaftaran.</p>}</div></div>
          <div className="rounded-lg border bg-white p-4"><h2 className="font-semibold">Portofolio Non-Akademik</h2><div className="mt-3 space-y-2">{achievements.map((item) => <div key={item.id} className="rounded-md border p-3"><p className="font-medium">{item.title}</p><p className="text-xs text-slate-500">{item.extracurricular.name} - {item.rank ?? "-"} - {item.achieved_at?.toLocaleDateString("id-ID") ?? "-"}</p></div>)}{achievements.length === 0 && <p className="text-sm text-slate-500">Belum ada portofolio.</p>}</div></div>
        </div>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: number }) {
  return <div className="rounded-lg border bg-white p-4"><Icon className="mb-3 h-5 w-5 text-rose-700" /><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></div>;
}

