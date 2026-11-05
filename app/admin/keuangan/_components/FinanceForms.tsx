"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Plus, ReceiptText, Send, XCircle } from "lucide-react";

type Option = { id: string; label: string };
type RombelOption = { id: number; label: string };
type InvoiceOption = { id: string; label: string; dueAmount: number };

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

export function BillingTypeForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitJson("/api/admin/keuangan/billing-types", {
        code: form.get("code"),
        name: form.get("name"),
        description: form.get("description"),
        amount: form.get("amount"),
        frequency: form.get("frequency"),
      });
      event.currentTarget.reset();
      setMessage("Jenis tagihan tersimpan.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan jenis tagihan.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2">
      <input name="code" placeholder="Kode, contoh SPP" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="name" placeholder="Nama tagihan" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="amount" type="number" min="1" placeholder="Nominal" className="rounded-md border px-3 py-2 text-sm" required />
      <select name="frequency" className="rounded-md border px-3 py-2 text-sm" defaultValue="MONTHLY">
        <option value="ONE_TIME">Sekali</option>
        <option value="MONTHLY">Bulanan</option>
        <option value="SEMESTER">Semester</option>
        <option value="YEARLY">Tahunan</option>
      </select>
      <textarea name="description" placeholder="Deskripsi" className="rounded-md border px-3 py-2 text-sm md:col-span-2" />
      <div className="flex items-center gap-3 md:col-span-2">
        <button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
          <Plus className="h-4 w-4" />
          {pending ? "Menyimpan..." : "Tambah Jenis"}
        </button>
        {message && <span className="text-sm text-slate-600">{message}</span>}
      </div>
    </form>
  );
}

export function InvoiceGenerateForm({
  billingTypes,
  academicYears,
  rombels,
}: {
  billingTypes: Option[];
  academicYears: Option[];
  rombels: RombelOption[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const rombelId = form.get("rombelId");
    const academicYearId = form.get("academicYearId");
    try {
      const payload = await submitJson("/api/admin/keuangan/invoices", {
        billingTypeId: form.get("billingTypeId"),
        academicYearId: academicYearId || null,
        rombelId: rombelId || null,
        periodMonth: form.get("periodMonth") || null,
        periodYear: form.get("periodYear") || null,
        dueDate: form.get("dueDate"),
        discountAmount: form.get("discountAmount") || 0,
        lateFeeAmount: form.get("lateFeeAmount") || 0,
        notes: form.get("notes"),
      });
      setMessage(`Tagihan dibuat: ${payload.data.created}, dilewati: ${payload.data.skipped}.`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal generate tagihan.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-3">
      <select name="billingTypeId" className="rounded-md border px-3 py-2 text-sm" required>
        <option value="">Pilih jenis tagihan</option>
        {billingTypes.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
      </select>
      <select name="academicYearId" className="rounded-md border px-3 py-2 text-sm">
        <option value="">Semua tahun ajaran</option>
        {academicYears.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
      </select>
      <select name="rombelId" className="rounded-md border px-3 py-2 text-sm">
        <option value="">Semua siswa aktif</option>
        {rombels.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
      </select>
      <input name="periodMonth" type="number" min="1" max="12" placeholder="Bulan periode" className="rounded-md border px-3 py-2 text-sm" />
      <input name="periodYear" type="number" min="2000" max="2100" placeholder="Tahun periode" className="rounded-md border px-3 py-2 text-sm" />
      <input name="dueDate" type="date" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="discountAmount" type="number" min="0" placeholder="Diskon" className="rounded-md border px-3 py-2 text-sm" />
      <input name="lateFeeAmount" type="number" min="0" placeholder="Denda" className="rounded-md border px-3 py-2 text-sm" />
      <input name="notes" placeholder="Catatan" className="rounded-md border px-3 py-2 text-sm" />
      <div className="flex items-center gap-3 md:col-span-3">
        <button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
          <Send className="h-4 w-4" />
          {pending ? "Memproses..." : "Generate Tagihan"}
        </button>
        {message && <span className="text-sm text-slate-600">{message}</span>}
      </div>
    </form>
  );
}

export function PaymentForm({ invoices }: { invoices: InvoiceOption[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitJson("/api/admin/keuangan/payments", {
        invoiceId: form.get("invoiceId"),
        amount: form.get("amount"),
        method: form.get("method"),
        paidAt: form.get("paidAt"),
        proofUrl: form.get("proofUrl") || null,
        note: form.get("note"),
      });
      event.currentTarget.reset();
      setMessage("Pembayaran tercatat.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal mencatat pembayaran.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2">
      <select name="invoiceId" className="rounded-md border px-3 py-2 text-sm" required>
        <option value="">Pilih tagihan</option>
        {invoices.map((invoice) => (
          <option key={invoice.id} value={invoice.id}>{invoice.label}</option>
        ))}
      </select>
      <input name="amount" type="number" min="1" placeholder="Nominal bayar" className="rounded-md border px-3 py-2 text-sm" required />
      <select name="method" className="rounded-md border px-3 py-2 text-sm" defaultValue="CASH">
        <option value="CASH">Tunai</option>
        <option value="TRANSFER">Transfer</option>
        <option value="CARD">Kartu</option>
        <option value="OTHER">Lainnya</option>
      </select>
      <input name="paidAt" type="datetime-local" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="proofUrl" type="url" placeholder="URL bukti bayar opsional" className="rounded-md border px-3 py-2 text-sm md:col-span-2" />
      <textarea name="note" placeholder="Catatan" className="rounded-md border px-3 py-2 text-sm md:col-span-2" />
      <div className="flex items-center gap-3 md:col-span-2">
        <button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
          <ReceiptText className="h-4 w-4" />
          {pending ? "Menyimpan..." : "Catat Pembayaran"}
        </button>
        {message && <span className="text-sm text-slate-600">{message}</span>}
      </div>
    </form>
  );
}

export function ProofReviewButtons({ proofId }: { proofId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  async function review(status: "APPROVED" | "REJECTED") {
    setPending(status);
    try {
      await submitJson(`/api/admin/keuangan/payment-proofs/${proofId}`, { status }, "PATCH");
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex gap-2">
      <button onClick={() => review("APPROVED")} disabled={Boolean(pending)} className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-xs font-semibold text-white disabled:opacity-60">
        <CheckCircle2 className="h-3 w-3" />
        Setujui
      </button>
      <button onClick={() => review("REJECTED")} disabled={Boolean(pending)} className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold text-slate-700 disabled:opacity-60">
        <XCircle className="h-3 w-3" />
        Tolak
      </button>
    </div>
  );
}
