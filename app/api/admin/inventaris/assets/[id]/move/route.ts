import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { getStaffIdForUser } from "@/lib/inventory/server";

const moveSchema = z.object({
  locationId: z.string().optional().nullable(),
  roomId: z.coerce.number().int().positive().optional().nullable(),
  reason: z.string().trim().max(1000).optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await requireApiPermission("update", "inventaris");
  if (!access.ok) return access.response;

  const { id } = await context.params;
  const parsed = moveSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const [asset, location, room, staffId] = await Promise.all([
    db.asset.findUnique({ where: { id } }),
    parsed.data.locationId ? db.assetLocation.findUnique({ where: { id: parsed.data.locationId } }) : null,
    parsed.data.roomId ? db.room.findUnique({ where: { id: parsed.data.roomId } }) : null,
    getStaffIdForUser(access.context.user.id),
  ]);
  if (!asset) return NextResponse.json({ error: "Aset tidak ditemukan" }, { status: 404 });
  if (parsed.data.locationId && !location) return NextResponse.json({ error: "Lokasi tujuan tidak ditemukan" }, { status: 404 });
  if (parsed.data.roomId && !room) return NextResponse.json({ error: "Ruang tujuan tidak ditemukan" }, { status: 404 });

  const result = await db.$transaction(async (tx) => {
    const updated = await tx.asset.update({
      where: { id },
      data: {
        location_id: parsed.data.locationId ?? null,
        room_id: parsed.data.roomId ?? null,
      },
    });
    const history = await tx.assetLocationHistory.create({
      data: {
        asset_id: id,
        from_location_id: asset.location_id,
        to_location_id: parsed.data.locationId ?? null,
        from_room_id: asset.room_id,
        to_room_id: parsed.data.roomId ?? null,
        moved_by: staffId,
        reason: parsed.data.reason ?? null,
        notes: parsed.data.notes ?? null,
      },
    });
    return { updated, history };
  });

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "inventaris",
    action: "move_asset",
    entityType: "Asset",
    entityId: id,
    metadata: { fromLocationId: asset.location_id, toLocationId: parsed.data.locationId ?? null },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "Asset",
    entityId: id,
    action: "move",
    before: asset,
    after: result,
    reason: parsed.data.reason ?? null,
  });

  return NextResponse.json({ data: result.updated });
}

