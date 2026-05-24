import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getStaffId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.staffId) return null;
  return session.user.staffId;
}

type Params = { params: Promise<{ studentId: string }> };

// GET /api/teacher/laporan/nilai/[studentId] — progress report per siswa
export async function GET(_req: Request, { params }: Params) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { studentId } = await params;

    const student = await prisma.pesertaDidik.findFirst({
      where: { id: studentId, deleted_at: null },
      select: {
        id: true,
        fullName: true,
        nisn: true,
        rombels: {
          where: { deleted_at: null },
          select: {
            id: true,
            name: true,
            class: { select: { name: true } },
          },
        },
      },
    });
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    const rombelIds = student.rombels.map((r) => r.id);

    // Get teacher's subjects for these rombels
    const teacherSubjects = await prisma.teacherSubject.findMany({
      where: {
        teacher_id: staffId,
        deleted_at: null,
        rombel_id: { in: rombelIds },
      },
      include: { subject: { select: { id: true, name: true } } },
    });

    const subjectIds = teacherSubjects.map((ts) => ts.subject_id);

    // Rubric scores for this student
    const grades = await prisma.grade.findMany({
      where: {
        student_id: studentId,
        deleted_at: null,
        rubric: {
          subject_id: { in: subjectIds },
          rombel_id: { in: rombelIds },
        },
      },
      include: {
        rubric: {
          select: {
            id: true,
            name: true,
            type: true,
            weight: true,
            subject: { select: { id: true, name: true } },
            rombel: { select: { id: true, name: true } },
          },
        },
      },
    });

    // Group by subject
    const bySubject = new Map<string, {
      subjectId: string;
      subjectName: string;
      rubrics: { name: string; type: string; score: number; weight: number }[];
      weightedAvg: number | null;
    }>();

    for (const grade of grades) {
      if (!grade.rubric) continue;
      const sid = String(grade.rubric.subject.id);
      const prev = bySubject.get(sid) ?? {
        subjectId: sid,
        subjectName: grade.rubric.subject.name,
        rubrics: [],
        weightedAvg: null,
      };
      prev.rubrics.push({
        name: grade.rubric.name,
        type: grade.rubric.type,
        score: Number(grade.score),
        weight: grade.rubric.weight,
      });
      bySubject.set(sid, prev);
    }

    // Calculate weighted averages
    for (const [, subj] of bySubject) {
      const totalWeight = subj.rubrics.reduce((s, r) => s + r.weight, 0);
      if (totalWeight > 0) {
        subj.weightedAvg = Math.round(
          (subj.rubrics.reduce((s, r) => s + r.score * r.weight, 0) / totalWeight) * 10
        ) / 10;
      }
    }

    // Attendance summary for this student
    const attendances = await prisma.attendance.findMany({
      where: {
        student_id: studentId,
        teacher_subject_id: { in: teacherSubjects.map((ts) => ts.id) },
        deleted_at: null,
      },
      select: { status: true, teacher_subject_id: true },
    });

    const attBySubject = new Map<string, { hadir: number; total: number }>();
    for (const a of attendances) {
      const ts = teacherSubjects.find((t) => t.id === a.teacher_subject_id);
      if (!ts) continue;
      const sid = String(ts.subject_id);
      const prev = attBySubject.get(sid) ?? { hadir: 0, total: 0 };
      prev.total++;
      if (a.status === "HADIR") prev.hadir++;
      attBySubject.set(sid, prev);
    }

    return NextResponse.json({
      student: {
        id: student.id,
        fullName: student.fullName,
        nisn: student.nisn ?? "",
        rombel: student.rombels[0] ? {
          id: String(student.rombels[0].id),
          name: student.rombels[0].name,
          className: student.rombels[0].class.name,
        } : null,
      },
      subjects: Array.from(bySubject.values()).map((s) => ({
        ...s,
        attendance: attBySubject.get(s.subjectId) ?? { hadir: 0, total: 0 },
        attendanceRate: (() => {
          const att = attBySubject.get(s.subjectId);
          return att && att.total > 0 ? Math.round((att.hadir / att.total) * 100) : null;
        })(),
      })),
    });
  } catch (error) {
    console.error("Error fetching student progress:", error);
    return NextResponse.json({ error: "Failed to fetch student progress" }, { status: 500 });
  }
}
