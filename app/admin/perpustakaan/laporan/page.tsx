import { redirect } from "next/navigation";
import { AlertTriangle, BookOpen, LibraryBig, ReceiptText, ScanBarcode } from "lucide-react";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { formatRupiah } from "@/lib/library/server";

export default async function LibraryReportsPage() {
  const access = await requirePermission("read", "perpustakaan");
  if (!access) redirect("/unauthorized");

  const now = new Date();
  const [books, copies, activeLoans, overdueLoans, fines, popularRaw, lateLoans] = await Promise.all([
    db.libraryBook.count({ where: { is_active: true } }),
    db.libraryCopy.count(),
    db.libraryLoan.count({ where: { status: "ACTIVE" } }),
    db.libraryLoan.count({ where: { OR: [{ status: "OVERDUE" }, { status: "ACTIVE", due_at: { lt: now } }] } }),
    db.libraryFine.findMany({ where: { status: "UNPAID" }, select: { amount: true } }),
    db.libraryLoan.groupBy({ by: ["copy_id"], _count: { _all: true }, orderBy: { _count: { copy_id: "desc" } }, take: 20 }),
    db.libraryLoan.findMany({
      where: { OR: [{ status: "OVERDUE" }, { status: "ACTIVE", due_at: { lt: now } }] },
      include: { copy: { include: { book: true } }, member: true },
      orderBy: { due_at: "asc" },
      take: 50,
    }),
  ]);

  const copyIds = popularRaw.map((item) => item.copy_id);
  const popularCopies = await db.libraryCopy.findMany({ where: { id: { in: copyIds } }, include: { book: true } });
  const copyMap = new Map(popularCopies.map((copy) => [copy.id, copy]));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Perpustakaan</p>
        <h1 className="text-2xl font-bold">Laporan</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Metric icon={BookOpen} label="Buku" value={books} />
        <Metric icon={ScanBarcode} label="Eksemplar" value={copies} />
        <Metric icon={LibraryBig} label="Pinjaman aktif" value={activeLoans} />
        <Metric icon={AlertTriangle} label="Terlambat" value={overdueLoans} />
        <Metric icon={ReceiptText} label="Denda belum bayar" value={formatRupiah(fines.reduce((sum, fine) => sum + fine.amount.toNumber(), 0))} />
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg border bg-white">
          <div className="border-b px-4 py-3 font-semibold">Buku Populer</div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Buku</th>
                <th className="px-3 py-2">Barcode</th>
                <th className="px-3 py-2 text-right">Dipinjam</th>
              </tr>
            </thead>
            <tbody>
              {popularRaw.map((item) => {
                const copy = copyMap.get(item.copy_id);
                return (
                  <tr key={item.copy_id} className="border-t">
                    <td className="px-3 py-2">{copy?.book.title ?? "-"}</td>
                    <td className="px-3 py-2 font-mono text-xs">{copy?.barcode ?? "-"}</td>
                    <td className="px-3 py-2 text-right">{item._count._all}</td>
                  </tr>
                );
              })}
              {popularRaw.length === 0 && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={3}>Belum ada data peminjaman.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="overflow-hidden rounded-lg border bg-white">
          <div className="border-b px-4 py-3 font-semibold">Pinjaman Terlambat</div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Anggota</th>
                <th className="px-3 py-2">Buku</th>
                <th className="px-3 py-2">Jatuh Tempo</th>
              </tr>
            </thead>
            <tbody>
              {lateLoans.map((loan) => (
                <tr key={loan.id} className="border-t">
                  <td className="px-3 py-2">{loan.member.name}</td>
                  <td className="px-3 py-2">{loan.copy.book.title}</td>
                  <td className="px-3 py-2">{loan.due_at.toLocaleDateString("id-ID")}</td>
                </tr>
              ))}
              {lateLoans.length === 0 && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={3}>Tidak ada pinjaman terlambat.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof BookOpen; label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <Icon className="mb-3 h-5 w-5 text-emerald-700" />
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}
