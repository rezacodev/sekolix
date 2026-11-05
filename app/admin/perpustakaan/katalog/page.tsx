import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { BookForm, BookImportForm, CategoryForm } from "../_components/LibraryForms";

export default async function LibraryCatalogPage() {
  const access = await requirePermission("read", "perpustakaan");
  if (!access) redirect("/unauthorized");

  const [categories, books] = await Promise.all([
    db.libraryCategory.findMany({ include: { _count: { select: { books: true } } }, orderBy: { name: "asc" } }),
    db.libraryBook.findMany({
      include: { category: true, copies: true },
      orderBy: { title: "asc" },
      take: 200,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Perpustakaan</p>
        <h1 className="text-2xl font-bold">Katalog Buku</h1>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Kategori</h2>
        <CategoryForm />
        <div className="grid gap-3 md:grid-cols-4">
          {categories.map((category) => (
            <div key={category.id} className="rounded-lg border bg-white p-3">
              <p className="font-semibold">{category.name}</p>
              <p className="text-xs text-slate-500">{category.code} - {category._count.books} buku</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Tambah Buku</h2>
        <BookForm categories={categories.filter((item) => item.is_active).map((item) => ({ id: item.id, label: item.name }))} />
        <BookImportForm />
        <p className="text-xs text-slate-500">Template import: kolom A-H = Judul, ISBN, Penulis, Kategori, Penerbit, Tahun, Jumlah, Lokasi.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Daftar Buku</h2>
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Judul</th>
                <th className="px-3 py-2">Penulis</th>
                <th className="px-3 py-2">Kategori</th>
                <th className="px-3 py-2">ISBN</th>
                <th className="px-3 py-2 text-right">Eksemplar</th>
                <th className="px-3 py-2 text-right">Tersedia</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id} className="border-t">
                  <td className="px-3 py-2 font-medium">{book.title}</td>
                  <td className="px-3 py-2">{book.author ?? "-"}</td>
                  <td className="px-3 py-2">{book.category?.name ?? "-"}</td>
                  <td className="px-3 py-2">{book.isbn ?? "-"}</td>
                  <td className="px-3 py-2 text-right">{book.copies.length}</td>
                  <td className="px-3 py-2 text-right">{book.copies.filter((copy) => copy.status === "AVAILABLE").length}</td>
                </tr>
              ))}
              {books.length === 0 && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={6}>Belum ada buku.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
