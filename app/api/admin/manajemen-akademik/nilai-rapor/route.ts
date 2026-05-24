import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || (user.role !== "ADMIN" && user.role !== "EDITOR")) return null;
  return user;
}

// GET /api/admin/manajemen-akademik/nilai-rapor
// ?tahunAjaranId=xxx&page=0&pageSize=20&search=
export async function GET(request: Request) {
  try {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const tahunAjaranId = searchParams.get("tahunAjaranId") ?? undefined;
    const search = searchParams.get("search") ?? "";
    const page = parseInt(searchParams.get("page") ?? "0");
    const pageSize = parseInt(searchParams.get("pageSize") ?? "20");

    const where = {
      deleted_at: null,
      ...(tahunAjaranId ? { tahunAjaranId } : {}),
      ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
    };

    const [rombels, totalCount] = await Promise.all([
      prisma.rombel.findMany({
        where,
        skip: page * pageSize,
        take: pageSize,
        orderBy: [{ tahunAjaranId: "desc" }, { name: "asc" }],
        include: {
          class: { select: { name: true } },
          program: { select: { name: true } },
          tahunAjaran: { select: { id: true, label: true } },
          students: { where: { deleted_at: null }, select: { id: true } },
          rubrics: {
            where: { deleted_at: null },
            select: { id: true, subject_id: true },
          },
          teacherSubjects: {
            where: { deleted_at: null },
            select: {
              subject: { select: { id: true, name: true, kkm: true } },
              teacher: { select: { name: true } },
            },
          },
        },
      }),
      prisma.rombel.count({ where }),
    ]);

    const data = rombels.map((r) => {
      const subjectIds = [...new Set(r.teacherSubjects.map((ts) => Number(ts.subject.id)))];
      const rubricSubjectIds = [...new Set(r.rubrics.map((rb) => Number(rb.subject_id)))];
      // A subject has grades if it has rubrics
      const subjectsWithData = subjectIds.filter((sid) => rubricSubjectIds.includes(sid));

      return {
        id: Number(r.id),
        name: r.name,
        className: r.class.name,
        programName: r.program.name,
        tahunAjaranId: r.tahunAjaranId,
        tahunAjaranLabel: r.tahunAjaran?.label ?? "-",
        studentCount: r.students.length,
        subjectCount: subjectIds.length,
        subjectsWithData: subjectsWithData.length,
        subjects: r.teacherSubjects.map((ts) => ({
          id: Number(ts.subject.id),
          name: ts.subject.name,
          kkm: ts.subject.kkm ?? 75,
          teacherName: ts.teacher?.name ?? "-",
          hasData: rubricSubjectIds.includes(Number(ts.subject.id)),
        })),
      };
    });

    return NextResponse.json({ data, totalCount, page, pageSize });
  } catch (error) {
    console.error("Error fetching nilai-rapor list:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
