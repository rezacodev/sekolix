import { db } from "@/lib/db";

function uniqueBigInts(values: Array<bigint | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is bigint => value != null)));
}

export async function getTeacherAcademicScope(teacherId: string) {
  const teacherSubjects = await db.teacherSubject.findMany({
    where: { teacher_id: teacherId, deleted_at: null },
    select: { subject_id: true, class_id: true, rombel_id: true },
  });

  const subjectIds = uniqueBigInts(teacherSubjects.map((item) => item.subject_id));
  const classIds = uniqueBigInts(teacherSubjects.map((item) => item.class_id));
  const directRombelIds = uniqueBigInts(teacherSubjects.map((item) => item.rombel_id));

  const classRombels = classIds.length
    ? await db.rombel.findMany({
        where: { class_id: { in: classIds }, deleted_at: null },
        select: { id: true },
      })
    : [];

  return {
    subjectIds,
    classIds,
    rombelIds: uniqueBigInts([...directRombelIds, ...classRombels.map((rombel) => rombel.id)]),
  };
}

export async function teacherCanAccessSubject(teacherId: string, subjectId: bigint) {
  const assignment = await db.teacherSubject.findFirst({
    where: { teacher_id: teacherId, subject_id: subjectId, deleted_at: null },
    select: { id: true },
  });

  return Boolean(assignment);
}

export async function teacherCanAccessStudents(teacherId: string, studentIds: string[]) {
  const uniqueStudentIds = Array.from(new Set(studentIds));
  if (!uniqueStudentIds.length) return { ok: true, allowedIds: new Set<string>() };

  const scope = await getTeacherAcademicScope(teacherId);
  if (!scope.rombelIds.length) return { ok: false, allowedIds: new Set<string>() };

  const students = await db.pesertaDidik.findMany({
    where: {
      id: { in: uniqueStudentIds },
      deleted_at: null,
      rombels: { some: { id: { in: scope.rombelIds }, deleted_at: null } },
    },
    select: { id: true },
  });

  const allowedIds = new Set(students.map((student) => student.id));
  return {
    ok: uniqueStudentIds.every((studentId) => allowedIds.has(studentId)),
    allowedIds,
  };
}

export async function teacherOwnsQuestions(teacherId: string, subjectId: bigint, questionIds: bigint[]) {
  const uniqueQuestionIds = uniqueBigInts(questionIds);
  if (!uniqueQuestionIds.length) return true;

  const count = await db.questionBank.count({
    where: {
      id: { in: uniqueQuestionIds },
      teacher_id: teacherId,
      subject_id: subjectId,
      is_active: true,
      deleted_at: null,
    },
  });

  return count === uniqueQuestionIds.length;
}
