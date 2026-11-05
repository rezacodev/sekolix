import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { generateAssetCode, generateAssetQrPayload, getStaffIdForUser } from "@/lib/inventory/server";

const assetSchema = z.object({
  categoryId: z.string().optional().nullable(),
  locationId: z.string().optional().nullable(),
  roomId: z.coerce.number().int().positive().optional().nullable(),
  responsibleStaffId: z.string().optional().nullable(),
  assetCode: z.string().trim().max(40).optional().nullable(),
  name: z.string().trim().min(2).max(180),
  brand: z.string().trim().max(120).optional().nullable(),
  model: z.string().trim().max(120).optional().nullable(),
  serialNumber: z.string().trim().max(120).optional().nullable(),
  purchaseDate: z.coerce.date().optional().nullable(),
  purchasePrice: z.coerce.number().min(0).optional().nullable(),
  source: z.string().trim().max(120).optional().nullable(),
  condition: z.enum(["GOOD", "FAIR", "DAMAGED", "BROKEN"]).default("GOOD"),
  status: z.enum(["ACTIVE", "BORROWED", "MAINTENANCE", "LOST", "DISPOSED"]).default("ACTIVE"),
  imageUrl: z.string().trim().url().optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

function serializeAsset(asset: Awaited<ReturnType<typeof db.asset.findMany>>[number]) {
  return {
    ...asset,
    purchase_price: asset.purchase_price?.toNumber() ?? null,
    room_id: asset.room_id?.toString() ?? null,
  };
}

export async function GET(request: Request) {
  const access = await requireApiPermission("read", "inventaris");
  if (!access.ok) return access.response;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim();
  const status = searchParams.get("status")?.trim();
  const condition = searchParams.get("condition")?.trim();
  const code = searchParams.get("code")?.trim();

  const assets = await db.asset.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(condition ? { condition } : {}),
      ...(code ? { asset_code: code } : {}),
      ...(search
        ? {
            OR: [
              { asset_code: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } },
              { brand: { contains: search, mode: "insensitive" } },
              { serial_number: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      category: true,
      location: true,
      room: true,
      responsibleStaff: { select: { id: true, name: true } },
      maintenances: { orderBy: { scheduled_at: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
    take: 300,
  });

  return NextResponse.json({ data: assets.map(serializeAsset) });
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "inventaris");
  if (!access.ok) return access.response;

  const parsed = assetSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const assetCode = parsed.data.assetCode?.trim().toUpperCase() || generateAssetCode();
  const [category, location, room, responsibleStaff, creatorStaffId] = await Promise.all([
    parsed.data.categoryId ? db.assetCategory.findUnique({ where: { id: parsed.data.categoryId } }) : null,
    parsed.data.locationId ? db.assetLocation.findUnique({ where: { id: parsed.data.locationId } }) : null,
    parsed.data.roomId ? db.room.findUnique({ where: { id: parsed.data.roomId } }) : null,
    parsed.data.responsibleStaffId ? db.staff.findUnique({ where: { id: parsed.data.responsibleStaffId } }) : null,
    getStaffIdForUser(access.context.user.id),
  ]);

  if (parsed.data.categoryId && !category) return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 });
  if (parsed.data.locationId && !location) return NextResponse.json({ error: "Lokasi tidak ditemukan" }, { status: 404 });
  if (parsed.data.roomId && !room) return NextResponse.json({ error: "Ruang tidak ditemukan" }, { status: 404 });
  if (parsed.data.responsibleStaffId && !responsibleStaff) return NextResponse.json({ error: "Penanggung jawab tidak ditemukan" }, { status: 404 });

  const result = await db.$transaction(async (tx) => {
    const asset = await tx.asset.create({
      data: {
        asset_code: assetCode,
        name: parsed.data.name,
        category_id: parsed.data.categoryId ?? null,
        location_id: parsed.data.locationId ?? null,
        room_id: parsed.data.roomId ?? null,
        responsible_staff_id: parsed.data.responsibleStaffId ?? null,
        brand: parsed.data.brand ?? null,
        model: parsed.data.model ?? null,
        serial_number: parsed.data.serialNumber ?? null,
        purchase_date: parsed.data.purchaseDate ?? null,
        purchase_price: parsed.data.purchasePrice ?? null,
        source: parsed.data.source ?? null,
        condition: parsed.data.condition,
        status: parsed.data.status,
        qr_code: generateAssetQrPayload(assetCode),
        image_url: parsed.data.imageUrl ?? null,
        notes: parsed.data.notes ?? null,
        created_by: access.context.user.id,
      },
    });
    await tx.assetConditionHistory.create({
      data: {
        asset_id: asset.id,
        condition: asset.condition,
        status: asset.status,
        checked_by: creatorStaffId,
        description: "Kondisi awal saat aset didaftarkan.",
      },
    });
    await tx.assetLocationHistory.create({
      data: {
        asset_id: asset.id,
        to_location_id: asset.location_id,
        to_room_id: asset.room_id,
        moved_by: creatorStaffId,
        reason: "Lokasi awal saat aset didaftarkan.",
      },
    });
    return asset;
  });

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "inventaris",
    action: "create_asset",
    entityType: "Asset",
    entityId: result.id,
    metadata: { assetCode: result.asset_code, name: result.name },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "Asset",
    entityId: result.id,
    action: "create",
    after: result,
  });

  return NextResponse.json({ data: result }, { status: 201 });
}

