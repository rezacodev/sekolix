import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";

const ruleSchema = z.object({
  code: z.string().trim().min(2).max(32).transform((value) => value.toUpperCase()),
  title: z.string().trim().min(3).max(160),
  category: z.string().trim().min(2).max(80).default("GENERAL"),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("LOW"),
  points: z.coerce.number().int().min(0).default(0),
  description: z.string().trim().max(1000).optional().nullable(),
});

export async function GET() {
  const access = await requireApiPermission("read", "bk");
  if (!access.ok) return access.response;

  const rules = await db.disciplineRule.findMany({ orderBy: [{ is_active: "desc" }, { points: "desc" }] });
  return NextResponse.json({ data: rules });
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "bk");
  if (!access.ok) return access.response;

  const parsed = ruleSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const created = await db.disciplineRule.create({ data: parsed.data });
  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "bk",
    action: "create_discipline_rule",
    entityType: "DisciplineRule",
    entityId: created.id,
    metadata: { code: created.code, points: created.points },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "DisciplineRule",
    entityId: created.id,
    action: "create",
    after: created,
  });

  return NextResponse.json({ data: created }, { status: 201 });
}
