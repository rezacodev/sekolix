import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { getStaffIdForUser } from "@/lib/bk/server";

const referralSchema = z.object({
  studentId: z.string().min(1),
  caseId: z.string().optional().nullable(),
  assignedTo: z.string().optional().nullable(),
  source: z.enum(["TEACHER", "HOMEROOM", "PARENT", "STUDENT", "ADMIN"]).default("TEACHER"),
  reason: z.string().trim().min(5).max(5000),
});

export async function GET() {
  const access = await requireApiPermission("read", "bk");
  if (!access.ok) return access.response;

  const referrals = await db.counselingReferral.findMany({
    include: {
      student: { select: { id: true, fullName: true, nisn: true } },
      counselingCase: { select: { id: true, title: true, status: true } },
      creator: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 200,
  });

  return NextResponse.json({ data: referrals });
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "bk");
  if (!access.ok) return access.response;

  const parsed = referralSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const staffId = await getStaffIdForUser(access.context.user.id);
  const created = await db.counselingReferral.create({
    data: {
      student_id: parsed.data.studentId,
      case_id: parsed.data.caseId ?? null,
      referred_by: staffId,
      assigned_to: parsed.data.assignedTo ?? null,
      source: parsed.data.source,
      reason: parsed.data.reason,
      status: "PENDING",
    },
  });

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "bk",
    action: "create_referral",
    entityType: "CounselingReferral",
    entityId: created.id,
    metadata: { studentId: created.student_id, assignedTo: created.assigned_to },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "CounselingReferral",
    entityId: created.id,
    action: "create",
    after: created,
  });

  return NextResponse.json({ data: created }, { status: 201 });
}
