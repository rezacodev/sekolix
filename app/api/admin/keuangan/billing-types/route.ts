import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";

const billingTypeSchema = z.object({
  code: z.string().trim().min(2).max(32).transform((value) => value.toUpperCase()),
  name: z.string().trim().min(3).max(120),
  description: z.string().trim().max(1000).optional().nullable(),
  amount: z.coerce.number().positive(),
  frequency: z.enum(["ONE_TIME", "MONTHLY", "SEMESTER", "YEARLY"]).default("ONE_TIME"),
  is_active: z.boolean().optional(),
});

export async function GET() {
  const access = await requireApiPermission("read", "keuangan");
  if (!access.ok) return access.response;

  const billingTypes = await db.financialBillingType.findMany({
    orderBy: [{ is_active: "desc" }, { name: "asc" }],
  });

  return NextResponse.json({
    data: billingTypes.map((item) => ({
      ...item,
      amount: item.amount.toNumber(),
    })),
  });
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "keuangan");
  if (!access.ok) return access.response;

  const parsed = billingTypeSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const billingType = await db.financialBillingType.create({
    data: {
      ...parsed.data,
      created_by: access.context.user.id,
    },
  });

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "keuangan",
    action: "create_billing_type",
    entityType: "FinancialBillingType",
    entityId: billingType.id,
    metadata: { code: billingType.code, amount: billingType.amount.toString() },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "FinancialBillingType",
    entityId: billingType.id,
    action: "create",
    after: billingType,
  });

  return NextResponse.json({ data: { ...billingType, amount: billingType.amount.toNumber() } }, { status: 201 });
}
