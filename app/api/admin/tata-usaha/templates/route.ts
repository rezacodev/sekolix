import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { getStaffIdForUser, normalizeJson } from "@/lib/office/server";

const templateSchema = z.object({
  code: z.string().trim().min(2).max(40).transform((value) => value.toUpperCase()),
  name: z.string().trim().min(2).max(160),
  audience: z.enum(["STUDENT", "STAFF", "GENERAL"]).default("GENERAL"),
  subject: z.string().trim().min(2).max(200),
  body: z.string().trim().min(5),
  variables: z.record(z.string(), z.unknown()).optional().default({}),
});

export async function GET() {
  const access = await requireApiPermission("read", "tata-usaha");
  if (!access.ok) return access.response;

  const templates = await db.letterTemplate.findMany({
    include: { creator: { select: { name: true } }, _count: { select: { generatedLetters: true, outgoingLetters: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ data: templates });
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "tata-usaha");
  if (!access.ok) return access.response;

  const parsed = templateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });

  const creatorId = await getStaffIdForUser(access.context.user.id);
  const template = await db.letterTemplate.upsert({
    where: { code: parsed.data.code },
    update: {
      name: parsed.data.name,
      audience: parsed.data.audience,
      subject: parsed.data.subject,
      body: parsed.data.body,
      variables: normalizeJson(parsed.data.variables),
      is_active: true,
    },
    create: {
      code: parsed.data.code,
      name: parsed.data.name,
      audience: parsed.data.audience,
      subject: parsed.data.subject,
      body: parsed.data.body,
      variables: normalizeJson(parsed.data.variables),
      created_by: creatorId,
    },
  });

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "tata-usaha",
    action: "upsert_letter_template",
    entityType: "LetterTemplate",
    entityId: template.id,
    metadata: { code: template.code, audience: template.audience },
    request,
  });
  await writeAuditTrail({ actorUserId: access.context.user.id, entityType: "LetterTemplate", entityId: template.id, action: "upsert", after: template });

  return NextResponse.json({ data: template }, { status: 201 });
}

