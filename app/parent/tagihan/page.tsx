import { redirect } from "next/navigation";
import { CreditCard, ReceiptText } from "lucide-react";
import { db } from "@/lib/db";
import { requireParentContext } from "@/lib/parent/server";
import { formatRupiah, getPaymentDueAmount, serializeInvoiceStatus, serializeProofStatus } from "@/lib/finance/server";
import { PaymentProofForm } from "../_components/PaymentProofForm";

export default async function ParentBillingPage() {
  const context = await requireParentContext();
  if (!context) redirect("/login");

  const studentIds = context.profile.students.map((link) => link.student_id);
  const invoices = await db.studentInvoice.findMany({
    where: { student_id: { in: studentIds } },
    include: {
      student: { select: { fullName: true } },
      billingType: { select: { name: true, code: true } },
      academicYear: { select: { label: true } },
      payments: { orderBy: { paid_at: "desc" } },
      parentProofs: {
        where: { parent_id: context.profile.id },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: [{ status: "asc" }, { due_date: "asc" }],
  });

  const outstanding = invoices.reduce((sum, invoice) => sum + getPaymentDueAmount(invoice), 0);
  const paid = invoices.reduce((sum, invoice) => sum + invoice.paid_amount.toNumber(), 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">Portal Orang Tua</p>
        <h1 className="text-2xl font-bold">Tagihan</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric icon={CreditCard} label="Total Tagihan" value={formatRupiah(invoices.reduce((sum, invoice) => sum + invoice.total_amount.toNumber(), 0))} />
        <Metric icon={ReceiptText} label="Sudah Dibayar" value={formatRupiah(paid)} />
        <Metric icon={CreditCard} label="Sisa Tagihan" value={formatRupiah(outstanding)} />
      </div>

      <section className="space-y-4">
        {invoices.map((invoice) => {
          const due = getPaymentDueAmount(invoice);
          return (
            <article key={invoice.id} className="rounded-lg border bg-white p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase text-slate-500">{invoice.invoice_number}</p>
                  <h2 className="text-lg font-semibold">{invoice.billingType.name}</h2>
                  <p className="text-sm text-slate-500">{invoice.student.fullName} - {invoice.academicYear?.label ?? "Tahun ajaran tidak ditentukan"}</p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-lg font-bold text-emerald-700">{formatRupiah(invoice.total_amount)}</p>
                  <p className="text-sm text-slate-500">Sisa {formatRupiah(due)}</p>
                  <p className="text-xs text-slate-500">Jatuh tempo {invoice.due_date.toLocaleDateString("id-ID")}</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-slate-100 px-2 py-1">{serializeInvoiceStatus(invoice.status)}</span>
                {invoice.payments.map((payment) => (
                  <span key={payment.id} className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
                    Bayar {formatRupiah(payment.amount)} pada {payment.paid_at.toLocaleDateString("id-ID")}
                  </span>
                ))}
                {invoice.parentProofs.map((proof) => (
                  <span key={proof.id} className="rounded-full bg-amber-50 px-2 py-1 text-amber-700">
                    Bukti {serializeProofStatus(proof.status)}
                  </span>
                ))}
              </div>

              {due > 0 && <PaymentProofForm invoiceId={invoice.id} outstanding={due} />}
            </article>
          );
        })}
        {invoices.length === 0 && (
          <div className="rounded-lg border bg-white p-6 text-center text-sm text-slate-500">Belum ada tagihan untuk anak yang terhubung.</div>
        )}
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof CreditCard; label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <Icon className="mb-3 h-5 w-5 text-emerald-700" />
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}
