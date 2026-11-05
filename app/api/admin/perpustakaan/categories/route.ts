import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";

const categorySchema = z.object({
  code: z.string().trim().min(2).max(32).transform((value) => value.toUpperCase()),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).optional().nullable(),
});

export async function GET() {
  const access = await requireApiPermission("read", "perpustakaan");
  if (!access.ok) return access.response;

  const categories = await db.libraryCategory.findMany({
    include: { _count: { select: { books: true } } },
    orderBy: [{ is_active: "desc" }, { name: "asc" }],
  });
  return NextResponse.json({ data: categories });
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "perpustakaan");
  if (!access.ok) return access.response;

  const parsed = categorySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const category = await db.libraryCategory.create({ data: parsed.data });
  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "perpustakaan",
    action: "create_category",
    entityType: "LibraryCategory",
    entityId: category.id,
    metadata: { code: category.code },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "LibraryCategory",
    entityId: category.id,
    action: "create",
    after: category,
  });

  return NextResponse.json({ data: category }, { status: 201 });
}
