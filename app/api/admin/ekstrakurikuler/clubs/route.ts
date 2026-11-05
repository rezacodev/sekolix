import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { getStaffIdForUser } from "@/lib/extracurricular/server";

const clubSchema = z.object({
  code: z.string().trim().min(2).max(40).transform((value) => value.toUpperCase()),
  name: z.string().trim().min(2).max(160),
  category: z.string().trim().max(80).optional().nullable(),
  description: z.string().trim().max(2000).optional().nullable(),
  location: z.string().trim().max(160).optional().nullable(),
  capacity: z.coerce.number().int().positive().optional().nullable(),
});

export async function GET() {
  const access = await requireApiPermission("read", "ekstrakurikuler");
  if (!access.ok) return access.response;
  const clubs = await db.extracurricular.findMany({
    include: { coaches: { include: { staff: { select: { name: true } } } }, _count: { select: { members: true, schedules: true, achievements: true, registrations: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ data: clubs });
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "ekstrakurikuler");
  if (!access.ok) return access.response;
  const parsed = clubSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  const creatorId = await getStaffIdForUser(access.context.user.id);
  const club = await db.extracurricular.upsert({
    where: { code: parsed.data.code },
    update: { name: parsed.data.name, category: parsed.data.category ?? null, description: parsed.data.description ?? null, location: parsed.data.location ?? null, capacity: parsed.data.capacity ?? null, is_active: true },
    create: { code: parsed.data.code, name: parsed.data.name, category: parsed.data.category ?? null, description: parsed.data.description ?? null, location: parsed.data.location ?? null, capacity: parsed.data.capacity ?? null, created_by: creatorId },
  });
  await logActivity({ actorUserId: access.context.user.id, actorName: access.context.user.name, module: "ekstrakurikuler", action: "upsert_club", entityType: "Extracurricular", entityId: club.id, metadata: { code: club.code, name: club.name }, request });
  await writeAuditTrail({ actorUserId: access.context.user.id, entityType: "Extracurricular", entityId: club.id, action: "upsert", after: club });
  return NextResponse.json({ data: club }, { status: 201 });
}

