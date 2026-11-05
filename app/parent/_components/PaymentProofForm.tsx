"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";

export function PaymentProofForm({ invoiceId, outstanding }: { invoiceId: string; outstanding: number }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);

    const response = await fetch("/api/parent/billing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invoiceId,
        amount: form.get("amount"),
        transferDate: form.get("transferDate"),
        proofUrl: form.get("proofUrl"),
        note: form.get("note"),
      }),
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setMessage(payload.error ?? "Gagal mengirim bukti bayar.");
      setPending(false);
      return;
    }

    event.currentTarget.reset();
    setMessage("Bukti bayar terkirim dan menunggu validasi.");
    setPending(false);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 grid gap-2 rounded-lg bg-slate-50 p-3 md:grid-cols-2">
      <input name="amount" type="number" min="1" max={outstanding} placeholder="Nominal transfer" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="transferDate" type="date" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="proofUrl" type="url" placeholder="URL bukti transfer" className="rounded-md border px-3 py-2 text-sm md:col-span-2" required />
      <textarea name="note" placeholder="Catatan opsional" className="rounded-md border px-3 py-2 text-sm md:col-span-2" />
      <div className="flex items-center gap-2 md:col-span-2">
        <button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
          <Upload className="h-4 w-4" />
          {pending ? "Mengirim..." : "Upload Bukti"}
        </button>
        {message && <span className="text-xs text-slate-600">{message}</span>}
      </div>
    </form>
  );
}
