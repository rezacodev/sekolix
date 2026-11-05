import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { BookOpen, LibraryBig, ReceiptText, ScanBarcode } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatRupiah, serializeLoanStatus } from "@/lib/library/server";

export default async function StudentLibraryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "MURID") redirect("/login");

  const student = session.user.email
    ? await db.pesertaDidik.findFirst({ where: { email: session.user.email, deleted_at: null } })
    : null;
  const member = student
    ? await db.libraryMember.findFirst({ where: { student_id: student.id, status: "ACTIVE" } })
    : null;

  const [books, loans] = await Promise.all([
    db.libraryBook.findMany({
      where: { is_active: true },
      include: { category: true, copies: true },
      orderBy: { title: "asc" },
      take: 100,
    }),
    member
      ? db.libraryLoan.findMany({
          where: { member_id: member.id },
          include: { copy: { include: { book: true } }, fines: true },
          orderBy: { borrowed_at: "desc" },
          take: 50,
        })
      : Promise.resolve([]),
  ]);

  const activeLoans = loans.filter((loan) => ["ACTIVE", "OVERDUE"].includes(loan.status));
  const unpaidFine = loans.reduce(
    (sum, loan) => sum + loan.fines.filter((fine) => fine.status === "UNPAID").reduce((acc, fine) => acc + fine.amount.toNumber(), 0),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">Portal Siswa</p>
        <h1 className="text-2xl font-bold">Perpustakaan</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={BookOpen} label="Judul tersedia" value={books.length} />
        <Metric icon={ScanBarcode} label="Eksemplar tersedia" value={books.reduce((sum, book) => sum + book.copies.filter((copy) => copy.status === "AVAILABLE").length, 0)} />
        <Metric icon={LibraryBig} label="Pinjaman aktif" value={activeLoans.length} />
        <Metric icon={ReceiptText} label="Denda" value={formatRupiah(unpaidFine)} />
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 text-base font-semibold">Katalog Buku</h2>
          <div className="space-y-3">
            {books.map((book) => {
              const available = book.copies.filter((copy) => copy.status === "AVAILABLE").length;
              return (
                <div key={book.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{book.title}</p>
                      <p className="text-xs text-slate-500">{book.author ?? "-"} - {book.category?.name ?? "Tanpa kategori"}</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">{available} tersedia</span>
                  </div>
                </div>
              );
            })}
            {books.length === 0 && <p className="text-sm text-slate-500">Belum ada katalog buku.</p>}
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 text-base font-semibold">Riwayat Pinjam</h2>
          <div className="space-y-3">
            {!member && <p className="text-sm text-slate-500">Akun siswa belum tersinkron sebagai anggota perpustakaan.</p>}
            {loans.map((loan) => (
              <div key={loan.id} className="rounded-lg border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{loan.copy.book.title}</p>
                    <p className="text-xs text-slate-500">
                      Pinjam {loan.borrowed_at.toLocaleDateString("id-ID")} - jatuh tempo {loan.due_at.toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold">{serializeLoanStatus(loan.status)}</span>
                </div>
              </div>
            ))}
            {member && loans.length === 0 && <p className="text-sm text-slate-500">Belum ada riwayat peminjaman.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof BookOpen; label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <Icon className="mb-3 h-5 w-5 text-emerald-700" />
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}
