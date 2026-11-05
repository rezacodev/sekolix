import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";

const categorySchema = z.object({
  code: z.string().trim().min(2).max(24).transform((value) => value.toUpperCase()),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).optional().nullable(),
});

export async function GET() {
  const access = await requireApiPermission("read", "inventaris");
  if (!access.ok) return access.response;

  const categories = await db.assetCategory.findMany({
    include: { _count: { select: { assets: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ data: categories });
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "inventaris");
  if (!access.ok) return access.response;

  const parsed = categorySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const category = await db.assetCategory.upsert({
    where: { code: parsed.data.code },
    update: {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      is_active: true,
    },
    create: {
      code: parsed.data.code,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
    },
  });

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "inventaris",
    action: "upsert_category",
    entityType: "AssetCategory",
    entityId: category.id,
    metadata: { code: category.code, name: category.name },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "AssetCategory",
    entityId: category.id,
    action: "upsert",
    after: category,
  });

  return NextResponse.json({ data: category }, { status: 201 });
}

