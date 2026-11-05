import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CalendarDays, GraduationCap, UserRound } from "lucide-react";
import { db } from "@/lib/db";
import { requireParentStudent, serializeParentStudent } from "@/lib/parent/server";

type Props = { params: Promise<{ studentId: string }> };

export default async function ParentChildDetailPage({ params }: Props) {
  const { studentId } = await params;
  const access = await requireParentStudent(studentId);
  if (!access.ok) redirect("/parent");

  const child = serializeParentStudent(access.link);
  const rombelId = child.rombel?.id ? BigInt(child.rombel.id) : undefined;

  const schedules = rombelId
    ? await db.classSchedule.findMany({
        where: { rombel_id: rombelId, deleted_at: null },
        include: { teacherSubject: { include: { subject: true, teacher: true } } },
        orderBy: [{ day: "asc" }, { period: "asc" }],
      })
    : [];

  return (
    <div className="space-y-6">
      <Link href="/parent" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-950">
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </Link>

      <div className="rounded-lg border bg-white p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm text-slate-500">Profil anak</p>
            <h1 className="text-2xl font-bold">{child.name}</h1>
            <p className="mt-1 text-sm text-slate-500">NISN: {child.nisn ?? "-"} - {child.relationship}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/parent/anak/${child.id}/nilai`} className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white">
              Nilai & Rapor
            </Link>
            <Link href={`/parent/anak/${child.id}/absensi`} className="rounded-md border px-3 py-2 text-sm font-medium">
              Absensi
            </Link>
          </div>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        <InfoCard icon={UserRound} label="Rombel" value={child.rombel ? `${child.rombel.className} - ${child.rombel.name}` : "-"} />
        <InfoCard icon={GraduationCap} label="Program" value={child.rombel?.programName ?? "-"} />
        <InfoCard icon={CalendarDays} label="Tahun ajaran" value={child.rombel?.tahunAjaran ?? "-"} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 text-base font-semibold">Guru pengajar</h2>
          <div className="space-y-2">
            {child.teachers.map((teacher, index) => (
              <div key={`${teacher.id ?? "teacher"}-${index}`} className="rounded-lg border p-3">
                <p className="font-medium">{teacher.name}</p>
                <p className="text-xs text-slate-500">{teacher.subject}</p>
              </div>
            ))}
            {child.teachers.length === 0 && <p className="text-sm text-slate-500">Data guru belum tersedia.</p>}
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 text-base font-semibold">Jadwal pelajaran</h2>
          <div className="space-y-2">
            {schedules.map((schedule) => (
              <div key={String(schedule.id)} className="rounded-lg border p-3">
                <p className="font-medium">{schedule.teacherSubject.subject.name}</p>
                <p className="text-xs text-slate-500">
                  {schedule.day} - Jam ke-{schedule.period ?? "-"} - {schedule.teacherSubject.teacher?.name ?? "Guru"}
                </p>
              </div>
            ))}
            {schedules.length === 0 && <p className="text-sm text-slate-500">Jadwal belum tersedia.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: typeof UserRound; label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <Icon className="mb-3 h-5 w-5 text-emerald-600" />
      <p className="text-sm text-slate-500">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
