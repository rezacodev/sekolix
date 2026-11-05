import { randomUUID } from "crypto";
import type { Prisma, PrismaClient } from "@prisma/client";

type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export const FINANCE_MODULE = "keuangan";

export function toMoneyNumber(value: Prisma.Decimal | number | string | null | undefined) {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return value.toNumber();
}

export function formatRupiah(value: Prisma.Decimal | number | string | null | undefined) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(toMoneyNumber(value));
}

export function getInvoiceStatus(totalAmount: Prisma.Decimal | number, paidAmount: Prisma.Decimal | number) {
  const total = toMoneyNumber(totalAmount);
  const paid = toMoneyNumber(paidAmount);
  if (paid <= 0) return "UNPAID";
  if (paid >= total) return "PAID";
  return "PARTIAL";
}

export function getPaymentDueAmount(invoice: {
  total_amount: Prisma.Decimal | number;
  paid_amount: Prisma.Decimal | number;
}) {
  return Math.max(0, toMoneyNumber(invoice.total_amount) - toMoneyNumber(invoice.paid_amount));
}

export function generateInvoiceNumber(prefix = "INV") {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${prefix}-${year}${month}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

export function generatePaymentNumber(prefix = "PAY") {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${prefix}-${year}${month}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

export async function recalculateInvoicePayment(db: TransactionClient, invoiceId: string) {
  const [invoice, payments] = await Promise.all([
    db.studentInvoice.findUnique({ where: { id: invoiceId } }),
    db.studentPayment.findMany({
      where: { invoice_id: invoiceId, status: "VALIDATED" },
      select: { amount: true },
    }),
  ]);

  if (!invoice) return null;

  const paidAmount = payments.reduce((sum, payment) => sum + toMoneyNumber(payment.amount), 0);
  const status = getInvoiceStatus(invoice.total_amount, paidAmount);

  return db.studentInvoice.update({
    where: { id: invoiceId },
    data: {
      paid_amount: paidAmount,
      status,
    },
  });
}

export function serializeInvoiceStatus(status: string) {
  const labels: Record<string, string> = {
    UNPAID: "Belum Dibayar",
    PARTIAL: "Dibayar Sebagian",
    PAID: "Lunas",
    CANCELLED: "Dibatalkan",
  };
  return labels[status] ?? status;
}

export function serializeProofStatus(status: string) {
  const labels: Record<string, string> = {
    PENDING: "Menunggu Validasi",
    APPROVED: "Disetujui",
    REJECTED: "Ditolak",
  };
  return labels[status] ?? status;
}
