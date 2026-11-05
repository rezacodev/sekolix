import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { requireParentStudent } from "@/lib/parent/server";

type Props = { params: Promise<{ studentId: string }> };

export default async function ParentChildAttendancePage({ params }: Props) {
  const { studentId } = await params;
  const access = await requireParentStudent(studentId);
  if (!access.ok) redirect("/parent");

  const [records, leaveRequests] = await Promise.all([
    db.attendance.findMany({
      where: { student_id: studentId, deleted_at: null },
      include: { teacherSubject: { include: { subject: true } } },
      orderBy: [{ date: "desc" }, { meeting_number: "desc" }],
      take: 100,
    }),
    db.parentLeaveRequest.findMany({
      where: { parent_id: access.context.profile.id, student_id: studentId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const summary = records.reduce<Record<string, number>>((acc, record) => {
    acc[record.status] = (acc[record.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <Link href={`/parent/anak/${studentId}`} className="inline-flex items-center gap-2 text-sm text-slate-600">
        <ArrowLeft className="h-4 w-4" />
        Kembali ke detail anak
      </Link>
      <div>
        <p className="text-sm text-slate-500">Absensi</p>
        <h1 className="text-2xl font-bold">{access.student.fullName}</h1>
      </div>

      <section className="grid gap-3 md:grid-cols-4">
        {["HADIR", "SAKIT", "IZIN", "ALPHA"].map((status) => (
          <div key={status} className="rounded-lg border bg-white p-4">
            <p className="text-sm text-slate-500">{status}</p>
            <p className="text-2xl font-bold">{summary[status] ?? 0}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Pengajuan izin</h2>
          <Link href="/parent/izin" className="text-sm font-medium text-emerald-700">
            Buat pengajuan
          </Link>
        </div>
        <div className="space-y-2">
          {leaveRequests.map((item) => (
            <div key={item.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">{item.type}</p>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium">{item.status}</span>
              </div>
              <p className="text-xs text-slate-500">
                {item.start_date.toLocaleDateString("id-ID")} - {item.end_date.toLocaleDateString("id-ID")}
              </p>
              <p className="mt-1 text-sm text-slate-600">{item.reason}</p>
            </div>
          ))}
          {leaveRequests.length === 0 && <p className="text-sm text-slate-500">Belum ada pengajuan izin.</p>}
        </div>
      </section>

      <section className="rounded-lg border bg-white p-4">
        <h2 className="mb-3 text-base font-semibold">Riwayat kehadiran</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="py-2">Tanggal</th>
                <th className="py-2">Mapel</th>
                <th className="py-2">Status</th>
                <th className="py-2">Catatan</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={String(record.id)} className="border-b last:border-0">
                  <td className="py-2">{record.date.toLocaleDateString("id-ID")}</td>
                  <td className="py-2">{record.teacherSubject.subject.name}</td>
                  <td className="py-2 font-medium">{record.status}</td>
                  <td className="py-2 text-slate-500">{record.notes ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {records.length === 0 && <p className="py-6 text-sm text-slate-500">Belum ada data absensi.</p>}
        </div>
      </section>
    </div>
  );
}
