import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, LibraryBig, ScanBarcode, Users, AlertTriangle, ReceiptText } from "lucide-react";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { formatRupiah } from "@/lib/library/server";

export default async function LibraryDashboardPage() {
  const access = await requirePermission("read", "perpustakaan");
  if (!access) redirect("/unauthorized");

  const now = new Date();
  const [books, copies, members, activeLoans, overdueLoans, unpaidFines] = await Promise.all([
    db.libraryBook.count({ where: { is_active: true } }),
    db.libraryCopy.count(),
    db.libraryMember.count({ where: { status: "ACTIVE" } }),
    db.libraryLoan.count({ where: { status: "ACTIVE" } }),
    db.libraryLoan.count({ where: { OR: [{ status: "OVERDUE" }, { status: "ACTIVE", due_at: { lt: now } }] } }),
    db.libraryFine.findMany({ where: { status: "UNPAID" }, select: { amount: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Operasional</p>
        <h1 className="text-2xl font-bold">Perpustakaan</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Metric icon={BookOpen} label="Judul Buku" value={books} />
        <Metric icon={ScanBarcode} label="Eksemplar" value={copies} />
        <Metric icon={Users} label="Anggota" value={members} />
        <Metric icon={LibraryBig} label="Dipinjam" value={activeLoans} />
        <Metric icon={AlertTriangle} label="Terlambat" value={overdueLoans} />
        <Metric icon={ReceiptText} label="Denda" value={formatRupiah(unpaidFines.reduce((sum, fine) => sum + fine.amount.toNumber(), 0))} />
      </div>

      <section className="grid gap-4 md:grid-cols-5">
        <QuickLink href="/admin/perpustakaan/katalog" title="Katalog" description="Kelola kategori, buku, dan import Excel." icon={BookOpen} />
        <QuickLink href="/admin/perpustakaan/eksemplar" title="Eksemplar" description="Barcode, status fisik, dan lokasi rak." icon={ScanBarcode} />
        <QuickLink href="/admin/perpustakaan/anggota" title="Anggota" description="Siswa dan GTK sebagai anggota." icon={Users} />
        <QuickLink href="/admin/perpustakaan/sirkulasi" title="Sirkulasi" description="Peminjaman, pengembalian, dan denda." icon={LibraryBig} />
        <QuickLink href="/admin/perpustakaan/laporan" title="Laporan" description="Buku populer dan keterlambatan." icon={ReceiptText} />
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

function QuickLink({ href, title, description, icon: Icon }: { href: string; title: string; description: string; icon: typeof BookOpen }) {
  return (
    <Link href={href} className="rounded-lg border bg-white p-4 transition hover:border-emerald-300 hover:bg-emerald-50/40">
      <Icon className="mb-4 h-5 w-5 text-emerald-700" />
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}
