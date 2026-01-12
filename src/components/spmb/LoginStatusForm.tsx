"use client";

import { useState, useCallback, type ChangeEvent } from "react";
import { ProfileCompletionForm } from "./ProfileCompletionForm";

type FormState = { nik: string; phone: string };

type ApplicantDto = {
  id: string;
  fullName: string;
  nik: string;
  phone: string;
  email?: string | null;
  programChoice: string | null;
  status: string;
  notes: string | null;
  handledBy: string | null;
  program: { id: string; name: string } | null;
  academicYear?: { id: string; label: string; registrationFee?: number } | null;
};

type PaymentDto = {
  id: string;
  method?: string | null;
  amount: number | string;
  status?: string | null;
  proofUrl?: string | null;
  createdAt: string;
};

type Feedback = { type: "success" | "error"; message: string } | null;

export function LoginStatusForm() {
  const [form, setForm] = useState<FormState>({ nik: "", phone: "" });
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [applicant, setApplicant] = useState<ApplicantDto | null>(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [billing, setBilling] = useState<{
    registrationFee: number;
    totalPaid: number;
    remaining: number;
    payments: PaymentDto[];
  } | null>(null);

  const handleChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setFeedback(null);
      setLoading(true);
      setApplicant(null);
      setBilling(null);
      setShowProfileForm(false);

      try {
        const res = await fetch("/api/penerimaan-siswa/spmb/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        });
        const payload = await res.json();
        if (!res.ok) {
          setFeedback({
            type: "error",
            message: payload.message ?? "Status tidak dapat diperiksa."
          });
        } else {
          setApplicant(payload.applicant ?? null);
          setBilling(payload.billing ?? null);
          setFeedback({ type: "success", message: "Status ditemukan." });
        }
      } catch (err) {
        console.error(err);
        setFeedback({ type: "error", message: "Tidak dapat terhubung ke server." });
      } finally {
        setLoading(false);
      }
    },
    [form]
  );

  if (showProfileForm && applicant) {
    return (
      <div className="w-full space-y-4">
        <button
          onClick={() => setShowProfileForm(false)}
          className="text-sm font-semibold text-slate-600 hover:text-slate-900 underline"
        >
          ← Kembali ke status
        </button>
        <div className="rounded-2xl border border-slate-200 bg-white/80 shadow-lg p-4">
          <div className="mb-4 pb-4 border-b border-slate-200">
            <p className="text-sm text-slate-600">Melengkapi data untuk:</p>
            <p className="text-lg font-semibold text-slate-900">{applicant.fullName}</p>
            <p className="text-xs text-slate-500">
              {applicant.nik} · {applicant.phone}
            </p>
          </div>
          <ProfileCompletionForm applicantId={applicant.id} />
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-lg"
    >
      {feedback && (
        <p
          className={`text-sm ${feedback.type === "success" ? "text-emerald-600" : "text-rose-600"}`}
        >
          {feedback.message}
        </p>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-800">
          NIK
          <input
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
            placeholder="16 digit NIK"
            value={form.nik}
            onChange={handleChange("nik")}
            minLength={16}
            maxLength={16}
            required
          />
        </label>
        <label className="text-sm font-semibold text-slate-800">
          Nomor HP
          <input
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
            placeholder="0812xxxx"
            value={form.phone}
            onChange={handleChange("phone")}
            minLength={10}
            maxLength={15}
            required
          />
        </label>
      </div>

      <button
        type="submit"
        className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        disabled={loading}
      >
        {loading ? "Memeriksa..." : "Periksa Status"}
      </button>

      {applicant && (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-4">
              <div className="text-sm text-slate-700">
                <p className="text-base font-semibold text-slate-900">{applicant.fullName}</p>
                <p className="text-xs text-slate-500">
                  {applicant.nik} · {applicant.phone}
                </p>
                <p className="mt-3 text-sm">
                  Status: <strong className="capitalize">{applicant.status}</strong>
                </p>
                <p className="text-sm">
                  Program:{" "}
                  <strong>{applicant.program?.name ?? applicant.programChoice ?? "-"}</strong>
                </p>
                <p className="text-sm">
                  Tahun ajaran: <strong>{applicant.academicYear?.label ?? "-"}</strong>
                </p>
                {applicant.notes && (
                  <p className="text-xs text-slate-500">Catatan: {applicant.notes}</p>
                )}
              </div>
            </div>

            <div>
              {billing ? (
                <div className="rounded-md border border-slate-100 bg-white p-3 text-sm">
                  <p className="font-semibold">Informasi Pembayaran</p>
                  {billing.registrationFee === 0 ? (
                    <p className="text-sm text-emerald-600">
                      Pendaftaran gratis (tidak ada biaya).
                    </p>
                  ) : (
                    <div className="mt-2">
                      <p>
                        Biaya pendaftaran:{" "}
                        <strong>Rp{billing.registrationFee.toLocaleString()}</strong>
                      </p>
                      <p>
                        Telah dibayar: <strong>Rp{billing.totalPaid.toLocaleString()}</strong>
                      </p>
                      <p>
                        Sisa: <strong>Rp{billing.remaining.toLocaleString()}</strong>
                      </p>
                      {billing.payments.length > 0 && (
                        <details className="mt-2 text-xs">
                          <summary className="cursor-pointer">Riwayat pembayaran</summary>
                          <ul className="mt-2 space-y-1">
                            {billing.payments.map((p: PaymentDto) => (
                              <li key={p.id} className="flex justify-between">
                                <span>
                                  {p.method} — Rp{Number(p.amount).toLocaleString()}
                                </span>
                                <span className="text-slate-500">
                                  {new Date(p.createdAt).toLocaleDateString()}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-slate-500">Informasi pembayaran belum tersedia.</div>
              )}
            </div>
            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={() => setShowProfileForm(true)}
                className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Lanjutkan Melengkapi Data
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
