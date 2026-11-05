"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BookPlus, FileSpreadsheet, RefreshCcw, RotateCcw, ScanBarcode, Send, Tags } from "lucide-react";

type Option = { id: string; label: string };

async function submitJson(url: string, body: unknown, method = "POST") {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error ?? "Proses gagal");
  return payload;
}

function Message({ text }: { text: string }) {
  return text ? <span className="text-sm text-slate-600">{text}</span> : null;
}

export function CategoryForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitJson("/api/admin/perpustakaan/categories", {
        code: form.get("code"),
        name: form.get("name"),
        description: form.get("description"),
      });
      event.currentTarget.reset();
      setMessage("Kategori tersimpan.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan kategori.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-3">
      <input name="code" placeholder="Kode" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="name" placeholder="Nama kategori" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="description" placeholder="Deskripsi" className="rounded-md border px-3 py-2 text-sm" />
      <div className="flex items-center gap-3 md:col-span-3">
        <button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
          <Tags className="h-4 w-4" />
          {pending ? "Menyimpan..." : "Tambah Kategori"}
        </button>
        <Message text={message} />
      </div>
    </form>
  );
}

export function BookForm({ categories }: { categories: Option[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitJson("/api/admin/perpustakaan/books", {
        categoryId: form.get("categoryId") || null,
        isbn: form.get("isbn") || null,
        title: form.get("title"),
        author: form.get("author"),
        publisher: form.get("publisher"),
        publicationYear: form.get("publicationYear") || null,
        pages: form.get("pages") || null,
        location: form.get("location"),
        coverUrl: form.get("coverUrl") || null,
        description: form.get("description"),
      });
      event.currentTarget.reset();
      setMessage("Buku tersimpan.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan buku.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-3">
      <select name="categoryId" className="rounded-md border px-3 py-2 text-sm">
        <option value="">Tanpa kategori</option>
        {categories.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
      </select>
      <input name="isbn" placeholder="ISBN" className="rounded-md border px-3 py-2 text-sm" />
      <input name="title" placeholder="Judul buku" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="author" placeholder="Penulis" className="rounded-md border px-3 py-2 text-sm" />
      <input name="publisher" placeholder="Penerbit" className="rounded-md border px-3 py-2 text-sm" />
      <input name="publicationYear" type="number" min="1000" max="2100" placeholder="Tahun" className="rounded-md border px-3 py-2 text-sm" />
      <input name="pages" type="number" min="1" placeholder="Halaman" className="rounded-md border px-3 py-2 text-sm" />
      <input name="location" placeholder="Rak/lokasi" className="rounded-md border px-3 py-2 text-sm" />
      <input name="coverUrl" type="url" placeholder="URL cover opsional" className="rounded-md border px-3 py-2 text-sm" />
      <textarea name="description" placeholder="Deskripsi" className="rounded-md border px-3 py-2 text-sm md:col-span-3" />
      <div className="flex items-center gap-3 md:col-span-3">
        <button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
          <BookPlus className="h-4 w-4" />
          {pending ? "Menyimpan..." : "Tambah Buku"}
        </button>
        <Message text={message} />
      </div>
    </form>
  );
}

export function BookImportForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/perpustakaan/books/import", { method: "POST", body: form });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(payload.error ?? "Import gagal.");
    } else {
      setMessage(`Import selesai: ${payload.data.createdBooks} buku, ${payload.data.createdCopies} eksemplar.`);
      router.refresh();
    }
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-3 rounded-lg border bg-white p-4">
      <input name="file" type="file" accept=".xlsx" className="text-sm" required />
      <button disabled={pending} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold disabled:opacity-60">
        <FileSpreadsheet className="h-4 w-4" />
        {pending ? "Mengimpor..." : "Import Excel"}
      </button>
      <Message text={message} />
    </form>
  );
}

