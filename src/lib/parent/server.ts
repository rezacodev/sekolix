import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function requireParentContext() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ORANGTUA") return null;

  const profile = await db.parentGuardian.findUnique({
    where: { user_id: session.user.id },
    include: {
      students: {
        include: {
          student: {
            include: {
              rombels: {
                where: { deleted_at: null },
                include: {
                  class: true,
                  program: true,
                  tahunAjaran: true,
                  teacherSubjects: {
                    where: { deleted_at: null },
                    include: {
                      subject: true,
                      teacher: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!profile) return null;
  return { session, user: session.user, profile };
}

export function parentUnauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function requireParentStudent(studentId: string) {
  const context = await requireParentContext();
  if (!context) return { ok: false as const, response: parentUnauthorized() };

  const link = context.profile.students.find((item) => item.student_id === studentId);
  if (!link) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Student outside parent scope" }, { status: 403 }),
    };
  }

  return { ok: true as const, context, link, student: link.student };
}

export function getPrimaryRombel(
  student: Awaited<ReturnType<typeof requireParentContext>> extends infer Context
    ? Context extends { profile: { students: Array<{ student: infer Student }> } }
      ? Student
      : never
    : never
) {
  return student.rombels[0] ?? null;
}

export function serializeParentStudent(link: NonNullable<Awaited<ReturnType<typeof requireParentContext>>>["profile"]["students"][number]) {
  const student = link.student;
  const rombel = student.rombels[0] ?? null;

  return {
    id: student.id,
    name: student.fullName,
    nisn: student.nisn,
    nik: student.nik,
    gender: student.gender,
    email: student.email,
    phone: student.phone,
    relationship: link.relationship,
    isPrimary: link.is_primary,
    rombel: rombel
      ? {
          id: String(rombel.id),
          name: rombel.name,
          className: rombel.class.name,
          programName: rombel.program.name,
          tahunAjaran: rombel.tahunAjaran?.label ?? null,
        }
      : null,
    teachers: rombel
      ? rombel.teacherSubjects.map((item) => ({
          id: item.teacher?.id ?? null,
          name: item.teacher?.name ?? "-",
          subject: item.subject.name,
        }))
      : [],
  };
}
