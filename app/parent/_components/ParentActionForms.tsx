"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ChildOption = {
  id: string;
  name: string;
  teachers: Array<{ id: string | null; name: string; subject: string }>;
};

export function LeaveRequestForm({ childrenOptions }: { childrenOptions: ChildOption[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setStatus("Mengirim pengajuan...");
    const response = await fetch("/api/parent/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: formData.get("studentId"),
        type: formData.get("type"),
        startDate: formData.get("startDate"),
        endDate: formData.get("endDate"),
        reason: formData.get("reason"),
      }),
    });

    setStatus(response.ok ? "Pengajuan izin terkirim." : "Gagal mengirim pengajuan.");
    if (response.ok) router.refresh();
  }

  return (
    <form action={onSubmit} className="space-y-4 rounded-lg border bg-white p-4">
      <div>
        <label className="text-sm font-medium">Anak</label>
        <select name="studentId" required className="mt-1 w-full rounded-md border px-3 py-2 text-sm">
          {childrenOptions.map((child) => (
            <option key={child.id} value={child.id}>{child.name}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="text-sm font-medium">Jenis</label>
          <select name="type" required className="mt-1 w-full rounded-md border px-3 py-2 text-sm">
            <option value="SAKIT">Sakit</option>
            <option value="IZIN">Izin</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Mulai</label>
          <input name="startDate" type="date" required className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium">Sampai</label>
          <input name="endDate" type="date" required className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Alasan</label>
        <textarea name="reason" required rows={4} className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
      </div>
      <button type="submit" className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white">
        Kirim Pengajuan
      </button>
      {status && <p className="text-sm text-slate-600">{status}</p>}
    </form>
  );
}

export function ParentMessageForm({ childrenOptions }: { childrenOptions: ChildOption[] }) {
  const router = useRouter();
  const [studentId, setStudentId] = useState(childrenOptions[0]?.id ?? "");
  const [status, setStatus] = useState<string | null>(null);
  const selectedChild = childrenOptions.find((child) => child.id === studentId);

  async function onSubmit(formData: FormData) {
    setStatus("Mengirim pesan...");
    const response = await fetch("/api/parent/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: formData.get("studentId"),
        teacherId: formData.get("teacherId") || null,
        subject: formData.get("subject"),
        content: formData.get("content"),
      }),
    });

    setStatus(response.ok ? "Pesan terkirim." : "Gagal mengirim pesan.");
    if (response.ok) router.refresh();
  }

  return (
    <form action={onSubmit} className="space-y-4 rounded-lg border bg-white p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Anak</label>
          <select
            name="studentId"
            required
            value={studentId}
            onChange={(event) => setStudentId(event.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          >
            {childrenOptions.map((child) => (
              <option key={child.id} value={child.id}>{child.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Tujuan</label>
          <select name="teacherId" className="mt-1 w-full rounded-md border px-3 py-2 text-sm">
            <option value="">Wali kelas/guru terkait</option>
            {selectedChild?.teachers.map((teacher, index) => (
              <option key={`${teacher.id ?? "teacher"}-${index}`} value={teacher.id ?? ""}>
                {teacher.name} - {teacher.subject}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Subjek</label>
        <input name="subject" required className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium">Pesan</label>
        <textarea name="content" required rows={5} className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
      </div>
      <button type="submit" className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white">
        Kirim Pesan
      </button>
      {status && <p className="text-sm text-slate-600">{status}</p>}
    </form>
  );
}
