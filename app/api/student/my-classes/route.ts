import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "MURID") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const student = session.user.email
    ? await prisma.pesertaDidik.findFirst({
        where: { email: session.user.email, deleted_at: null },
        include: {
          rombels: {
            where: { deleted_at: null },
            include: {
              class: { select: { name: true } },
              tahunAjaran: { select: { label: true } },
              teacherSubjects: {
                where: { deleted_at: null },
                include: {
                  subject: { select: { name: true } },
                  teacher: { select: { name: true } },
                },
              },
            },
          },
        },
      })
    : null;

  const classes = (student?.rombels ?? []).map((rombel) => ({
    id: String(rombel.id),
    name: rombel.name,
    grade: rombel.class.name,
    year: rombel.tahunAjaran?.label ?? "",
    subjects: rombel.teacherSubjects.map((item) => ({
      name: item.subject.name,
      teacher: item.teacher?.name ?? "-",
    })),
  }));

  return NextResponse.json(classes);
}
