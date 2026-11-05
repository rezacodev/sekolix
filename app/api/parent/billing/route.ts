import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireParentContext } from "@/lib/parent/server";
import { logActivity } from "@/lib/governance/server";
import { getPaymentDueAmount } from "@/lib/finance/server";

const proofSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.coerce.number().positive(),
  transferDate: z.coerce.date(),
  proofUrl: z.string().trim().url(),
  note: z.string().trim().max(1000).optional().nullable(),
});

export async function GET(request: Request) {
  const context = await requireParentContext();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const studentId = searchParams.get("studentId");
  const linkedStudentIds = context.profile.students.map((link) => link.student_id);

  if (studentId && !linkedStudentIds.includes(studentId)) {
    return NextResponse.json({ error: "Siswa di luar akses orang tua" }, { status: 403 });
  }

  const invoices = await db.studentInvoice.findMany({
    where: {
      student_id: { in: studentId ? [studentId] : linkedStudentIds },
      ...(status && status !== "ALL" ? { status } : {}),
    },
    include: {
      student: { select: { id: true, fullName: true, nisn: true } },
      billingType: { select: { id: true, code: true, name: true } },
      academicYear: { select: { id: true, label: true } },
      rombel: { select: { id: true, name: true, class: { select: { name: true } } } },
      payments: { orderBy: { paid_at: "desc" } },
      parentProofs: {
        where: { parent_id: context.profile.id },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: [{ status: "asc" }, { due_date: "asc" }],
  });

  return NextResponse.json({
    data: invoices.map((invoice) => ({
      ...invoice,
      rombel_id: invoice.rombel_id ? Number(invoice.rombel_id) : null,
      subtotal: invoice.subtotal.toNumber(),
      discount_amount: invoice.discount_amount.toNumber(),
      late_fee_amount: invoice.late_fee_amount.toNumber(),
      total_amount: invoice.total_amount.toNumber(),
      paid_amount: invoice.paid_amount.toNumber(),
      outstanding: getPaymentDueAmount(invoice),
      payments: invoice.payments.map((payment) => ({ ...payment, amount: payment.amount.toNumber() })),
      parentProofs: invoice.parentProofs.map((proof) => ({ ...proof, amount: proof.amount.toNumber() })),
    })),
  });
}

export async function POST(request: Request) {
  const context = await requireParentContext();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = proofSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const invoice = await db.studentInvoice.findUnique({
    where: { id: parsed.data.invoiceId },
    include: { student: true },
  });
  if (!invoice) return NextResponse.json({ error: "Tagihan tidak ditemukan" }, { status: 404 });

  const linkedStudentIds = context.profile.students.map((link) => link.student_id);
  if (!linkedStudentIds.includes(invoice.student_id)) {
    return NextResponse.json({ error: "Tagihan di luar akses orang tua" }, { status: 403 });
  }

  if (invoice.status === "PAID") {
    return NextResponse.json({ error: "Tagihan sudah lunas" }, { status: 400 });
  }

  if (parsed.data.amount > getPaymentDueAmount(invoice)) {
    return NextResponse.json({ error: "Nominal bukti bayar melebihi sisa tagihan" }, { status: 400 });
  }

  const proof = await db.parentPaymentProof.create({
    data: {
      invoice_id: invoice.id,
      parent_id: context.profile.id,
      amount: parsed.data.amount,
      transfer_date: parsed.data.transferDate,
      proof_url: parsed.data.proofUrl,
      note: parsed.data.note ?? null,
      status: "PENDING",
    },
  });

  await logActivity({
    actorUserId: context.user.id,
    actorName: context.profile.name,
    module: "keuangan",
    action: "upload_payment_proof",
    entityType: "ParentPaymentProof",
    entityId: proof.id,
    metadata: { invoiceId: invoice.id, amount: proof.amount.toString() },
    request,
  });

  return NextResponse.json({ data: { ...proof, amount: proof.amount.toNumber() } }, { status: 201 });
}
