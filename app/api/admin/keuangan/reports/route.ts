import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { toMoneyNumber } from "@/lib/finance/server";

export async function GET(request: Request) {
  const access = await requireApiPermission("read", "keuangan");
  if (!access.ok) return access.response;

  const { searchParams } = new URL(request.url);
  const academicYearId = searchParams.get("academicYearId");
  const rombelId = searchParams.get("rombelId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const invoiceWhere = {
    ...(academicYearId ? { academic_year_id: academicYearId } : {}),
    ...(rombelId ? { rombel_id: BigInt(rombelId) } : {}),
  };

  const paymentWhere = {
    status: "VALIDATED",
    ...(from || to
      ? {
          paid_at: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),
    invoice: invoiceWhere,
  };

  const [invoices, payments, arrearsByClass, recentPayments, pendingProofs] = await Promise.all([
    db.studentInvoice.findMany({
      where: invoiceWhere,
      select: { status: true, total_amount: true, paid_amount: true },
    }),
    db.studentPayment.findMany({
      where: paymentWhere,
      select: { amount: true, paid_at: true },
      orderBy: { paid_at: "desc" },
      take: 1000,
    }),
    db.studentInvoice.findMany({
      where: { ...invoiceWhere, status: { in: ["UNPAID", "PARTIAL"] } },
      include: {
        student: { select: { fullName: true, nisn: true } },
        billingType: { select: { name: true } },
        rombel: { select: { id: true, name: true, class: { select: { name: true } } } },
      },
      orderBy: [{ due_date: "asc" }],
      take: 200,
    }),
    db.studentPayment.findMany({
      where: paymentWhere,
      include: {
        invoice: {
          include: {
            student: { select: { fullName: true } },
            billingType: { select: { name: true } },
          },
        },
      },
      orderBy: { paid_at: "desc" },
      take: 25,
    }),
    db.parentPaymentProof.count({ where: { status: "PENDING" } }),
  ]);

  const totalBilled = invoices.reduce((sum, invoice) => sum + toMoneyNumber(invoice.total_amount), 0);
  const totalPaid = invoices.reduce((sum, invoice) => sum + toMoneyNumber(invoice.paid_amount), 0);
  const totalOutstanding = Math.max(0, totalBilled - totalPaid);
  const dailyPayments = payments.reduce<Record<string, number>>((acc, payment) => {
    const key = payment.paid_at.toISOString().slice(0, 10);
    acc[key] = (acc[key] ?? 0) + toMoneyNumber(payment.amount);
    return acc;
  }, {});

  return NextResponse.json({
    data: {
      metrics: {
        invoiceCount: invoices.length,
        paidCount: invoices.filter((invoice) => invoice.status === "PAID").length,
        unpaidCount: invoices.filter((invoice) => invoice.status === "UNPAID").length,
        partialCount: invoices.filter((invoice) => invoice.status === "PARTIAL").length,
        totalBilled,
        totalPaid,
        totalOutstanding,
        pendingProofs,
      },
      dailyPayments: Object.entries(dailyPayments)
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => b.date.localeCompare(a.date)),
      arrears: arrearsByClass.map((invoice) => ({
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        student: invoice.student,
        billingType: invoice.billingType,
        rombel: invoice.rombel
          ? { id: Number(invoice.rombel.id), name: invoice.rombel.name, className: invoice.rombel.class.name }
          : null,
        due_date: invoice.due_date,
        status: invoice.status,
        total_amount: invoice.total_amount.toNumber(),
        paid_amount: invoice.paid_amount.toNumber(),
        outstanding: Math.max(0, invoice.total_amount.toNumber() - invoice.paid_amount.toNumber()),
      })),
      recentPayments: recentPayments.map((payment) => ({
        ...payment,
        amount: payment.amount.toNumber(),
      })),
    },
  });
}
