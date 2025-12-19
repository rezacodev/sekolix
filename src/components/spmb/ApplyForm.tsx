"use client";

import { useState, type ChangeEvent } from "react";

type ProgramOption = {
  id: string;
  name: string;
};

type FormState = {
  nik: string;
  phone: string;
  fullName: string;
  email: string;
  schoolOrigin: string;
  programId: string;
  academicYearId: string;
};

type Feedback = { type: "success" | "error"; message: string; registrationCode?: string } | null;

type ApplyFormProps = {
  programs: ProgramOption[];
  activeYear: { id: string; label: string } | null;
};

const createDefaultState = (programId: string, academicYearId: string): FormState => ({
  nik: "",
  phone: "",
  fullName: "",
  email: "",
  schoolOrigin: "",
  programId,
  academicYearId,
});

export function ApplyForm({ programs, activeYear }: ApplyFormProps) {
  const initialProgramId = programs[0]?.id ?? "";
  const initialAcademicYearId = activeYear?.id ?? "";
  const [form, setForm] = useState<FormState>(() =>
    createDefaultState(initialProgramId, initialAcademicYearId)
  );
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof FormState) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    setLoading(true);

    try {
      const response = await fetch("/api/penerimaan-siswa/spmb/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          academicYearId: form.academicYearId || undefined,
          programChoice: programs.find((program) => program.id === form.programId)?.name ?? null,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setFeedback({ type: "error", message: payload.message ?? "Terjadi kesalahan saat mengirim data." });
      } else {
        setFeedback({ 
          type: "success", 
          message: payload.message,
          registrationCode: payload.registrationCode,
        });
        setForm(createDefaultState(initialProgramId, initialAcademicYearId));
      }
    } catch (error) {
      console.error(error);
      setFeedback({ type: "error", message: "Tidak dapat terhubung ke server." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4" aria-live="polite">
      {feedback && (
        <div
          className={`rounded-md border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
              : "border-rose-300 bg-rose-50 text-rose-700"
          }`}
        >
          <p>{feedback.message}</p>
          {feedback.type === "success" && feedback.registrationCode && (
            <div className="mt-3 space-y-2">
              <p className="font-semibold">Kode Registrasi Anda:</p>
              <div className="flex items-center gap-2">
                <code className="rounded bg-white/50 px-3 py-2 font-mono font-bold text-emerald-900">
                  {feedback.registrationCode}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(feedback.registrationCode || "");
                  }}
                  className="text-xs font-semibold hover:underline"
                >
                  Salin
                </button>
              </div>
              <p className="text-xs">Simpan kode ini untuk proses pendaftaran selanjutnya.</p>
            </div>
          )}
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-600">
        {activeYear ? (
          <span>Tahun ajaran aktif: {activeYear.label}</span>
        ) : (
          <span className="text-rose-700">Belum ada tahun ajaran aktif. Data akan dicatat setelah admin mengaktifkannya.</span>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-800">
          NIK
          <input
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
            required
            minLength={16}
            maxLength={16}
            value={form.nik}
            onChange={handleChange("nik")}
            placeholder="16 digit NIK"
            inputMode="numeric"
          />
        </label>
        <label className="text-sm font-semibold text-slate-800">
          Nomor HP
          <input
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
            required
            minLength={10}
            maxLength={15}
            value={form.phone}
            onChange={handleChange("phone")}
            placeholder="0812xxxx"
            inputMode="numeric"
          />
        </label>
      </div>

      <label className="text-sm font-semibold text-slate-800">
        Nama Lengkap
        <input
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
          required
          minLength={3}
          value={form.fullName}
          onChange={handleChange("fullName")}
          placeholder="Nama sesuai dokumen"
        />
      </label>

      <label className="text-sm font-semibold text-slate-800">
        Email (opsional)
        <input
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
          type="email"
          value={form.email}
          onChange={handleChange("email")}
          placeholder="email@email.com"
        />
      </label>

      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-800">
          Asal Sekolah
          <input
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
            value={form.schoolOrigin}
            onChange={handleChange("schoolOrigin")}
            placeholder="Nama sekolah"
          />
        </label>
        <label className="text-sm font-semibold text-slate-800">
          Program Yang Dituju
          <select
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
            required
            value={form.programId}
            onChange={handleChange("programId")}
          >
            <option value="" disabled>
              Pilih program
            </option>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {programs.length === 0 && (
        <p className="text-xs text-rose-500">
          Belum ada program aktif. Hubungi admin agar form dapat digunakan.
        </p>
      )}

      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        disabled={loading || programs.length === 0}
      >
        {loading ? "Mengirim..." : "Kirim Pendaftaran"}
      </button>
    </form>
  );
}
