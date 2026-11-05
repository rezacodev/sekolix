import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { getStaffIdForUser } from "@/lib/bk/server";

const recordSchema = z.object({
  studentId: z.string().min(1),
  ruleId: z.string().optional().nullable(),
  caseId: z.string().optional().nullable(),
  incidentDate: z.coerce.date(),
  description: z.string().trim().min(5).max(5000),
  points: z.coerce.number().int().min(0).optional(),
  actionTaken: z.string().trim().max(5000).optional().nullable(),
  status: z.enum(["OPEN", "FOLLOW_UP", "RESOLVED"]).default("OPEN"),
  parentVisible: z.boolean().default(false),
});

export async function GET(request: Request) {
  const access = await requireApiPermission("read", "bk");
  if (!access.ok) return access.response;

  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");

  const records = await db.disciplineRecord.findMany({
    where: { ...(studentId ? { student_id: studentId } : {}) },
    include: {
      student: { select: { id: true, fullName: true, nisn: true } },
      rule: true,
      recorder: { select: { id: true, name: true } },
    },
    orderBy: { incident_date: "desc" },
    take: 200,
  });

  return NextResponse.json({ data: records });
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "bk");
  if (!access.ok) return access.response;

  const parsed = recordSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const [rule, staffId] = await Promise.all([
    parsed.data.ruleId ? db.disciplineRule.findUnique({ where: { id: parsed.data.ruleId } }) : null,
    getStaffIdForUser(access.context.user.id),
  ]);

  const created = await db.disciplineRecord.create({
    data: {
      student_id: parsed.data.studentId,
      rule_id: parsed.data.ruleId ?? null,
      case_id: parsed.data.caseId ?? null,
      recorded_by: staffId,
      incident_date: parsed.data.incidentDate,
      description: parsed.data.description,
      points: parsed.data.points ?? rule?.points ?? 0,
      action_taken: parsed.data.actionTaken ?? null,
      status: parsed.data.status,
      parent_visible: parsed.data.parentVisible,
    },
  });

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "bk",
    action: "create_discipline_record",
    entityType: "DisciplineRecord",
    entityId: created.id,
    metadata: { studentId: created.student_id, points: created.points },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "DisciplineRecord",
    entityId: created.id,
    action: "create",
    after: created,
  });

  return NextResponse.json({ data: created }, { status: 201 });
}
