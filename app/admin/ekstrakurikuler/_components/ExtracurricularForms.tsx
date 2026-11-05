"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Award, CalendarPlus, CheckCircle, ClipboardCheck, Megaphone, Send, Trophy, UserPlus, Users } from "lucide-react";

type Option = { id: string; label: string };

async function submitJson(url: string, body: unknown, method = "POST") {
  const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof payload.error === "string" ? payload.error : "Proses gagal");
  return payload;
}

function Message({ text }: { text: string }) {
  return text ? <span className="text-sm text-slate-600">{text}</span> : null;
}

export function ClubForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitJson("/api/admin/ekstrakurikuler/clubs", {
        code: form.get("code"),
        name: form.get("name"),
        category: form.get("category"),
        description: form.get("description"),
        location: form.get("location"),
        capacity: form.get("capacity") || null,
      });
      event.currentTarget.reset();
      setMessage("Ekskul tersimpan.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan ekskul.");
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-3">
      <input name="code" placeholder="Kode" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="name" placeholder="Nama ekstrakurikuler" className="rounded-md border px-3 py-2 text-sm md:col-span-2" required />
      <input name="category" placeholder="Kategori" className="rounded-md border px-3 py-2 text-sm" />
      <input name="location" placeholder="Lokasi default" className="rounded-md border px-3 py-2 text-sm" />
      <input name="capacity" type="number" min="1" placeholder="Kapasitas" className="rounded-md border px-3 py-2 text-sm" />
      <textarea name="description" placeholder="Deskripsi" className="rounded-md border px-3 py-2 text-sm md:col-span-3" />
      <div className="flex items-center gap-3 md:col-span-3"><button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-rose-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"><Trophy className="h-4 w-4" />{pending ? "Menyimpan..." : "Simpan Ekskul"}</button><Message text={message} /></div>
    </form>
  );
}

