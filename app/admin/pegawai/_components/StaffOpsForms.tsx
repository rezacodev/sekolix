"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, CalendarCheck, ClipboardList, FileText, Upload, UserCheck, UsersRound } from "lucide-react";

type Option = { id: string; label: string };

async function submitJson(url: string, body: unknown, method = "POST") {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof payload.error === "string" ? payload.error : "Proses gagal");
  return payload;
}

function Message({ text }: { text: string }) {
  return text ? <span className="text-sm text-slate-600">{text}</span> : null;
}

export function AttendanceForm({ staff }: { staff: Option[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitJson("/api/admin/pegawai/attendances", {
        staffId: form.get("staffId"),
        date: form.get("date"),
        checkIn: form.get("checkIn") || null,
        checkOut: form.get("checkOut") || null,
        status: form.get("status"),
        source: "MANUAL",
        notes: form.get("notes"),
      });
      event.currentTarget.reset();
      setMessage("Absensi tersimpan.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan absensi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-3">
      <select name="staffId" className="rounded-md border px-3 py-2 text-sm md:col-span-2" required><option value="">Pilih pegawai</option>{staff.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <input name="date" type="date" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="checkIn" type="datetime-local" className="rounded-md border px-3 py-2 text-sm" />
      <input name="checkOut" type="datetime-local" className="rounded-md border px-3 py-2 text-sm" />
      <select name="status" defaultValue="PRESENT" className="rounded-md border px-3 py-2 text-sm">
        <option value="PRESENT">Hadir</option><option value="LATE">Terlambat</option><option value="SICK">Sakit</option><option value="PERMISSION">Izin</option><option value="ABSENT">Alpa</option><option value="LEAVE">Cuti</option>
      </select>
      <input name="notes" placeholder="Catatan" className="rounded-md border px-3 py-2 text-sm md:col-span-3" />
      <div className="flex items-center gap-3 md:col-span-3">
        <button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-cyan-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
          <UserCheck className="h-4 w-4" />
          {pending ? "Menyimpan..." : "Simpan Absensi"}
        </button>
        <Message text={message} />
      </div>
    </form>
  );
}

export function AttendanceImportForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const records = JSON.parse(String(form.get("records") ?? "[]"));
      const payload = await submitJson("/api/admin/pegawai/attendances", { records });
      setMessage(`Import selesai: ${payload.data?.length ?? 0} baris.`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Format JSON tidak valid.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-lg border bg-white p-4">
      <textarea name="records" rows={4} className="w-full rounded-md border px-3 py-2 font-mono text-xs" placeholder='[{"staffId":"...","date":"2026-06-30","status":"PRESENT"}]' />
      <div className="flex items-center gap-3">
        <button disabled={pending} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold disabled:opacity-60">
          <Upload className="h-4 w-4" />
          {pending ? "Mengimpor..." : "Import JSON"}
        </button>
        <Message text={message} />
      </div>
    </form>
  );
}

export function LeaveRequestForm({ staff }: { staff: Option[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitJson("/api/admin/pegawai/leave-requests", {
        staffId: form.get("staffId"),
        type: form.get("type"),
        startDate: form.get("startDate"),
        endDate: form.get("endDate"),
        reason: form.get("reason"),
        attachmentUrl: form.get("attachmentUrl") || null,
      });
      event.currentTarget.reset();
      setMessage("Pengajuan cuti/izin tersimpan.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan pengajuan.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2">
      <select name="staffId" className="rounded-md border px-3 py-2 text-sm" required><option value="">Pilih pegawai</option>{staff.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <select name="type" defaultValue="LEAVE" className="rounded-md border px-3 py-2 text-sm"><option value="LEAVE">Cuti</option><option value="SICK">Sakit</option><option value="PERMISSION">Izin</option><option value="MATERNITY">Melahirkan</option><option value="OTHER">Lainnya</option></select>
      <input name="startDate" type="date" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="endDate" type="date" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="attachmentUrl" type="url" placeholder="URL lampiran" className="rounded-md border px-3 py-2 text-sm md:col-span-2" />
      <textarea name="reason" placeholder="Alasan" className="rounded-md border px-3 py-2 text-sm md:col-span-2" required />
      <div className="flex items-center gap-3 md:col-span-2">
        <button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-cyan-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
          <CalendarCheck className="h-4 w-4" />
          {pending ? "Menyimpan..." : "Ajukan"}
        </button>
        <Message text={message} />
      </div>
    </form>
  );
}

export function ReviewLeaveButton({ leaveId, status }: { leaveId: string; status: "APPROVED" | "REJECTED" }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function review() {
    setPending(true);
    try {
      await submitJson(`/api/admin/pegawai/leave-requests/${leaveId}/review`, { status }, "PATCH");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button onClick={review} disabled={pending} className="rounded-md border px-2 py-1 text-xs font-semibold disabled:opacity-60">
      {status === "APPROVED" ? "Setujui" : "Tolak"}
    </button>
  );
}

export function DutyScheduleForm({ staff }: { staff: Option[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitJson("/api/admin/pegawai/duty-schedules", {
        staffId: form.get("staffId"),
        dutyDate: form.get("dutyDate"),
        shift: form.get("shift"),
        location: form.get("location"),
        task: form.get("task"),
        notes: form.get("notes"),
      });
      event.currentTarget.reset();
      setMessage("Jadwal piket tersimpan.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan piket.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2">
      <select name="staffId" className="rounded-md border px-3 py-2 text-sm" required><option value="">Pilih pegawai</option>{staff.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <input name="dutyDate" type="date" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="shift" placeholder="Shift" className="rounded-md border px-3 py-2 text-sm" />
      <input name="location" placeholder="Lokasi" className="rounded-md border px-3 py-2 text-sm" />
      <input name="task" placeholder="Tugas piket" className="rounded-md border px-3 py-2 text-sm md:col-span-2" required />
      <textarea name="notes" placeholder="Catatan" className="rounded-md border px-3 py-2 text-sm md:col-span-2" />
      <div className="flex items-center gap-3 md:col-span-2">
        <button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-cyan-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
          <ClipboardList className="h-4 w-4" />
          {pending ? "Menyimpan..." : "Tambah Piket"}
        </button>
        <Message text={message} />
      </div>
    </form>
  );
}

export function StaffDocumentForm({ staff }: { staff: Option[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitJson("/api/admin/pegawai/documents", {
        staffId: form.get("staffId"),
        type: form.get("type"),
        title: form.get("title"),
        fileUrl: form.get("fileUrl"),
        fileName: form.get("fileName"),
        issuedAt: form.get("issuedAt") || null,
        expiresAt: form.get("expiresAt") || null,
        isSensitive: form.get("isSensitive") === "on",
        notes: form.get("notes"),
      });
      event.currentTarget.reset();
      setMessage("Dokumen tersimpan.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan dokumen.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2">
      <select name="staffId" className="rounded-md border px-3 py-2 text-sm" required><option value="">Pilih pegawai</option>{staff.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <select name="type" defaultValue="OTHER" className="rounded-md border px-3 py-2 text-sm"><option value="SK">SK</option><option value="CERTIFICATE">Sertifikat</option><option value="CONTRACT">Kontrak</option><option value="IDENTITY">Identitas</option><option value="OTHER">Lainnya</option></select>
      <input name="title" placeholder="Judul dokumen" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="fileUrl" type="url" placeholder="URL file/upload" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="fileName" placeholder="Nama file" className="rounded-md border px-3 py-2 text-sm" />
      <input name="issuedAt" type="date" className="rounded-md border px-3 py-2 text-sm" />
      <input name="expiresAt" type="date" className="rounded-md border px-3 py-2 text-sm" />
      <label className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"><input name="isSensitive" type="checkbox" defaultChecked /> Sensitif</label>
      <textarea name="notes" placeholder="Catatan" className="rounded-md border px-3 py-2 text-sm md:col-span-2" />
      <div className="flex items-center gap-3 md:col-span-2">
        <button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-cyan-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
          <FileText className="h-4 w-4" />
          {pending ? "Menyimpan..." : "Simpan Dokumen"}
        </button>
        <Message text={message} />
      </div>
    </form>
  );
}

export function StaffContractForm({ staff }: { staff: Option[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitJson("/api/admin/pegawai/contracts", {
        staffId: form.get("staffId"),
        contractNumber: form.get("contractNumber"),
        title: form.get("title"),
        startDate: form.get("startDate"),
        endDate: form.get("endDate") || null,
        reminderDate: form.get("reminderDate") || null,
        fileUrl: form.get("fileUrl") || null,
        notes: form.get("notes"),
      });
      event.currentTarget.reset();
      setMessage("Kontrak tersimpan.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan kontrak.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2">
      <select name="staffId" className="rounded-md border px-3 py-2 text-sm" required><option value="">Pilih pegawai</option>{staff.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <input name="contractNumber" placeholder="Nomor kontrak" className="rounded-md border px-3 py-2 text-sm" />
      <input name="title" placeholder="Judul kontrak/sertifikasi" className="rounded-md border px-3 py-2 text-sm md:col-span-2" required />
      <input name="startDate" type="date" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="endDate" type="date" className="rounded-md border px-3 py-2 text-sm" />
      <input name="reminderDate" type="date" className="rounded-md border px-3 py-2 text-sm" />
      <input name="fileUrl" type="url" placeholder="URL file" className="rounded-md border px-3 py-2 text-sm" />
      <textarea name="notes" placeholder="Catatan" className="rounded-md border px-3 py-2 text-sm md:col-span-2" />
      <div className="flex items-center gap-3 md:col-span-2">
        <button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-cyan-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
          <BadgeCheck className="h-4 w-4" />
          {pending ? "Menyimpan..." : "Simpan Kontrak"}
        </button>
        <Message text={message} />
      </div>
    </form>
  );
}

export function AssignmentLetterForm({ staff }: { staff: Option[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitJson("/api/admin/pegawai/assignment-letters", {
        staffId: form.get("staffId"),
        letterNumber: form.get("letterNumber") || null,
        title: form.get("title"),
        assignmentType: form.get("assignmentType"),
        issuedAt: form.get("issuedAt"),
        startDate: form.get("startDate") || null,
        endDate: form.get("endDate") || null,
        fileUrl: form.get("fileUrl") || null,
        moduleSource: "PEGAWAI",
        notes: form.get("notes"),
      });
      event.currentTarget.reset();
      setMessage("Surat tugas tersimpan.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan surat tugas.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2">
      <select name="staffId" className="rounded-md border px-3 py-2 text-sm" required><option value="">Pilih pegawai</option>{staff.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <input name="letterNumber" placeholder="Nomor otomatis jika kosong" className="rounded-md border px-3 py-2 text-sm" />
      <input name="title" placeholder="Judul SK/surat tugas" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="assignmentType" defaultValue="SURAT_TUGAS" className="rounded-md border px-3 py-2 text-sm" />
      <input name="issuedAt" type="date" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="startDate" type="date" className="rounded-md border px-3 py-2 text-sm" />
      <input name="endDate" type="date" className="rounded-md border px-3 py-2 text-sm" />
      <input name="fileUrl" type="url" placeholder="URL file surat" className="rounded-md border px-3 py-2 text-sm" />
      <textarea name="notes" placeholder="Catatan" className="rounded-md border px-3 py-2 text-sm md:col-span-2" />
      <div className="flex items-center gap-3 md:col-span-2">
        <button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-cyan-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
          <UsersRound className="h-4 w-4" />
          {pending ? "Menyimpan..." : "Simpan Surat"}
        </button>
        <Message text={message} />
      </div>
    </form>
  );
}

