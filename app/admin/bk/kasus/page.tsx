import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { serializeCaseStatus, serializeVisibility } from "@/lib/bk/server";
import { CounselingCaseForm, CounselingSessionForm } from "../_components/BkForms";

export default async function BkCasesPage() {
  const access = await requirePermission("read", "bk");
  if (!access) redirect("/unauthorized");

  const [students, staff, cases] = await Promise.all([
    db.pesertaDidik.findMany({ where: { deleted_at: null }, select: { id: true, fullName: true, nisn: true }, orderBy: { fullName: "asc" }, take: 300 }),
    db.staff.findMany({ where: { deleted_at: null, isActive: true }, select: { id: true, name: true, position: true }, orderBy: { name: "asc" }, take: 100 }),
    db.studentCounselingCase.findMany({
      include: {
        student: { select: { fullName: true, nisn: true } },
        counselor: { select: { name: true } },
        sessions: { orderBy: { session_date: "desc" }, take: 2 },
      },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      take: 100,
    }),
  ]);

  const caseOptions = cases.map((item) => ({
    id: item.id,
    label: `${item.student.fullName} - ${item.title}`,
  }));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">BK</p>
        <h1 className="text-2xl font-bold">Kasus dan Tindak Lanjut</h1>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Buat Kasus BK</h2>
        <CounselingCaseForm
          students={students.map((item) => ({ id: item.id, label: `${item.fullName} ${item.nisn ? `(${item.nisn})` : ""}` }))}
          staff={staff.map((item) => ({ id: item.id, label: `${item.name}${item.position ? ` - ${item.position}` : ""}` }))}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Tambah Sesi Konseling</h2>
        <CounselingSessionForm cases={caseOptions} />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Daftar Kasus</h2>
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Siswa</th>
                <th className="px-3 py-2">Kasus</th>
                <th className="px-3 py-2">Konselor</th>
                <th className="px-3 py-2">Prioritas</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Visibilitas</th>
                <th className="px-3 py-2">Sesi</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((item) => (
                <tr key={item.id} className="border-t align-top">
                  <td className="px-3 py-2">
                    <div className="font-medium">{item.student.fullName}</div>
                    <div className="text-xs text-slate-500">{item.student.nisn ?? "-"}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-slate-500">{item.category}</div>
                  </td>
                  <td className="px-3 py-2">{item.counselor?.name ?? "-"}</td>
                  <td className="px-3 py-2">{item.priority}</td>
                  <td className="px-3 py-2">{serializeCaseStatus(item.status)}</td>
                  <td className="px-3 py-2">{serializeVisibility(item.visibility)}</td>
                  <td className="px-3 py-2">{item.sessions.length}</td>
                </tr>
              ))}
              {cases.length === 0 && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={7}>Belum ada kasus BK.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
