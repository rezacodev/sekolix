import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { formatRupiah, serializeInvoiceStatus } from "@/lib/finance/server";
import { BillingTypeForm, InvoiceGenerateForm } from "../_components/FinanceForms";

export default async function FinanceInvoicesPage() {
  const access = await requirePermission("read", "keuangan");
  if (!access) redirect("/unauthorized");

  const [billingTypes, academicYears, rombels, invoices] = await Promise.all([
    db.financialBillingType.findMany({ orderBy: [{ is_active: "desc" }, { name: "asc" }] }),
    db.tahunAjaran.findMany({ where: { deleted_at: null }, orderBy: { startDate: "desc" } }),
    db.rombel.findMany({
      where: { deleted_at: null },
      include: { class: true },
      orderBy: [{ name: "asc" }],
      take: 200,
    }),
    db.studentInvoice.findMany({
      include: {
        student: { select: { fullName: true, nisn: true } },
        billingType: { select: { name: true, code: true } },
        rombel: { select: { name: true, class: { select: { name: true } } } },
      },
      orderBy: [{ due_date: "asc" }, { createdAt: "desc" }],
      take: 100,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Keuangan/SPP</p>
        <h1 className="text-2xl font-bold">Tagihan Siswa</h1>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Master Jenis Tagihan</h2>
        <BillingTypeForm />
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Kode</th>
                <th className="px-3 py-2">Nama</th>
                <th className="px-3 py-2">Frekuensi</th>
                <th className="px-3 py-2 text-right">Nominal</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {billingTypes.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-3 py-2 font-medium">{item.code}</td>
                  <td className="px-3 py-2">{item.name}</td>
                  <td className="px-3 py-2">{item.frequency}</td>
                  <td className="px-3 py-2 text-right">{formatRupiah(item.amount)}</td>
                  <td className="px-3 py-2">{item.is_active ? "Aktif" : "Nonaktif"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Generate Tagihan</h2>
        <InvoiceGenerateForm
          billingTypes={billingTypes.filter((item) => item.is_active).map((item) => ({ id: item.id, label: `${item.code} - ${item.name}` }))}
          academicYears={academicYears.map((item) => ({ id: item.id, label: item.label }))}
          rombels={rombels.map((item) => ({ id: Number(item.id), label: `${item.class.name} - ${item.name}` }))}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Daftar Tagihan Terbaru</h2>
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Invoice</th>
                <th className="px-3 py-2">Siswa</th>
                <th className="px-3 py-2">Tagihan</th>
                <th className="px-3 py-2">Jatuh Tempo</th>
                <th className="px-3 py-2 text-right">Total</th>
                <th className="px-3 py-2 text-right">Dibayar</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-t">
                  <td className="px-3 py-2 font-medium">{invoice.invoice_number}</td>
                  <td className="px-3 py-2">
                    <div>{invoice.student.fullName}</div>
                    <div className="text-xs text-slate-500">{invoice.rombel ? `${invoice.rombel.class.name} - ${invoice.rombel.name}` : invoice.student.nisn ?? "-"}</div>
                  </td>
                  <td className="px-3 py-2">{invoice.billingType.name}</td>
                  <td className="px-3 py-2">{invoice.due_date.toLocaleDateString("id-ID")}</td>
                  <td className="px-3 py-2 text-right">{formatRupiah(invoice.total_amount)}</td>
                  <td className="px-3 py-2 text-right">{formatRupiah(invoice.paid_amount)}</td>
                  <td className="px-3 py-2">{serializeInvoiceStatus(invoice.status)}</td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={7}>Belum ada tagihan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
