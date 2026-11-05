import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { requireParentStudent } from "@/lib/parent/server";

type Props = { params: Promise<{ studentId: string }> };

export default async function ParentChildGradesPage({ params }: Props) {
  const { studentId } = await params;
  const access = await requireParentStudent(studentId);
  if (!access.ok) redirect("/parent");

  const [grades, reportCards] = await Promise.all([
    db.grade.findMany({
      where: { student_id: studentId, deleted_at: null },
      include: { assessment: { include: { subject: true } } },
      orderBy: [{ assessment: { subject_id: "asc" } }, { updated_at: "desc" }],
    }),
    db.reportCard.findMany({
      where: { student_id: studentId, deleted_at: null },
      include: { academic_year: true },
      orderBy: { created_at: "desc" },
    }),
  ]);

  const bySubject = new Map<string, { subject: string; rows: typeof grades; total: number; count: number }>();
  for (const grade of grades) {
    const key = String(grade.assessment.subject_id);
    const bucket = bySubject.get(key) ?? { subject: grade.assessment.subject.name, rows: [], total: 0, count: 0 };
    const score = Number(grade.score);
    const maxScore = Number(grade.assessment.max_score ?? 100);
    bucket.rows.push(grade);
    bucket.total += maxScore > 0 ? (score / maxScore) * 100 : score;
    bucket.count += 1;
    bySubject.set(key, bucket);
  }

  return (
    <div className="space-y-6">
      <Link href={`/parent/anak/${studentId}`} className="inline-flex items-center gap-2 text-sm text-slate-600">
        <ArrowLeft className="h-4 w-4" />
        Kembali ke detail anak
      </Link>
      <div>
        <p className="text-sm text-slate-500">Nilai & rapor</p>
        <h1 className="text-2xl font-bold">{access.student.fullName}</h1>
      </div>

      <section className="rounded-lg border bg-white p-4">
        <h2 className="mb-3 text-base font-semibold">Rapor</h2>
        <div className="space-y-2">
          {reportCards.map((report) => (
            <div key={String(report.id)} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">{report.academic_year.label} - {report.semester}</p>
                <p className="text-xs text-slate-500">{report.notes ?? "Tidak ada catatan"}</p>
              </div>
              <p className="text-lg font-bold text-emerald-700">{report.average_score ? Number(report.average_score) : "-"}</p>
            </div>
          ))}
          {reportCards.length === 0 && <p className="text-sm text-slate-500">Belum ada rapor tersimpan.</p>}
        </div>
      </section>

      <section className="space-y-4">
        {Array.from(bySubject.entries()).map(([subjectId, item]) => (
          <div key={subjectId} className="rounded-lg border bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">{item.subject}</h2>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                Rata-rata {item.count > 0 ? Math.round((item.total / item.count) * 10) / 10 : "-"}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500">
                    <th className="py-2">Komponen</th>
                    <th className="py-2">Tipe</th>
                    <th className="py-2 text-right">Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {item.rows.map((grade) => (
                    <tr key={String(grade.id)} className="border-b last:border-0">
                      <td className="py-2">{grade.assessment.title}</td>
                      <td className="py-2">{grade.assessment.type}</td>
                      <td className="py-2 text-right font-semibold">{Number(grade.score)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
        {grades.length === 0 && <div className="rounded-lg border bg-white p-6 text-sm text-slate-500">Belum ada nilai.</div>}
      </section>
    </div>
  );
}
