import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { getStaffIdForUser } from "@/lib/bk/server";

const caseSchema = z.object({
  studentId: z.string().min(1),
  counselorId: z.string().optional().nullable(),
  category: z.string().trim().min(2).max(80).default("GENERAL"),
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(5).max(5000),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).default("OPEN"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  visibility: z.enum(["PRIVATE_BK", "HOMEROOM", "TEACHER", "PARENT_VISIBLE"]).default("PRIVATE_BK"),
  parentVisible: z.boolean().default(false),
});

export async function GET(request: Request) {
  const access = await requireApiPermission("read", "bk");
  if (!access.ok) return access.response;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const studentId = searchParams.get("studentId");
  const search = searchParams.get("search")?.trim();

  const cases = await db.studentCounselingCase.findMany({
    where: {
      ...(status && status !== "ALL" ? { status } : {}),
      ...(studentId ? { student_id: studentId } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              { student: { fullName: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: {
      student: { select: { id: true, fullName: true, nisn: true } },
      counselor: { select: { id: true, name: true } },
      sessions: { orderBy: { session_date: "desc" }, take: 3 },
      disciplineRecords: { select: { points: true } },
      summonLetters: { orderBy: { scheduled_at: "desc" }, take: 2 },
    },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    take: 200,
  });

  return NextResponse.json({ data: cases });
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "bk");
  if (!access.ok) return access.response;

  const parsed = caseSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const staffId = parsed.data.counselorId ?? (await getStaffIdForUser(access.context.user.id));
  const created = await db.studentCounselingCase.create({
    data: {
      student_id: parsed.data.studentId,
      counselor_id: staffId,
      category: parsed.data.category,
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      priority: parsed.data.priority,
      visibility: parsed.data.visibility,
      parent_visible: parsed.data.parentVisible || parsed.data.visibility === "PARENT_VISIBLE",
      created_by: access.context.user.id,
    },
  });

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "bk",
    action: "create_case",
    entityType: "StudentCounselingCase",
    entityId: created.id,
    metadata: { studentId: created.student_id, status: created.status, priority: created.priority },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "StudentCounselingCase",
    entityId: created.id,
    action: "create",
    after: created,
  });

  return NextResponse.json({ data: created }, { status: 201 });
}