export function CopyForm({ books }: { books: Option[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitJson("/api/admin/perpustakaan/copies", {
        bookId: form.get("bookId"),
        barcode: form.get("barcode") || null,
        quantity: form.get("quantity") || 1,
        acquisitionDate: form.get("acquisitionDate") || null,
        source: form.get("source"),
        price: form.get("price") || null,
        condition: form.get("condition"),
        location: form.get("location"),
        notes: form.get("notes"),
      });
      event.currentTarget.reset();
      setMessage("Eksemplar tersimpan.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan eksemplar.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-3">
      <select name="bookId" className="rounded-md border px-3 py-2 text-sm md:col-span-2" required>
        <option value="">Pilih buku</option>
        {books.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
      </select>
      <input name="quantity" type="number" min="1" max="100" defaultValue="1" className="rounded-md border px-3 py-2 text-sm" />
      <input name="barcode" placeholder="Barcode opsional untuk 1 eksemplar" className="rounded-md border px-3 py-2 text-sm" />
      <input name="acquisitionDate" type="date" className="rounded-md border px-3 py-2 text-sm" />
      <input name="source" placeholder="Sumber" className="rounded-md border px-3 py-2 text-sm" />
      <input name="price" type="number" min="0" placeholder="Harga" className="rounded-md border px-3 py-2 text-sm" />
      <select name="condition" className="rounded-md border px-3 py-2 text-sm" defaultValue="GOOD">
        <option value="GOOD">Baik</option>
        <option value="FAIR">Cukup</option>
        <option value="DAMAGED">Rusak</option>
      </select>
      <input name="location" placeholder="Lokasi/rak" className="rounded-md border px-3 py-2 text-sm" />
      <textarea name="notes" placeholder="Catatan" className="rounded-md border px-3 py-2 text-sm md:col-span-3" />
      <div className="flex items-center gap-3 md:col-span-3">
        <button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
          <ScanBarcode className="h-4 w-4" />
          {pending ? "Menyimpan..." : "Tambah Eksemplar"}
        </button>
        <Message text={message} />
      </div>
    </form>
  );
}

export function SyncMembersButton() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function sync() {
    setPending(true);
    setMessage("");
    try {
      const payload = await submitJson("/api/admin/perpustakaan/members", { sync: true });
      setMessage(`Anggota baru: ${payload.data.created}.`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sinkron gagal.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-white p-4">
      <button onClick={sync} disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
        <RefreshCcw className="h-4 w-4" />
        {pending ? "Sinkron..." : "Sinkron Anggota"}
      </button>
      <Message text={message} />
    </div>
  );
}

export function LoanForm({ copies, members }: { copies: Option[]; members: Option[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitJson("/api/admin/perpustakaan/loans", {
        copyId: form.get("copyId"),
        memberId: form.get("memberId"),
        dueAt: form.get("dueAt") || undefined,
        notes: form.get("notes"),
      });
      event.currentTarget.reset();
      setMessage("Peminjaman tercatat.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal mencatat peminjaman.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2">
      <select name="copyId" className="rounded-md border px-3 py-2 text-sm" required>
        <option value="">Pilih eksemplar tersedia</option>
        {copies.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
      </select>
      <select name="memberId" className="rounded-md border px-3 py-2 text-sm" required>
        <option value="">Pilih anggota</option>
        {members.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
      </select>
      <input name="dueAt" type="datetime-local" className="rounded-md border px-3 py-2 text-sm" />
      <input name="notes" placeholder="Catatan" className="rounded-md border px-3 py-2 text-sm" />
      <div className="flex items-center gap-3 md:col-span-2">
        <button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
          <Send className="h-4 w-4" />
          {pending ? "Menyimpan..." : "Catat Pinjam"}
        </button>
        <Message text={message} />
      </div>
    </form>
  );
}

export function ReturnLoanButton({ loanId }: { loanId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function returnLoan() {
    setPending(true);
    try {
      await submitJson(`/api/admin/perpustakaan/loans/${loanId}/return`, { condition: "GOOD" }, "PATCH");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button onClick={returnLoan} disabled={pending} className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-xs font-semibold text-white disabled:opacity-60">
      <RotateCcw className="h-3 w-3" />
      Kembali
    </button>
  );
}
