import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { generatePaymentNumber, getPaymentDueAmount, recalculateInvoicePayment } from "@/lib/finance/server";

const paymentSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.coerce.number().positive(),
  method: z.enum(["CASH", "TRANSFER", "CARD", "OTHER"]).default("CASH"),
  paidAt: z.coerce.date().default(() => new Date()),
  proofUrl: z.string().trim().url().optional().nullable(),
  note: z.string().trim().max(1000).optional().nullable(),
});

export async function GET(request: Request) {
  const access = await requireApiPermission("read", "keuangan");
  if (!access.ok) return access.response;

  const { searchParams } = new URL(request.url);
  const invoiceId = searchParams.get("invoiceId");
  const status = searchParams.get("status");

  const payments = await db.studentPayment.findMany({
    where: {
      ...(invoiceId ? { invoice_id: invoiceId } : {}),
      ...(status && status !== "ALL" ? { status } : {}),
    },
    include: {
      invoice: {
        include: {
          student: { select: { id: true, fullName: true, nisn: true } },
          billingType: { select: { id: true, code: true, name: true } },
        },
      },
    },
    orderBy: { paid_at: "desc" },
    take: 200,
  });

  return NextResponse.json({
    data: payments.map((payment) => ({
      ...payment,
      amount: payment.amount.toNumber(),
      invoice: {
        ...payment.invoice,
        rombel_id: payment.invoice.rombel_id ? Number(payment.invoice.rombel_id) : null,
        subtotal: payment.invoice.subtotal.toNumber(),
        discount_amount: payment.invoice.discount_amount.toNumber(),
        late_fee_amount: payment.invoice.late_fee_amount.toNumber(),
        total_amount: payment.invoice.total_amount.toNumber(),
        paid_amount: payment.invoice.paid_amount.toNumber(),
      },
    })),
  });
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "keuangan");
  if (!access.ok) return access.response;

  const parsed = paymentSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const invoice = await db.studentInvoice.findUnique({
    where: { id: parsed.data.invoiceId },
    include: { parentProofs: { where: { status: "PENDING" } } },
  });
  if (!invoice) return NextResponse.json({ error: "Tagihan tidak ditemukan" }, { status: 404 });
  if (invoice.status === "PAID") return NextResponse.json({ error: "Tagihan sudah lunas" }, { status: 400 });

  const dueAmount = getPaymentDueAmount(invoice);
  if (parsed.data.amount > dueAmount) {
    return NextResponse.json({ error: "Nominal pembayaran melebihi sisa tagihan" }, { status: 400 });
  }

  const result = await db.$transaction(async (tx) => {
    const payment = await tx.studentPayment.create({
      data: {
        invoice_id: invoice.id,
        payment_number: generatePaymentNumber(),
        amount: parsed.data.amount,
        method: parsed.data.method,
        paid_at: parsed.data.paidAt,
        status: "VALIDATED",
        received_by: access.context.user.id,
        validated_by: access.context.user.id,
        proof_url: parsed.data.proofUrl ?? null,
        note: parsed.data.note ?? null,
      },
    });

    const updatedInvoice = await recalculateInvoicePayment(tx, invoice.id);
    return { payment, updatedInvoice };
  });

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "keuangan",
    action: "create_payment",
    entityType: "StudentPayment",
    entityId: result.payment.id,
    metadata: { invoiceId: invoice.id, amount: result.payment.amount.toString() },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "StudentPayment",
    entityId: result.payment.id,
    action: "create",
    before: invoice,
    after: result,
  });

  return NextResponse.json({
    data: {
      ...result.payment,
      amount: result.payment.amount.toNumber(),
      invoice: result.updatedInvoice
        ? {
            ...result.updatedInvoice,
            rombel_id: result.updatedInvoice.rombel_id ? Number(result.updatedInvoice.rombel_id) : null,
            subtotal: result.updatedInvoice.subtotal.toNumber(),
            discount_amount: result.updatedInvoice.discount_amount.toNumber(),
            late_fee_amount: result.updatedInvoice.late_fee_amount.toNumber(),
            total_amount: result.updatedInvoice.total_amount.toNumber(),
            paid_amount: result.updatedInvoice.paid_amount.toNumber(),
          }
        : null,
    },
  }, { status: 201 });
}
