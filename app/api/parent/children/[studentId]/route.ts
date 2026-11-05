import { NextResponse } from "next/server";
import { requireParentStudent, serializeParentStudent } from "@/lib/parent/server";
import { db } from "@/lib/db";

type Params = { params: Promise<{ studentId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { studentId } = await params;
  const access = await requireParentStudent(studentId);
  if (!access.ok) return access.response;

  const [latestGrades, attendanceSummary, assignments] = await Promise.all([
    db.grade.findMany({
      where: { student_id: studentId, deleted_at: null },
      include: { assessment: { include: { subject: true } } },
      orderBy: { updated_at: "desc" },
      take: 5,
    }),
    db.attendance.groupBy({
      by: ["status"],
      where: { student_id: studentId, deleted_at: null },
      _count: { _all: true },
    }),
    db.assignment.findMany({
      where: {
        deleted_at: null,
        rombel: { students: { some: { id: studentId } } },
      },
      include: {
        subject: true,
        submissions: {
          where: { student_id: studentId, deleted_at: null },
          take: 1,
        },
      },
      orderBy: { due_date: "asc" },
      take: 8,
    }),
  ]);

  return NextResponse.json({
    child: serializeParentStudent(access.link),
    latestGrades: latestGrades.map((grade) => ({
      id: String(grade.id),
      title: grade.assessment.title,
      subject: grade.assessment.subject.name,
      score: Number(grade.score),
      maxScore: Number(grade.assessment.max_score ?? 100),
      updatedAt: grade.updated_at.toISOString(),
    })),
    attendanceSummary: attendanceSummary.map((item) => ({
      status: item.status,
      count: item._count._all,
    })),
    assignments: assignments.map((assignment) => ({
      id: String(assignment.id),
      title: assignment.title,
      subject: assignment.subject?.name ?? "-",
      dueDate: assignment.due_date.toISOString(),
      status: assignment.submissions[0]?.status ?? "belum_dikumpulkan",
      score: assignment.submissions[0]?.score ? Number(assignment.submissions[0].score) : null,
    })),
  });
}
