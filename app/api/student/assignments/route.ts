import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "MURID") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const rombelId = searchParams.get("rombelId");
  const status = searchParams.get("status") || "all";
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") || "10")));

  const student = session.user.email
    ? await prisma.pesertaDidik.findFirst({
        where: { email: session.user.email, deleted_at: null },
        include: { rombels: { where: { deleted_at: null }, select: { id: true } } },
      })
    : null;

  if (!student) return NextResponse.json([]);

  const scopedRombelIds = student.rombels.map((rombel) => rombel.id);
  const selectedRombelId = rombelId ? BigInt(rombelId) : undefined;
  if (selectedRombelId && !scopedRombelIds.includes(selectedRombelId)) {
    return NextResponse.json([]);
  }

  const assignments = await prisma.assignment.findMany({
    where: {
      deleted_at: null,
      rombel_id: selectedRombelId ?? { in: scopedRombelIds },
      ...(status === "overdue" ? { due_date: { lt: new Date() } } : {}),
    },
    include: {
      submissions: {
        where: { student_id: student.id, deleted_at: null },
        select: { status: true, score: true },
        take: 1,
      },
    },
    orderBy: { due_date: "asc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const response = assignments.map((assignment) => {
    const submission = assignment.submissions[0];
    return {
      id: String(assignment.id),
      title: assignment.title,
      description: assignment.description ?? "",
      type: "upload",
      dueDate: assignment.due_date.toISOString(),
      point: Number(assignment.max_score ?? 100),
      status: submission?.status ?? "belum_dikumpulkan",
      grade: submission?.score ? Number(submission.score) : null,
    };
  });

  return NextResponse.json(response);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "MURID") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { assignmentId, submission } = await req.json();
  if (!assignmentId || !submission) {
    return NextResponse.json({ error: "assignmentId dan submission wajib diisi" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
