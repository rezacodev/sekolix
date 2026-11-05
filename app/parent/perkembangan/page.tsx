import { redirect } from "next/navigation";
import { Award, ClipboardList, FileText, ShieldAlert, Users } from "lucide-react";
import { db } from "@/lib/db";
import { requireParentContext } from "@/lib/parent/server";
import { serializeCaseStatus } from "@/lib/bk/server";

export default async function ParentDevelopmentPage() {
  const context = await requireParentContext();
  if (!context) redirect("/login");

  const studentIds = context.profile.students.map((link) => link.student_id);
  const [cases, records, achievements, notes, letters] = await Promise.all([
    db.studentCounselingCase.findMany({
      where: { student_id: { in: studentIds }, parent_visible: true },
      include: { student: { select: { fullName: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    db.disciplineRecord.findMany({
      where: { student_id: { in: studentIds }, parent_visible: true },
      include: { student: { select: { fullName: true } }, rule: true },
      orderBy: { incident_date: "desc" },
    }),
    db.studentAchievement.findMany({
      where: { student_id: { in: studentIds }, parent_visible: true },
      include: { student: { select: { fullName: true } } },
      orderBy: { achievement_date: "desc" },
    }),
    db.studentDevelopmentNote.findMany({
      where: { student_id: { in: studentIds }, parent_visible: true },
      include: { student: { select: { fullName: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.parentSummonLetter.findMany({
      where: { student_id: { in: studentIds }, parent_visible: true },
      include: { student: { select: { fullName: true } } },
      orderBy: { scheduled_at: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">Portal Orang Tua</p>
        <h1 className="text-2xl font-bold">Perkembangan Anak</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Metric icon={ClipboardList} label="Kasus terlihat" value={cases.length} />
        <Metric icon={ShieldAlert} label="Catatan disiplin" value={records.length} />
        <Metric icon={Award} label="Prestasi" value={achievements.length} />
        <Metric icon={FileText} label="Catatan" value={notes.length} />
        <Metric icon={Users} label="Panggilan" value={letters.length} />
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <Panel title="Ringkasan BK">
          {cases.map((item) => (
            <div key={item.id} className="rounded-lg border p-3">
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-slate-500">{item.student.fullName} - {serializeCaseStatus(item.status)}</p>
            </div>
          ))}
          {cases.length === 0 && <Empty text="Belum ada ringkasan BK yang dibagikan." />}
        </Panel>

        <Panel title="Prestasi">
          {achievements.map((item) => (
            <div key={item.id} className="rounded-lg border p-3">
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-slate-500">{item.student.fullName} - {item.level} - {item.achievement_date.toLocaleDateString("id-ID")}</p>
            </div>
          ))}
          {achievements.length === 0 && <Empty text="Belum ada prestasi yang dibagikan." />}
        </Panel>

        <Panel title="Catatan Kedisiplinan">
          {records.map((item) => (
            <div key={item.id} className="rounded-lg border p-3">
              <p className="font-medium">{item.rule?.title ?? "Catatan kedisiplinan"}</p>
              <p className="text-xs text-slate-500">{item.student.fullName} - {item.points} poin - {item.incident_date.toLocaleDateString("id-ID")}</p>
            </div>
          ))}
          {records.length === 0 && <Empty text="Tidak ada catatan kedisiplinan yang dibagikan." />}
        </Panel>

        <Panel title="Surat Panggilan">
          {letters.map((item) => (
            <div key={item.id} className="rounded-lg border p-3">
              <p className="font-medium">{item.letter_number}</p>
              <p className="text-xs text-slate-500">{item.student.fullName} - {item.scheduled_at.toLocaleString("id-ID")}</p>
              <p className="mt-1 text-sm text-slate-600">{item.agenda}</p>
            </div>
          ))}
          {letters.length === 0 && <Empty text="Tidak ada surat panggilan aktif." />}
        </Panel>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof ClipboardList; label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <Icon className="mb-3 h-5 w-5 text-emerald-700" />
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border bg-white p-4">
      <h2 className="mb-3 text-base font-semibold">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-slate-500">{text}</p>;
}
