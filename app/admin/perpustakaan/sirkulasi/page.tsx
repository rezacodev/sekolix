import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { formatRupiah, serializeLoanStatus } from "@/lib/library/server";
import { LoanForm, ReturnLoanButton } from "../_components/LibraryForms";

export default async function LibraryCirculationPage() {
  const access = await requirePermission("read", "perpustakaan");
  if (!access) redirect("/unauthorized");

  const now = new Date();
  await db.libraryLoan.updateMany({
    where: { status: "ACTIVE", due_at: { lt: now } },
    data: { status: "OVERDUE" },
  });

  const [copies, members, loans] = await Promise.all([
    db.libraryCopy.findMany({
      where: { status: "AVAILABLE" },
      include: { book: true },
      orderBy: { barcode: "asc" },
      take: 500,
    }),
    db.libraryMember.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" }, take: 500 }),
    db.libraryLoan.findMany({
      include: {
        copy: { include: { book: true } },
        member: true,
        fines: true,
      },
      orderBy: [{ status: "asc" }, { borrowed_at: "desc" }],
      take: 200,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Perpustakaan</p>
        <h1 className="text-2xl font-bold">Sirkulasi</h1>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Peminjaman Baru</h2>
        <LoanForm
          copies={copies.map((copy) => ({ id: copy.id, label: `${copy.barcode} - ${copy.book.title}` }))}
          members={members.map((member) => ({ id: member.id, label: `${member.member_code} - ${member.name}` }))}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Transaksi Peminjaman</h2>
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Buku</th>
                <th className="px-3 py-2">Anggota</th>
                <th className="px-3 py-2">Pinjam</th>
                <th className="px-3 py-2">Jatuh Tempo</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Denda</th>
                <th className="px-3 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => (
                <tr key={loan.id} className="border-t">
                  <td className="px-3 py-2">
                    <div className="font-medium">{loan.copy.book.title}</div>
                    <div className="font-mono text-xs text-slate-500">{loan.copy.barcode}</div>
                  </td>
                  <td className="px-3 py-2">{loan.member.name}</td>
                  <td className="px-3 py-2">{loan.borrowed_at.toLocaleDateString("id-ID")}</td>
                  <td className="px-3 py-2">{loan.due_at.toLocaleDateString("id-ID")}</td>
                  <td className="px-3 py-2">{serializeLoanStatus(loan.status)}</td>
                  <td className="px-3 py-2 text-right">{formatRupiah(loan.fines.reduce((sum, fine) => sum + fine.amount.toNumber(), 0))}</td>
                  <td className="px-3 py-2">{["ACTIVE", "OVERDUE"].includes(loan.status) ? <ReturnLoanButton loanId={loan.id} /> : "-"}</td>
                </tr>
              ))}
              {loans.length === 0 && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={7}>Belum ada transaksi.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
