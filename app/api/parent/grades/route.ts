import { NextResponse } from "next/server";
import { requireParentStudent } from "@/lib/parent/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");
  if (!studentId) return NextResponse.json({ error: "studentId wajib diisi" }, { status: 400 });

  const access = await requireParentStudent(studentId);
  if (!access.ok) return access.response;

  const grades = await db.grade.findMany({
    where: { student_id: studentId, deleted_at: null },
    include: { assessment: { include: { subject: true } } },
    orderBy: [{ assessment: { subject_id: "asc" } }, { updated_at: "desc" }],
  });

  const bySubject = new Map<string, { subject: string; grades: typeof grades; total: number; count: number }>();
  for (const grade of grades) {
    const key = String(grade.assessment.subject_id);
    const bucket = bySubject.get(key) ?? {
      subject: grade.assessment.subject.name,
      grades: [],
      total: 0,
      count: 0,
    };
    const maxScore = Number(grade.assessment.max_score ?? 100);
    const score = Number(grade.score);
    bucket.grades.push(grade);
    bucket.total += maxScore > 0 ? (score / maxScore) * 100 : score;
    bucket.count += 1;
    bySubject.set(key, bucket);
  }

  return NextResponse.json({
    subjects: Array.from(bySubject.entries()).map(([subjectId, item]) => ({
      subjectId,
      subject: item.subject,
      average: item.count > 0 ? Math.round((item.total / item.count) * 10) / 10 : null,
      grades: item.grades.map((grade) => ({
        id: String(grade.id),
        title: grade.assessment.title,
        type: grade.assessment.type,
        score: Number(grade.score),
        maxScore: Number(grade.assessment.max_score ?? 100),
        notes: grade.notes,
        updatedAt: grade.updated_at.toISOString(),
      })),
    })),
  });
}
