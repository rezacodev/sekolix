import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { serializeAttendanceStatus } from "@/lib/extracurricular/server";
import { AttendanceForm } from "../_components/ExtracurricularForms";

export default async function ExtracurricularAttendancePage() {
  const access = await requirePermission("read", "ekstrakurikuler");
  if (!access) redirect("/unauthorized");
  const [schedules, members, attendances] = await Promise.all([
    db.extracurricularSchedule.findMany({ include: { extracurricular: true }, orderBy: { start_at: "desc" }, take: 200 }),
    db.extracurricularMember.findMany({ where: { status: "ACTIVE" }, include: { extracurricular: true, student: true }, orderBy: { updatedAt: "desc" }, take: 500 }),
    db.extracurricularAttendance.findMany({ include: { schedule: { include: { extracurricular: true } }, student: true, recorder: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 300 }),
  ]);
  return <div className="space-y-6"><div><p className="text-sm text-muted-foreground">Ekstrakurikuler</p><h1 className="text-2xl font-bold">Presensi Ekskul</h1></div><AttendanceForm schedules={schedules.map((item) => ({ id: item.id, label: `${item.extracurricular.name} - ${item.title}` }))} members={members.map((item) => ({ id: item.id, studentId: item.student_id, label: `${item.student.fullName} - ${item.extracurricular.name}` }))} /><div className="overflow-hidden rounded-lg border bg-white"><table className="w-full text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-3 py-2">Kegiatan</th><th className="px-3 py-2">Siswa</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Petugas</th><th className="px-3 py-2">Catatan</th></tr></thead><tbody>{attendances.map((item) => <tr key={item.id} className="border-t"><td className="px-3 py-2">{item.schedule.extracurricular.name} - {item.schedule.title}</td><td className="px-3 py-2 font-medium">{item.student.fullName}</td><td className="px-3 py-2">{serializeAttendanceStatus(item.status)}</td><td className="px-3 py-2">{item.recorder?.name ?? "-"}</td><td className="px-3 py-2">{item.notes ?? "-"}</td></tr>)}{attendances.length === 0 && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={5}>Belum ada presensi.</td></tr>}</tbody></table></div></div>;
}

