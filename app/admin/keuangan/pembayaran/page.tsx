import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { formatRupiah, getPaymentDueAmount, serializeProofStatus } from "@/lib/finance/server";
import { PaymentForm, ProofReviewButtons } from "../_components/FinanceForms";

export default async function FinancePaymentsPage() {
  const access = await requirePermission("read", "keuangan");
  if (!access) redirect("/unauthorized");

  const [openInvoices, payments, proofs] = await Promise.all([
    db.studentInvoice.findMany({
      where: { status: { in: ["UNPAID", "PARTIAL"] } },
      include: {
        student: { select: { fullName: true, nisn: true } },
        billingType: { select: { name: true } },
      },
      orderBy: { due_date: "asc" },
      take: 200,
    }),
    db.studentPayment.findMany({
      include: {
        invoice: {
          include: {
            student: { select: { fullName: true } },
            billingType: { select: { name: true } },
          },
        },
      },
      orderBy: { paid_at: "desc" },
      take: 100,
    }),
    db.parentPaymentProof.findMany({
      include: {
        parent: { select: { name: true } },
        invoice: {
          include: {
            student: { select: { fullName: true } },
            billingType: { select: { name: true } },
          },
        },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 100,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Keuangan/SPP</p>
        <h1 className="text-2xl font-bold">Pembayaran</h1>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Input Pembayaran Manual</h2>
        <PaymentForm
          invoices={openInvoices.map((invoice) => ({
            id: invoice.id,
            dueAmount: getPaymentDueAmount(invoice),
            label: `${invoice.invoice_number} - ${invoice.student.fullName} - ${invoice.billingType.name} (${formatRupiah(getPaymentDueAmount(invoice))})`,
          }))}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Bukti Bayar Orang Tua</h2>
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Invoice</th>
                <th className="px-3 py-2">Orang Tua</th>
                <th className="px-3 py-2">Siswa</th>
                <th className="px-3 py-2 text-right">Nominal</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {proofs.map((proof) => (
                <tr key={proof.id} className="border-t">
                  <td className="px-3 py-2">
                    <div className="font-medium">{proof.invoice.invoice_number}</div>
                    <Link href={proof.proof_url} className="text-xs text-emerald-700 underline" target="_blank">Lihat bukti</Link>
                  </td>
                  <td className="px-3 py-2">{proof.parent.name}</td>
                  <td className="px-3 py-2">{proof.invoice.student.fullName}</td>
                  <td className="px-3 py-2 text-right">{formatRupiah(proof.amount)}</td>
                  <td className="px-3 py-2">{serializeProofStatus(proof.status)}</td>
                  <td className="px-3 py-2">{proof.status === "PENDING" ? <ProofReviewButtons proofId={proof.id} /> : "-"}</td>
                </tr>
              ))}
              {proofs.length === 0 && (
                <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={6}>Belum ada bukti bayar.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Riwayat Pembayaran</h2>
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Nomor</th>
                <th className="px-3 py-2">Siswa</th>
                <th className="px-3 py-2">Tagihan</th>
                <th className="px-3 py-2">Tanggal</th>
                <th className="px-3 py-2 text-right">Nominal</th>
                <th className="px-3 py-2">Kwitansi</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-t">
                  <td className="px-3 py-2 font-medium">{payment.payment_number}</td>
                  <td className="px-3 py-2">{payment.invoice.student.fullName}</td>
                  <td className="px-3 py-2">{payment.invoice.billingType.name}</td>
                  <td className="px-3 py-2">{payment.paid_at.toLocaleDateString("id-ID")}</td>
                  <td className="px-3 py-2 text-right">{formatRupiah(payment.amount)}</td>
                  <td className="px-3 py-2">
                    <Link href={`/api/admin/keuangan/payments/${payment.id}/receipt`} className="text-emerald-700 underline">PDF</Link>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={6}>Belum ada pembayaran.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
