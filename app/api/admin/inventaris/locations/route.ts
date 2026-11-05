import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";

const locationSchema = z.object({
  code: z.string().trim().min(2).max(24).transform((value) => value.toUpperCase()),
  name: z.string().trim().min(2).max(120),
  roomId: z.coerce.number().int().positive().optional().nullable(),
  building: z.string().trim().max(120).optional().nullable(),
  floor: z.string().trim().max(60).optional().nullable(),
  description: z.string().trim().max(1000).optional().nullable(),
});

export async function GET() {
  const access = await requireApiPermission("read", "inventaris");
  if (!access.ok) return access.response;

  const locations = await db.assetLocation.findMany({
    include: {
      room: true,
      _count: { select: { assets: true } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ data: locations });
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "inventaris");
  if (!access.ok) return access.response;

  const parsed = locationSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.roomId) {
    const room = await db.room.findUnique({ where: { id: parsed.data.roomId } });
    if (!room) return NextResponse.json({ error: "Ruang tidak ditemukan" }, { status: 404 });
  }

  const location = await db.assetLocation.upsert({
    where: { code: parsed.data.code },
    update: {
      name: parsed.data.name,
      room_id: parsed.data.roomId ?? null,
      building: parsed.data.building ?? null,
      floor: parsed.data.floor ?? null,
      description: parsed.data.description ?? null,
      is_active: true,
    },
    create: {
      code: parsed.data.code,
      name: parsed.data.name,
      room_id: parsed.data.roomId ?? null,
      building: parsed.data.building ?? null,
      floor: parsed.data.floor ?? null,
      description: parsed.data.description ?? null,
    },
  });

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "inventaris",
    action: "upsert_location",
    entityType: "AssetLocation",
    entityId: location.id,
    metadata: { code: location.code, roomId: location.room_id?.toString() ?? null },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "AssetLocation",
    entityId: location.id,
    action: "upsert",
    after: location,
  });

  return NextResponse.json({ data: location }, { status: 201 });
}

