"use client";

import { useState, type ChangeEvent } from "react";
import { ProfileCompletionForm } from "./ProfileCompletionForm";

type FormState = {
  nik: string;
  phone: string;
};

type ApplicantDto = {
  id: string;
  fullName: string;
  nik: string;
  phone: string;
  programChoice: string | null;
  status: string;
  notes: string | null;
  handledBy: string | null;
  program: { id: string; name: string } | null;
  academicYear: { id: string; label: string } | null;
};

type Feedback = { type: "success" | "error"; message: string } | null;

export function LoginStatusForm() {
  const [form, setForm] = useState<FormState>({ nik: "", phone: "" });
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [applicant, setApplicant] = useState<ApplicantDto | null>(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    setLoading(true);
    setApplicant(null);
    setShowProfileForm(false);

    try {
      const response = await fetch("/api/penerimaan-siswa/spmb/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = await response.json();
      if (!response.ok) {
        setFeedback({ type: "error", message: payload.message ?? "Status tidak dapat diperiksa." });
      } else {
        setApplicant(payload.applicant);
        setFeedback({ type: "success", message: "Status ditemukan." });
      }
    } catch (error) {
      console.error(error);
      setFeedback({ type: "error", message: "Tidak dapat terhubung ke server." });
    } finally {
      setLoading(false);
    }
  };

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
            <p className="text-xs text-slate-500">{applicant.nik} · {applicant.phone}</p>
          </div>
          <ProfileCompletionForm applicantId={applicant.id} />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-lg">
      {feedback && (
        <p className={`text-sm ${feedback.type === "success" ? "text-emerald-600" : "text-rose-600"}`}>
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
        <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="text-sm text-slate-700">
            <p className="text-base font-semibold text-slate-900">{applicant.fullName}</p>
            <p className="text-xs text-slate-500">{applicant.nik} · {applicant.phone}</p>
            <p className="mt-3 text-sm">
              Status: <strong className="capitalize">{applicant.status}</strong>
            </p>
            <p className="text-sm">
              Program: <strong>{applicant.program?.name ?? applicant.programChoice ?? "-"}</strong>
            </p>
            <p className="text-sm">
              Tahun ajaran: <strong>{applicant.academicYear?.label ?? "-"}</strong>
            </p>
            {applicant.notes && <p className="text-xs text-slate-500">Catatan: {applicant.notes}</p>}
          </div>
          <button
            type="button"
            onClick={() => setShowProfileForm(true)}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Lanjutkan Melengkapi Data
          </button>
        </div>
      )}
    </form>
  );
}
