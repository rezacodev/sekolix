import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { getStaffIdForUser } from "@/lib/staff-ops/server";

const contractSchema = z.object({
  staffId: z.string().min(1),
  contractNumber: z.string().trim().max(80).optional().nullable(),
  title: z.string().trim().min(2).max(180),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  status: z.enum(["ACTIVE", "EXPIRING", "ENDED", "CANCELLED"]).default("ACTIVE"),
  reminderDate: z.coerce.date().optional().nullable(),
  fileUrl: z.string().trim().url().optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export async function GET() {
  const access = await requireApiPermission("read", "pegawai");
  if (!access.ok) return access.response;

  const contracts = await db.staffContract.findMany({
    include: { staff: { select: { id: true, name: true, nip: true } }, creator: { select: { name: true } } },
    orderBy: [{ end_date: "asc" }, { createdAt: "desc" }],
    take: 300,
  });
  return NextResponse.json({ data: contracts });
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "pegawai");
  if (!access.ok) return access.response;

  const parsed = contractSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const [staff, creatorId] = await Promise.all([
    db.staff.findFirst({ where: { id: parsed.data.staffId, deleted_at: null } }),
    getStaffIdForUser(access.context.user.id),
  ]);
  if (!staff) return NextResponse.json({ error: "Pegawai tidak ditemukan" }, { status: 404 });

  const contract = await db.staffContract.create({
    data: {
      staff_id: staff.id,
      contract_number: parsed.data.contractNumber ?? null,
      title: parsed.data.title,
      start_date: parsed.data.startDate,
      end_date: parsed.data.endDate ?? null,
      status: parsed.data.status,
      reminder_date: parsed.data.reminderDate ?? null,
      file_url: parsed.data.fileUrl ?? null,
      created_by: creatorId,
      notes: parsed.data.notes ?? null,
    },
  });

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "pegawai",
    action: "create_staff_contract",
    entityType: "StaffContract",
    entityId: contract.id,
    metadata: { staffName: staff.name, title: contract.title },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "StaffContract",
    entityId: contract.id,
    action: "create",
    after: contract,
  });

  return NextResponse.json({ data: contract }, { status: 201 });
}

