import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle, Banknote, FileText, ReceiptText, WalletCards } from "lucide-react";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { formatRupiah, toMoneyNumber } from "@/lib/finance/server";

export default async function FinanceDashboardPage() {
  const access = await requirePermission("read", "keuangan");
  if (!access) redirect("/unauthorized");

  const [invoices, paymentsToday, pendingProofs, billingTypes] = await Promise.all([
    db.studentInvoice.findMany({ select: { status: true, total_amount: true, paid_amount: true } }),
    db.studentPayment.findMany({
      where: {
        status: "VALIDATED",
        paid_at: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
      select: { amount: true },
    }),
    db.parentPaymentProof.count({ where: { status: "PENDING" } }),
    db.financialBillingType.count({ where: { is_active: true } }),
  ]);

  const totalBilled = invoices.reduce((sum, item) => sum + toMoneyNumber(item.total_amount), 0);
  const totalPaid = invoices.reduce((sum, item) => sum + toMoneyNumber(item.paid_amount), 0);
  const todayPaid = paymentsToday.reduce((sum, item) => sum + toMoneyNumber(item.amount), 0);
  const outstanding = Math.max(0, totalBilled - totalPaid);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Operasional</p>
        <h1 className="text-2xl font-bold">Keuangan/SPP</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={WalletCards} label="Total Tagihan" value={formatRupiah(totalBilled)} />
        <Metric icon={Banknote} label="Sudah Dibayar" value={formatRupiah(totalPaid)} />
        <Metric icon={AlertCircle} label="Tunggakan" value={formatRupiah(outstanding)} />
        <Metric icon={ReceiptText} label="Bayar Hari Ini" value={formatRupiah(todayPaid)} />
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <QuickLink href="/admin/keuangan/tagihan" icon={FileText} title="Tagihan" description={`${billingTypes} jenis tagihan aktif, generate invoice siswa.`} />
        <QuickLink href="/admin/keuangan/pembayaran" icon={ReceiptText} title="Pembayaran" description={`${pendingProofs} bukti bayar orang tua menunggu validasi.`} />
        <QuickLink href="/admin/keuangan/laporan" icon={Banknote} title="Laporan" description="Rekap pembayaran harian dan daftar tunggakan." />
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof WalletCards; label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

function QuickLink({ href, icon: Icon, title, description }: { href: string; icon: typeof FileText; title: string; description: string }) {
  return (
    <Link href={href} className="rounded-lg border bg-white p-4 transition hover:border-emerald-300 hover:bg-emerald-50/40">
      <Icon className="mb-4 h-5 w-5 text-emerald-700" />
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}
