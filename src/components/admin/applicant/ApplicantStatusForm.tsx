"use client";

import { useState } from "react";
import { toast } from "sonner";

type Props = {
  applicantId: string;
  initialStatus: "pending" | "review" | "accepted" | "rejected";
  initialNotes?: string | null;
  initialHandledBy?: string | null;
};

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "review", label: "Dalam Review" },
  { value: "accepted", label: "Diterima" },
  { value: "rejected", label: "Ditolak" }
];

export function ApplicantStatusForm({
  applicantId,
  initialStatus,
  initialHandledBy,
  initialNotes
}: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [handledBy, setHandledBy] = useState(initialHandledBy ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/penerimaan-siswa/applicant/${applicantId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status,
          notes: notes.trim() || null,
          handledBy: handledBy.trim() || null
        })
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload?.message ?? "Gagal menyimpan perubahan.");
      }
      toast.success("Status berhasil diperbarui");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Feedback shown via toast; inline flash removed */}

      <div>
        <label className="text-sm font-semibold text-slate-700">Status</label>
        <select
          value={status}
          onChange={event => setStatus(event.target.value as Props["initialStatus"])}
          className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-700">Catatan</label>
        <textarea
          value={notes}
          onChange={event => setNotes(event.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          placeholder="Catatan tambahan untuk tim validasi"
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-700">Penanggung Jawab</label>
        <input
          type="text"
          value={handledBy}
          onChange={event => setHandledBy(event.target.value)}
          className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          placeholder="Nama admin/editor"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        disabled={isSaving}
      >
        {isSaving ? "Menyimpan..." : "Simpan perubahan"}
      </button>
    </form>
  );
}
