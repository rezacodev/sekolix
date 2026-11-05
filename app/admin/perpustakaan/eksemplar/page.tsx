import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { formatRupiah, serializeCopyStatus } from "@/lib/library/server";
import { CopyForm } from "../_components/LibraryForms";

export default async function LibraryCopiesPage() {
  const access = await requirePermission("read", "perpustakaan");
  if (!access) redirect("/unauthorized");

  const [books, copies] = await Promise.all([
    db.libraryBook.findMany({ where: { is_active: true }, select: { id: true, title: true, author: true }, orderBy: { title: "asc" }, take: 300 }),
    db.libraryCopy.findMany({
      include: { book: { include: { category: true } } },
      orderBy: { createdAt: "desc" },
      take: 300,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Perpustakaan</p>
        <h1 className="text-2xl font-bold">Eksemplar & Barcode</h1>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Tambah Eksemplar</h2>
        <CopyForm books={books.map((book) => ({ id: book.id, label: `${book.title}${book.author ? ` - ${book.author}` : ""}` }))} />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Daftar Eksemplar</h2>
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Barcode/QR</th>
                <th className="px-3 py-2">Buku</th>
                <th className="px-3 py-2">Lokasi</th>
                <th className="px-3 py-2">Kondisi</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Harga</th>
              </tr>
            </thead>
            <tbody>
              {copies.map((copy) => (
                <tr key={copy.id} className="border-t">
                  <td className="px-3 py-2">
                    <div className="font-mono text-xs font-semibold">{copy.barcode}</div>
                    <div className="text-xs text-slate-500">{copy.qr_code ?? "QR: gunakan barcode"}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{copy.book.title}</div>
                    <div className="text-xs text-slate-500">{copy.book.category?.name ?? "-"}</div>
                  </td>
                  <td className="px-3 py-2">{copy.location ?? "-"}</td>
                  <td className="px-3 py-2">{copy.condition}</td>
                  <td className="px-3 py-2">{serializeCopyStatus(copy.status)}</td>
                  <td className="px-3 py-2 text-right">{copy.price ? formatRupiah(copy.price) : "-"}</td>
                </tr>
              ))}
              {copies.length === 0 && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={6}>Belum ada eksemplar.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
