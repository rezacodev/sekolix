import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, CalendarCheck, ClipboardList, CreditCard, GraduationCap, MessageSquare, UserRound } from "lucide-react";
import { db } from "@/lib/db";
import { formatRupiah, getPaymentDueAmount } from "@/lib/finance/server";
import { requireParentContext, serializeParentStudent } from "@/lib/parent/server";

export default async function ParentDashboardPage() {
  const context = await requireParentContext();
  if (!context) redirect("/login");

  const children = context.profile.students.map(serializeParentStudent);
  const studentIds = children.map((child) => child.id);

  const [latestGrades, attendance, assignments, news, notifications, messages, invoices] = await Promise.all([
    db.grade.findMany({
      where: { student_id: { in: studentIds }, deleted_at: null },
      include: { student: { select: { fullName: true } }, assessment: { include: { subject: true } } },
      orderBy: { updated_at: "desc" },
      take: 6,
    }),
    db.attendance.groupBy({
      by: ["status"],
      where: { student_id: { in: studentIds }, deleted_at: null },
      _count: { _all: true },
    }),
    db.assignment.findMany({
      where: { deleted_at: null, rombel: { students: { some: { id: { in: studentIds } } } } },
      include: { subject: true },
      orderBy: { due_date: "asc" },
      take: 5,
    }),
    db.news.findMany({ where: { isPublished: true }, orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }], take: 4 }),
    db.parentNotification.findMany({ where: { parent_id: context.profile.id }, orderBy: { createdAt: "desc" }, take: 5 }),
    db.parentTeacherMessage.count({ where: { parent_id: context.profile.id, status: "OPEN" } }),
    db.studentInvoice.findMany({
      where: { student_id: { in: studentIds }, status: { in: ["UNPAID", "PARTIAL"] } },
      select: { total_amount: true, paid_amount: true },
    }),
  ]);

  const hadir = attendance.find((item) => item.status === "HADIR")?._count._all ?? 0;
  const totalAttendance = attendance.reduce((sum, item) => sum + item._count._all, 0);
  const attendanceRate = totalAttendance > 0 ? Math.round((hadir / totalAttendance) * 100) : 0;
  const outstanding = invoices.reduce((sum, invoice) => sum + getPaymentDueAmount(invoice), 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">Selamat datang,</p>
        <h1 className="text-2xl font-bold">{context.profile.name}</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Metric icon={UserRound} label="Anak terhubung" value={children.length} />
        <Metric icon={CalendarCheck} label="Kehadiran" value={`${attendanceRate}%`} />
        <Metric icon={ClipboardList} label="Tugas terdekat" value={assignments.length} />
        <Metric icon={MessageSquare} label="Pesan terbuka" value={messages} />
        <Metric icon={CreditCard} label="Sisa tagihan" value={formatRupiah(outstanding)} />
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 text-base font-semibold">Anak</h2>
          <div className="space-y-3">
            {children.map((child) => (
              <Link key={child.id} href={`/parent/anak/${child.id}`} className="block rounded-lg border p-3 hover:bg-slate-50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{child.name}</p>
                    <p className="text-sm text-slate-500">{child.rombel ? `${child.rombel.className} - ${child.rombel.name}` : "Belum punya rombel"}</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                    {child.relationship}
                  </span>
                </div>
              </Link>
            ))}
            {children.length === 0 && <p className="text-sm text-slate-500">Belum ada siswa yang terhubung.</p>}
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
            <GraduationCap className="h-4 w-4" />
            Nilai terbaru
          </h2>
          <div className="space-y-3">
            {latestGrades.map((grade) => (
              <div key={String(grade.id)} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{grade.assessment.title}</p>
                  <p className="text-xs text-slate-500">{grade.student.fullName} - {grade.assessment.subject.name}</p>
                </div>
                <p className="text-lg font-bold text-emerald-700">{Number(grade.score)}</p>
              </div>
            ))}
            {latestGrades.length === 0 && <p className="text-sm text-slate-500">Belum ada nilai terbaru.</p>}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 text-base font-semibold">Tugas terdekat</h2>
          <div className="space-y-2">
            {assignments.map((assignment) => (
              <div key={String(assignment.id)} className="rounded-lg border p-3">
                <p className="font-medium">{assignment.title}</p>
                <p className="text-xs text-slate-500">{assignment.subject?.name ?? "-"} - {assignment.due_date.toLocaleDateString("id-ID")}</p>
              </div>
            ))}
            {assignments.length === 0 && <p className="text-sm text-slate-500">Tidak ada tugas aktif.</p>}
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
            <Bell className="h-4 w-4" />
            Pengumuman & notifikasi
          </h2>
          <div className="space-y-2">
            {notifications.map((item) => (
              <div key={item.id} className="rounded-lg border p-3">
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-slate-500">{item.message}</p>
              </div>
            ))}
            {news.map((item) => (
              <Link key={item.id} href={`/informasi/${item.slug}`} className="block rounded-lg border p-3 hover:bg-slate-50">
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-slate-500">{item.excerpt ?? item.category ?? "Pengumuman sekolah"}</p>
              </Link>
            ))}
            {notifications.length === 0 && news.length === 0 && <p className="text-sm text-slate-500">Belum ada pengumuman.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof UserRound; label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <Icon className="mb-3 h-5 w-5 text-emerald-600" />
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
