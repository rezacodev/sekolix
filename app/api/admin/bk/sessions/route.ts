import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { getStaffIdForUser } from "@/lib/bk/server";

const sessionSchema = z.object({
  caseId: z.string().min(1),
  summary: z.string().trim().min(5).max(5000),
  sessionDate: z.coerce.date().default(() => new Date()),
  followUpPlan: z.string().trim().max(5000).optional().nullable(),
  nextSessionAt: z.coerce.date().optional().nullable(),
  visibility: z.enum(["PRIVATE_BK", "HOMEROOM", "TEACHER", "PARENT_VISIBLE"]).default("PRIVATE_BK"),
  parentVisible: z.boolean().default(false),
});

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "bk");
  if (!access.ok) return access.response;

  const parsed = sessionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const counselingCase = await db.studentCounselingCase.findUnique({ where: { id: parsed.data.caseId } });
  if (!counselingCase) return NextResponse.json({ error: "Kasus BK tidak ditemukan" }, { status: 404 });

  const staffId = await getStaffIdForUser(access.context.user.id);
  const created = await db.counselingSession.create({
    data: {
      case_id: counselingCase.id,
      student_id: counselingCase.student_id,
      counselor_id: staffId ?? counselingCase.counselor_id,
      session_date: parsed.data.sessionDate,
      summary: parsed.data.summary,
      follow_up_plan: parsed.data.followUpPlan ?? null,
      next_session_at: parsed.data.nextSessionAt ?? null,
      visibility: parsed.data.visibility,
      parent_visible: parsed.data.parentVisible || parsed.data.visibility === "PARENT_VISIBLE",
    },
  });

  await db.studentCounselingCase.update({
    where: { id: counselingCase.id },
    data: { status: counselingCase.status === "OPEN" ? "IN_PROGRESS" : counselingCase.status },
  });

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "bk",
    action: "create_session",
    entityType: "CounselingSession",
    entityId: created.id,
    metadata: { caseId: counselingCase.id, studentId: counselingCase.student_id },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "CounselingSession",
    entityId: created.id,
    action: "create",
    after: created,
  });

  return NextResponse.json({ data: created }, { status: 201 });
}