export function CoachForm({ clubs, staff }: { clubs: Option[]; staff: Option[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitJson("/api/admin/ekstrakurikuler/coaches", { extracurricularId: form.get("extracurricularId"), staffId: form.get("staffId"), role: form.get("role"), isPrimary: form.get("isPrimary") === "on" });
      event.currentTarget.reset();
      setMessage("Pembina tersimpan.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan pembina.");
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2">
      <select name="extracurricularId" className="rounded-md border px-3 py-2 text-sm" required><option value="">Pilih ekskul</option>{clubs.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <select name="staffId" className="rounded-md border px-3 py-2 text-sm" required><option value="">Pilih pembina</option>{staff.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <input name="role" defaultValue="PEMBINA" className="rounded-md border px-3 py-2 text-sm" />
      <label className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"><input name="isPrimary" type="checkbox" /> Pembina utama</label>
      <div className="flex items-center gap-3 md:col-span-2"><button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-rose-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"><Users className="h-4 w-4" />{pending ? "Menyimpan..." : "Simpan Pembina"}</button><Message text={message} /></div>
    </form>
  );
}

export function MemberForm({ clubs, students }: { clubs: Option[]; students: Option[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitJson("/api/admin/ekstrakurikuler/members", { extracurricularId: form.get("extracurricularId"), studentId: form.get("studentId"), status: form.get("status"), joinedAt: form.get("joinedAt") || undefined, notes: form.get("notes") });
      event.currentTarget.reset();
      setMessage("Anggota tersimpan.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan anggota.");
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2">
      <select name="extracurricularId" className="rounded-md border px-3 py-2 text-sm" required><option value="">Pilih ekskul</option>{clubs.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <select name="studentId" className="rounded-md border px-3 py-2 text-sm" required><option value="">Pilih siswa</option>{students.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <select name="status" defaultValue="ACTIVE" className="rounded-md border px-3 py-2 text-sm"><option value="ACTIVE">Aktif</option><option value="REGISTERED">Terdaftar</option><option value="INACTIVE">Nonaktif</option><option value="ALUMNI">Alumni</option></select>
      <input name="joinedAt" type="date" className="rounded-md border px-3 py-2 text-sm" />
      <textarea name="notes" placeholder="Catatan" className="rounded-md border px-3 py-2 text-sm md:col-span-2" />
      <div className="flex items-center gap-3 md:col-span-2"><button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-rose-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"><UserPlus className="h-4 w-4" />{pending ? "Menyimpan..." : "Simpan Anggota"}</button><Message text={message} /></div>
    </form>
  );
}

export function ScheduleForm({ clubs }: { clubs: Option[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitJson("/api/admin/ekstrakurikuler/schedules", { extracurricularId: form.get("extracurricularId"), title: form.get("title"), type: form.get("type"), startAt: form.get("startAt"), endAt: form.get("endAt") || null, location: form.get("location"), description: form.get("description") });
      event.currentTarget.reset();
      setMessage("Jadwal tersimpan.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan jadwal.");
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2">
      <select name="extracurricularId" className="rounded-md border px-3 py-2 text-sm" required><option value="">Pilih ekskul</option>{clubs.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <input name="title" placeholder="Judul kegiatan" className="rounded-md border px-3 py-2 text-sm" required />
      <select name="type" defaultValue="TRAINING" className="rounded-md border px-3 py-2 text-sm"><option value="TRAINING">Latihan</option><option value="EVENT">Kegiatan</option><option value="COMPETITION">Lomba</option><option value="MEETING">Rapat</option></select>
      <input name="startAt" type="datetime-local" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="endAt" type="datetime-local" className="rounded-md border px-3 py-2 text-sm" />
      <input name="location" placeholder="Lokasi" className="rounded-md border px-3 py-2 text-sm" />
      <textarea name="description" placeholder="Deskripsi" className="rounded-md border px-3 py-2 text-sm md:col-span-2" />
      <div className="flex items-center gap-3 md:col-span-2"><button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-rose-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"><CalendarPlus className="h-4 w-4" />{pending ? "Menyimpan..." : "Simpan Jadwal"}</button><Message text={message} /></div>
    </form>
  );
}

export function PublishScheduleButton({ scheduleId }: { scheduleId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  async function publish() {
    setPending(true);
    try {
      await submitJson(`/api/admin/ekstrakurikuler/schedules/${scheduleId}/publish`, {}, "POST");
      router.refresh();
    } finally {
      setPending(false);
    }
  }
  return <button onClick={publish} disabled={pending} className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold disabled:opacity-60"><Megaphone className="h-3 w-3" />Publikasi</button>;
}

export function AttendanceForm({ schedules, members }: { schedules: Option[]; members: Array<Option & { studentId: string }> }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitJson("/api/admin/ekstrakurikuler/attendances", { scheduleId: form.get("scheduleId"), records: [{ studentId: form.get("studentId"), status: form.get("status"), notes: form.get("notes") }] });
      event.currentTarget.reset();
      setMessage("Presensi tersimpan.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan presensi.");
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2">
      <select name="scheduleId" className="rounded-md border px-3 py-2 text-sm" required><option value="">Pilih jadwal</option>{schedules.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <select name="studentId" className="rounded-md border px-3 py-2 text-sm" required><option value="">Pilih anggota</option>{members.map((item) => <option key={item.id} value={item.studentId}>{item.label}</option>)}</select>
      <select name="status" defaultValue="PRESENT" className="rounded-md border px-3 py-2 text-sm"><option value="PRESENT">Hadir</option><option value="SICK">Sakit</option><option value="PERMISSION">Izin</option><option value="ABSENT">Alpa</option></select>
      <input name="notes" placeholder="Catatan" className="rounded-md border px-3 py-2 text-sm" />
      <div className="flex items-center gap-3 md:col-span-2"><button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-rose-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"><ClipboardCheck className="h-4 w-4" />{pending ? "Menyimpan..." : "Simpan Presensi"}</button><Message text={message} /></div>
    </form>
  );
}

export function AchievementForm({ clubs, students }: { clubs: Option[]; students: Option[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitJson("/api/admin/ekstrakurikuler/achievements", { extracurricularId: form.get("extracurricularId"), studentId: form.get("studentId") || null, title: form.get("title"), level: form.get("level"), organizer: form.get("organizer"), achievedAt: form.get("achievedAt") || null, rank: form.get("rank"), description: form.get("description"), certificateUrl: form.get("certificateUrl") || null, portfolioVisible: true });
      event.currentTarget.reset();
      setMessage("Prestasi tersimpan.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan prestasi.");
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2">
      <select name="extracurricularId" className="rounded-md border px-3 py-2 text-sm" required><option value="">Pilih ekskul</option>{clubs.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <select name="studentId" className="rounded-md border px-3 py-2 text-sm"><option value="">Prestasi tim/tanpa siswa</option>{students.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <input name="title" placeholder="Judul prestasi" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="level" placeholder="Level" className="rounded-md border px-3 py-2 text-sm" />
      <input name="organizer" placeholder="Penyelenggara" className="rounded-md border px-3 py-2 text-sm" />
      <input name="rank" placeholder="Peringkat" className="rounded-md border px-3 py-2 text-sm" />
      <input name="achievedAt" type="date" className="rounded-md border px-3 py-2 text-sm" />
      <input name="certificateUrl" type="url" placeholder="URL sertifikat" className="rounded-md border px-3 py-2 text-sm" />
      <textarea name="description" placeholder="Deskripsi" className="rounded-md border px-3 py-2 text-sm md:col-span-2" />
      <div className="flex items-center gap-3 md:col-span-2"><button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-rose-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"><Award className="h-4 w-4" />{pending ? "Menyimpan..." : "Simpan Prestasi"}</button><Message text={message} /></div>
    </form>
  );
}

export function ReviewRegistrationButton({ registrationId, status }: { registrationId: string; status: "APPROVED" | "REJECTED" }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  async function review() {
    setPending(true);
    try {
      await submitJson(`/api/admin/ekstrakurikuler/registrations/${registrationId}/review`, { status }, "PATCH");
      router.refresh();
    } finally {
      setPending(false);
    }
  }
  return <button onClick={review} disabled={pending} className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold disabled:opacity-60"><CheckCircle className="h-3 w-3" />{status === "APPROVED" ? "Setujui" : "Tolak"}</button>;
}

export function StudentRegisterButton({ extracurricularId }: { extracurricularId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  async function register() {
    setPending(true);
    setMessage("");
    try {
      await submitJson("/api/student/ekstrakurikuler/register", { extracurricularId, motivation: "Mendaftar dari portal siswa." });
      setMessage("Pendaftaran terkirim.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal mendaftar.");
    } finally {
      setPending(false);
    }
  }
  return <div className="space-y-1"><button onClick={register} disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-rose-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"><Send className="h-4 w-4" />{pending ? "Mengirim..." : "Daftar"}</button><Message text={message} /></div>;
}

