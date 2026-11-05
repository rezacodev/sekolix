import { redirect } from "next/navigation";
import { AlertCircle, Banknote, ClipboardList, ReceiptText } from "lucide-react";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { formatRupiah, toMoneyNumber } from "@/lib/finance/server";

export default async function FinanceReportsPage() {
  const access = await requirePermission("read", "keuangan");
  if (!access) redirect("/unauthorized");

  const [invoices, payments, arrears] = await Promise.all([
    db.studentInvoice.findMany({ select: { status: true, total_amount: true, paid_amount: true } }),
    db.studentPayment.findMany({
      where: {
        status: "VALIDATED",
        paid_at: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
      include: {
        invoice: { include: { student: { select: { fullName: true } }, billingType: { select: { name: true } } } },
      },
      orderBy: { paid_at: "desc" },
    }),
    db.studentInvoice.findMany({
      where: { status: { in: ["UNPAID", "PARTIAL"] } },
      include: {
        student: { select: { fullName: true, nisn: true } },
        billingType: { select: { name: true } },
        rombel: { select: { name: true, class: { select: { name: true } } } },
      },
      orderBy: { due_date: "asc" },
      take: 200,
    }),
  ]);

  const totalBilled = invoices.reduce((sum, invoice) => sum + toMoneyNumber(invoice.total_amount), 0);
  const totalPaid = invoices.reduce((sum, invoice) => sum + toMoneyNumber(invoice.paid_amount), 0);
  const todayPaid = payments.reduce((sum, payment) => sum + toMoneyNumber(payment.amount), 0);
  const outstanding = Math.max(0, totalBilled - totalPaid);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Keuangan/SPP</p>
        <h1 className="text-2xl font-bold">Laporan Keuangan</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={ClipboardList} label="Total Invoice" value={invoices.length} />
        <Metric icon={Banknote} label="Total Dibayar" value={formatRupiah(totalPaid)} />
        <Metric icon={AlertCircle} label="Tunggakan" value={formatRupiah(outstanding)} />
        <Metric icon={ReceiptText} label="Pembayaran Hari Ini" value={formatRupiah(todayPaid)} />
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Pembayaran Harian</h2>
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Waktu</th>
                <th className="px-3 py-2">Siswa</th>
                <th className="px-3 py-2">Tagihan</th>
                <th className="px-3 py-2 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-t">
                  <td className="px-3 py-2">{payment.paid_at.toLocaleString("id-ID")}</td>
                  <td className="px-3 py-2">{payment.invoice.student.fullName}</td>
                  <td className="px-3 py-2">{payment.invoice.billingType.name}</td>
                  <td className="px-3 py-2 text-right">{formatRupiah(payment.amount)}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={4}>Belum ada pembayaran hari ini.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Laporan Tunggakan</h2>
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Siswa</th>
                <th className="px-3 py-2">Rombel</th>
                <th className="px-3 py-2">Tagihan</th>
                <th className="px-3 py-2">Jatuh Tempo</th>
                <th className="px-3 py-2 text-right">Sisa</th>
              </tr>
            </thead>
            <tbody>
              {arrears.map((invoice) => (
                <tr key={invoice.id} className="border-t">
                  <td className="px-3 py-2">
                    <div className="font-medium">{invoice.student.fullName}</div>
                    <div className="text-xs text-slate-500">{invoice.student.nisn ?? "-"}</div>
                  </td>
                  <td className="px-3 py-2">{invoice.rombel ? `${invoice.rombel.class.name} - ${invoice.rombel.name}` : "-"}</td>
                  <td className="px-3 py-2">{invoice.billingType.name}</td>
                  <td className="px-3 py-2">{invoice.due_date.toLocaleDateString("id-ID")}</td>
                  <td className="px-3 py-2 text-right">{formatRupiah(invoice.total_amount.toNumber() - invoice.paid_amount.toNumber())}</td>
                </tr>
              ))}
              {arrears.length === 0 && (
                <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={5}>Tidak ada tunggakan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof ClipboardList; label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <Icon className="mb-3 h-5 w-5 text-emerald-700" />
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}
