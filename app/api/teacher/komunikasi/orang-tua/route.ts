import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getStaffId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.staffId) return null;
  return session.user.staffId;
}

// GET /api/teacher/komunikasi/orang-tua — list students with parent info
export async function GET(request: Request) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const rombelId = searchParams.get("rombelId");
    const search = searchParams.get("search") ?? "";

    // Get teacher's rombels
    const teacherSubjects = await prisma.teacherSubject.findMany({
      where: {
        teacher_id: staffId,
        deleted_at: null,
        ...(rombelId ? { rombel_id: BigInt(rombelId) } : {}),
      },
      include: {
        rombel: {
          select: {
            id: true,
            name: true,
            class: { select: { name: true } },
            students: {
              where: { deleted_at: null },
              orderBy: { fullName: "asc" },
              select: {
                id: true,
                fullName: true,
                nisn: true,
                mobile: true,
                fatherName: true,
                motherName: true,
                guardianName: true,
              },
            },
          },
        },
      },
    });

    const rombels = teacherSubjects
      .filter((ts) => ts.rombel)
      .map((ts) => ts.rombel!)
      .filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i);

    // Build flat student list with parent info
    const students = rombels.flatMap((rombel) =>
      rombel.students
        .filter((s) =>
          !search ||
          s.fullName.toLowerCase().includes(search.toLowerCase()) ||
          (s.fatherName ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (s.motherName ?? "").toLowerCase().includes(search.toLowerCase())
        )
        .map((s) => ({
          id: s.id,
          fullName: s.fullName,
          nisn: s.nisn ?? "",
          mobile: s.mobile ?? null,
          rombelId: String(rombel.id),
          rombelName: rombel.name,
          className: rombel.class.name,
          parentInfo: {
            fatherName: s.fatherName ?? null,
            motherName: s.motherName ?? null,
            guardianName: s.guardianName ?? null,
            primaryContact: s.fatherName ?? s.motherName ?? s.guardianName ?? null,
          },
        }))
    ).filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i);

    const filterRombels = rombels.map((r) => ({
      id: String(r.id),
      name: r.name,
      className: r.class.name,
    }));

    return NextResponse.json({ students, filterRombels, total: students.length });
  } catch (error) {
    console.error("Error fetching orang tua data:", error);
    return NextResponse.json({ error: "Failed to fetch orang tua data" }, { status: 500 });
  }
}
