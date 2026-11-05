import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";

const updateBillingTypeSchema = z.object({
  code: z.string().trim().min(2).max(32).transform((value) => value.toUpperCase()).optional(),
  name: z.string().trim().min(3).max(120).optional(),
  description: z.string().trim().max(1000).optional().nullable(),
  amount: z.coerce.number().positive().optional(),
  frequency: z.enum(["ONE_TIME", "MONTHLY", "SEMESTER", "YEARLY"]).optional(),
  is_active: z.boolean().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const access = await requireApiPermission("update", "keuangan");
  if (!access.ok) return access.response;

  const { id } = await context.params;
  const parsed = updateBillingTypeSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const before = await db.financialBillingType.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: "Jenis tagihan tidak ditemukan" }, { status: 404 });

  const after = await db.financialBillingType.update({
    where: { id },
    data: parsed.data,
  });

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "keuangan",
    action: "update_billing_type",
    entityType: "FinancialBillingType",
    entityId: id,
    metadata: { code: after.code },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "FinancialBillingType",
    entityId: id,
    action: "update",
    before,
    after,
  });

  return NextResponse.json({ data: { ...after, amount: after.amount.toNumber() } });
}

export async function DELETE(request: Request, context: RouteContext) {
  const access = await requireApiPermission("delete", "keuangan");
  if (!access.ok) return access.response;

  const { id } = await context.params;
  const before = await db.financialBillingType.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: "Jenis tagihan tidak ditemukan" }, { status: 404 });

  const after = await db.financialBillingType.update({
    where: { id },
    data: { is_active: false },
  });

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "keuangan",
    action: "deactivate_billing_type",
    entityType: "FinancialBillingType",
    entityId: id,
    metadata: { code: after.code },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "FinancialBillingType",
    entityId: id,
    action: "deactivate",
    before,
    after,
  });

  return NextResponse.json({ data: { id, is_active: false } });
}
