import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { DEFAULT_ASSET_LOAN_DAYS, getStaffIdForUser } from "@/lib/inventory/server";

const loanSchema = z.object({
  assetId: z.string().min(1),
  roomId: z.coerce.number().int().positive().optional().nullable(),
  borrowerName: z.string().trim().min(2).max(160),
  borrowerType: z.string().trim().min(2).max(60).default("STAFF"),
  purpose: z.string().trim().min(3).max(2000),
  startAt: z.coerce.date().optional(),
  dueAt: z.coerce.date().optional(),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export async function GET() {
  const access = await requireApiPermission("read", "inventaris");
  if (!access.ok) return access.response;

  const loans = await db.assetLoan.findMany({
    include: {
      asset: { include: { category: true, location: true } },
      room: true,
      requester: { select: { name: true } },
      approver: { select: { name: true } },
    },
    orderBy: [{ status: "asc" }, { start_at: "desc" }],
    take: 300,
  });
  return NextResponse.json({ data: loans });
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "inventaris");
  if (!access.ok) return access.response;

  const parsed = loanSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const [asset, room, staffId] = await Promise.all([
    db.asset.findUnique({ where: { id: parsed.data.assetId } }),
    parsed.data.roomId ? db.room.findUnique({ where: { id: parsed.data.roomId } }) : null,
    getStaffIdForUser(access.context.user.id),
  ]);
  if (!asset) return NextResponse.json({ error: "Aset tidak ditemukan" }, { status: 404 });
  if (parsed.data.roomId && !room) return NextResponse.json({ error: "Ruang tidak ditemukan" }, { status: 404 });
  if (asset.status !== "ACTIVE") return NextResponse.json({ error: "Aset tidak tersedia untuk dipinjam" }, { status: 400 });

  const startAt = parsed.data.startAt ?? new Date();
  const dueAt = parsed.data.dueAt ?? new Date(startAt.getTime() + DEFAULT_ASSET_LOAN_DAYS * 24 * 60 * 60 * 1000);
  const result = await db.$transaction(async (tx) => {
    const loan = await tx.assetLoan.create({
      data: {
        asset_id: asset.id,
        room_id: parsed.data.roomId ?? null,
        borrower_name: parsed.data.borrowerName,
        borrower_type: parsed.data.borrowerType,
        requester_id: staffId,
        approved_by: staffId,
        purpose: parsed.data.purpose,
        start_at: startAt,
        due_at: dueAt,
        status: "BORROWED",
        condition_out: asset.condition,
        notes: parsed.data.notes ?? null,
      },
    });
    const updatedAsset = await tx.asset.update({
      where: { id: asset.id },
      data: { status: "BORROWED" },
    });
    return { loan, updatedAsset };
  });

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "inventaris",
    action: "create_asset_loan",
    entityType: "AssetLoan",
    entityId: result.loan.id,
    metadata: { assetCode: asset.asset_code, borrowerName: parsed.data.borrowerName },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "AssetLoan",
    entityId: result.loan.id,
    action: "create",
    before: asset,
    after: result,
  });

  return NextResponse.json({ data: result.loan }, { status: 201 });
}

