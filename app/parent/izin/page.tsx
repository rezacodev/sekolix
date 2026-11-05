import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireParentContext, serializeParentStudent } from "@/lib/parent/server";
import { LeaveRequestForm } from "../_components/ParentActionForms";

export default async function ParentLeaveRequestsPage() {
  const context = await requireParentContext();
  if (!context) redirect("/login");

  const childrenOptions = context.profile.students.map(serializeParentStudent);
  const requests = await db.parentLeaveRequest.findMany({
    where: { parent_id: context.profile.id },
    include: { student: { select: { fullName: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">Absensi</p>
        <h1 className="text-2xl font-bold">Pengajuan Izin</h1>
      </div>

      <LeaveRequestForm childrenOptions={childrenOptions} />

      <section className="rounded-lg border bg-white p-4">
        <h2 className="mb-3 text-base font-semibold">Riwayat pengajuan</h2>
        <div className="space-y-2">
          {requests.map((request) => (
            <div key={request.id} className="rounded-lg border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{request.student.fullName} - {request.type}</p>
                  <p className="text-xs text-slate-500">
                    {request.start_date.toLocaleDateString("id-ID")} - {request.end_date.toLocaleDateString("id-ID")}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium">{request.status}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{request.reason}</p>
              <Link href={`/parent/anak/${request.student_id}/absensi`} className="mt-2 inline-block text-xs font-medium text-emerald-700">
                Lihat absensi anak
              </Link>
            </div>
          ))}
          {requests.length === 0 && <p className="text-sm text-slate-500">Belum ada pengajuan izin.</p>}
        </div>
      </section>
    </div>
  );
}
