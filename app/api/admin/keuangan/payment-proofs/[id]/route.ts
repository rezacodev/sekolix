import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { generatePaymentNumber, getPaymentDueAmount, recalculateInvoicePayment } from "@/lib/finance/server";

const reviewProofSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  reviewNote: z.string().trim().max(1000).optional().nullable(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const access = await requireApiPermission("approve", "keuangan");
  if (!access.ok) return access.response;

  const { id } = await context.params;
  const parsed = reviewProofSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const before = await db.parentPaymentProof.findUnique({
    where: { id },
    include: { invoice: true, parent: true },
  });
  if (!before) return NextResponse.json({ error: "Bukti bayar tidak ditemukan" }, { status: 404 });
  if (before.status !== "PENDING") {
    return NextResponse.json({ error: "Bukti bayar sudah diproses" }, { status: 400 });
  }

  if (parsed.data.status === "APPROVED" && before.amount.toNumber() > getPaymentDueAmount(before.invoice)) {
    return NextResponse.json({ error: "Nominal bukti bayar melebihi sisa tagihan" }, { status: 400 });
  }

  const result = await db.$transaction(async (tx) => {
    const reviewedProof = await tx.parentPaymentProof.update({
      where: { id },
      data: {
        status: parsed.data.status,
        reviewed_by: access.context.user.id,
        reviewed_at: new Date(),
        review_note: parsed.data.reviewNote ?? null,
      },
    });

    let payment = null;
    let updatedInvoice = null;
    if (parsed.data.status === "APPROVED") {
      payment = await tx.studentPayment.create({
        data: {
          invoice_id: before.invoice_id,
          payment_number: generatePaymentNumber("PRF"),
          amount: before.amount,
          method: "TRANSFER",
          paid_at: before.transfer_date,
          status: "VALIDATED",
          received_by: before.parent.user_id,
          validated_by: access.context.user.id,
          proof_url: before.proof_url,
          note: parsed.data.reviewNote ?? before.note,
        },
      });
      updatedInvoice = await recalculateInvoicePayment(tx, before.invoice_id);
    }

    await tx.parentNotification.create({
      data: {
        parent_id: before.parent_id,
        student_id: before.invoice.student_id,
        type: "PAYMENT",
        title: parsed.data.status === "APPROVED" ? "Bukti bayar disetujui" : "Bukti bayar ditolak",
        message:
          parsed.data.status === "APPROVED"
            ? `Pembayaran untuk ${before.invoice.invoice_number} sudah divalidasi.`
            : `Bukti bayar untuk ${before.invoice.invoice_number} ditolak. ${parsed.data.reviewNote ?? ""}`.trim(),
        href: "/parent/tagihan",
      },
    });

    return { reviewedProof, payment, updatedInvoice };
  });

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "keuangan",
    action: "review_payment_proof",
    entityType: "ParentPaymentProof",
    entityId: id,
    metadata: { status: parsed.data.status, invoiceId: before.invoice_id },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "ParentPaymentProof",
    entityId: id,
    action: "review",
    before,
    after: result,
  });

  return NextResponse.json({
    data: {
      ...result.reviewedProof,
      amount: result.reviewedProof.amount.toNumber(),
      payment: result.payment ? { ...result.payment, amount: result.payment.amount.toNumber() } : null,
    },
  });
}
