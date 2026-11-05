"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Award, FileText, Flag, MessageSquareWarning, Plus, Send, Users } from "lucide-react";

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

function FormMessage({ message }: { message: string }) {
  if (!message) return null;
  return <span className="text-sm text-slate-600">{message}</span>;
}

export function CounselingCaseForm({ students, staff }: { students: Option[]; staff: Option[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitJson("/api/admin/bk/cases", {
        studentId: form.get("studentId"),
        counselorId: form.get("counselorId") || null,
        category: form.get("category"),
        title: form.get("title"),
        description: form.get("description"),
        priority: form.get("priority"),
        visibility: form.get("visibility"),
        parentVisible: form.get("parentVisible") === "on",
      });
      event.currentTarget.reset();
      setMessage("Kasus BK tersimpan.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan kasus.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2">
      <select name="studentId" className="rounded-md border px-3 py-2 text-sm" required>
        <option value="">Pilih siswa</option>
        {students.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
      </select>
      <select name="counselorId" className="rounded-md border px-3 py-2 text-sm">
        <option value="">Konselor otomatis</option>
        {staff.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
      </select>
      <input name="category" placeholder="Kategori" defaultValue="GENERAL" className="rounded-md border px-3 py-2 text-sm" />
      <select name="priority" className="rounded-md border px-3 py-2 text-sm" defaultValue="MEDIUM">
        <option value="LOW">Rendah</option>
        <option value="MEDIUM">Sedang</option>
        <option value="HIGH">Tinggi</option>
        <option value="CRITICAL">Kritis</option>
      </select>
      <input name="title" placeholder="Judul kasus" className="rounded-md border px-3 py-2 text-sm md:col-span-2" required />
      <textarea name="description" placeholder="Deskripsi kasus" className="rounded-md border px-3 py-2 text-sm md:col-span-2" required />
      <select name="visibility" className="rounded-md border px-3 py-2 text-sm" defaultValue="PRIVATE_BK">
        <option value="PRIVATE_BK">Privat BK</option>
        <option value="HOMEROOM">Wali kelas</option>
        <option value="TEACHER">Guru</option>
        <option value="PARENT_VISIBLE">Terlihat orang tua</option>
      </select>
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input name="parentVisible" type="checkbox" className="h-4 w-4" />
        Tampilkan ringkasan ke orang tua
      </label>
      <div className="flex items-center gap-3 md:col-span-2">
        <button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
          <Plus className="h-4 w-4" />
          {pending ? "Menyimpan..." : "Buat Kasus"}
        </button>
        <FormMessage message={message} />
      </div>
    </form>
  );
}

export function CounselingSessionForm({ cases }: { cases: Option[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitJson("/api/admin/bk/sessions", {
        caseId: form.get("caseId"),
        sessionDate: form.get("sessionDate"),
        summary: form.get("summary"),
        followUpPlan: form.get("followUpPlan"),
        nextSessionAt: form.get("nextSessionAt") || null,
        visibility: form.get("visibility"),
        parentVisible: form.get("parentVisible") === "on",
      });
      event.currentTarget.reset();
      setMessage("Sesi tindak lanjut tersimpan.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan sesi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2">
      <select name="caseId" className="rounded-md border px-3 py-2 text-sm md:col-span-2" required>
        <option value="">Pilih kasus BK</option>
        {cases.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
      </select>
      <input name="sessionDate" type="datetime-local" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="nextSessionAt" type="datetime-local" className="rounded-md border px-3 py-2 text-sm" />
      <textarea name="summary" placeholder="Ringkasan sesi" className="rounded-md border px-3 py-2 text-sm md:col-span-2" required />
      <textarea name="followUpPlan" placeholder="Rencana tindak lanjut" className="rounded-md border px-3 py-2 text-sm md:col-span-2" />
      <select name="visibility" className="rounded-md border px-3 py-2 text-sm" defaultValue="PRIVATE_BK">
        <option value="PRIVATE_BK">Privat BK</option>
        <option value="HOMEROOM">Wali kelas</option>
        <option value="TEACHER">Guru</option>
        <option value="PARENT_VISIBLE">Terlihat orang tua</option>
      </select>
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input name="parentVisible" type="checkbox" className="h-4 w-4" />
        Tampilkan ke orang tua
      </label>
      <div className="flex items-center gap-3 md:col-span-2">
        <button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
          <FileText className="h-4 w-4" />
          {pending ? "Menyimpan..." : "Tambah Sesi"}
        </button>
        <FormMessage message={message} />
      </div>
    </form>
  );
}

export function DisciplineRuleForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitJson("/api/admin/bk/discipline-rules", {
        code: form.get("code"),
        title: form.get("title"),
        category: form.get("category"),
        severity: form.get("severity"),
        points: form.get("points"),
        description: form.get("description"),
      });
      event.currentTarget.reset();
      setMessage("Aturan pelanggaran tersimpan.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan aturan.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-3">
      <input name="code" placeholder="Kode" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="title" placeholder="Nama pelanggaran" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="category" placeholder="Kategori" defaultValue="KEDISIPLINAN" className="rounded-md border px-3 py-2 text-sm" />
      <select name="severity" className="rounded-md border px-3 py-2 text-sm" defaultValue="LOW">
        <option value="LOW">Rendah</option>
        <option value="MEDIUM">Sedang</option>
        <option value="HIGH">Tinggi</option>
        <option value="CRITICAL">Kritis</option>
      </select>
      <input name="points" type="number" min="0" placeholder="Poin" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="description" placeholder="Deskripsi" className="rounded-md border px-3 py-2 text-sm" />
      <div className="flex items-center gap-3 md:col-span-3">
        <button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
          <Flag className="h-4 w-4" />
          {pending ? "Menyimpan..." : "Tambah Aturan"}
        </button>
        <FormMessage message={message} />
      </div>
    </form>
  );
}

export function DisciplineRecordForm({ students, rules, cases }: { students: Option[]; rules: Option[]; cases: Option[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitJson("/api/admin/bk/discipline-records", {
        studentId: form.get("studentId"),
        ruleId: form.get("ruleId") || null,
        caseId: form.get("caseId") || null,
        incidentDate: form.get("incidentDate"),
        description: form.get("description"),
        points: form.get("points") || undefined,
        actionTaken: form.get("actionTaken"),
        parentVisible: form.get("parentVisible") === "on",
      });
      event.currentTarget.reset();
      setMessage("Catatan pelanggaran tersimpan.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan catatan.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2">
      <select name="studentId" className="rounded-md border px-3 py-2 text-sm" required>
        <option value="">Pilih siswa</option>
        {students.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
      </select>
      <select name="ruleId" className="rounded-md border px-3 py-2 text-sm">
        <option value="">Tanpa aturan master</option>
        {rules.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
      </select>
      <select name="caseId" className="rounded-md border px-3 py-2 text-sm">
        <option value="">Tidak dikaitkan kasus</option>
        {cases.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
      </select>
      <input name="incidentDate" type="date" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="points" type="number" min="0" placeholder="Poin override opsional" className="rounded-md border px-3 py-2 text-sm md:col-span-2" />
      <textarea name="description" placeholder="Deskripsi kejadian" className="rounded-md border px-3 py-2 text-sm md:col-span-2" required />
      <textarea name="actionTaken" placeholder="Tindakan / pembinaan" className="rounded-md border px-3 py-2 text-sm md:col-span-2" />
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input name="parentVisible" type="checkbox" className="h-4 w-4" />
        Tampilkan ringkasan ke orang tua
      </label>
      <div className="flex items-center gap-3 md:col-span-2">
        <button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
          <MessageSquareWarning className="h-4 w-4" />
          {pending ? "Menyimpan..." : "Catat Pelanggaran"}
        </button>
        <FormMessage message={message} />
      </div>
    </form>
  );
}

export function AchievementForm({ students }: { students: Option[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitJson("/api/admin/bk/achievements", {
        studentId: form.get("studentId"),
        title: form.get("title"),
        category: form.get("category"),
        level: form.get("level"),
        organizer: form.get("organizer"),
        achievementDate: form.get("achievementDate"),
        description: form.get("description"),
        certificateUrl: form.get("certificateUrl") || null,
        parentVisible: form.get("parentVisible") !== "off",
      });
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
      <select name="studentId" className="rounded-md border px-3 py-2 text-sm" required>
        <option value="">Pilih siswa</option>
        {students.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
      </select>
      <input name="title" placeholder="Judul prestasi" className="rounded-md border px-3 py-2 text-sm" required />
      <select name="category" className="rounded-md border px-3 py-2 text-sm" defaultValue="ACADEMIC">
        <option value="ACADEMIC">Akademik</option>
        <option value="NON_ACADEMIC">Non-akademik</option>
        <option value="EXTRACURRICULAR">Ekstrakurikuler</option>
        <option value="CHARACTER">Karakter</option>
      </select>
      <select name="level" className="rounded-md border px-3 py-2 text-sm" defaultValue="SCHOOL">
        <option value="SCHOOL">Sekolah</option>
        <option value="DISTRICT">Kecamatan</option>
        <option value="CITY">Kota/Kabupaten</option>
        <option value="PROVINCE">Provinsi</option>
        <option value="NATIONAL">Nasional</option>
        <option value="INTERNATIONAL">Internasional</option>
      </select>
      <input name="organizer" placeholder="Penyelenggara" className="rounded-md border px-3 py-2 text-sm" />
      <input name="achievementDate" type="date" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="certificateUrl" type="url" placeholder="URL sertifikat opsional" className="rounded-md border px-3 py-2 text-sm md:col-span-2" />
      <textarea name="description" placeholder="Deskripsi" className="rounded-md border px-3 py-2 text-sm md:col-span-2" />
      <div className="flex items-center gap-3 md:col-span-2">
        <button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
          <Award className="h-4 w-4" />
          {pending ? "Menyimpan..." : "Tambah Prestasi"}
        </button>
        <FormMessage message={message} />
      </div>
    </form>
  );
}

export function ReferralForm({ students, staff, cases }: { students: Option[]; staff: Option[]; cases: Option[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitJson("/api/admin/bk/referrals", {
        studentId: form.get("studentId"),
        caseId: form.get("caseId") || null,
        assignedTo: form.get("assignedTo") || null,
        source: form.get("source"),
        reason: form.get("reason"),
      });
      event.currentTarget.reset();
      setMessage("Rujukan tersimpan.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan rujukan.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2">
      <select name="studentId" className="rounded-md border px-3 py-2 text-sm" required>
        <option value="">Pilih siswa</option>
        {students.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
      </select>
      <select name="assignedTo" className="rounded-md border px-3 py-2 text-sm">
        <option value="">Belum ditugaskan</option>
        {staff.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
      </select>
      <select name="caseId" className="rounded-md border px-3 py-2 text-sm">
        <option value="">Tidak terkait kasus</option>
        {cases.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
      </select>
      <select name="source" className="rounded-md border px-3 py-2 text-sm" defaultValue="TEACHER">
        <option value="TEACHER">Guru</option>
        <option value="HOMEROOM">Wali kelas</option>
        <option value="PARENT">Orang tua</option>
        <option value="STUDENT">Siswa</option>
        <option value="ADMIN">Admin</option>
      </select>
      <textarea name="reason" placeholder="Alasan rujukan" className="rounded-md border px-3 py-2 text-sm md:col-span-2" required />
      <div className="flex items-center gap-3 md:col-span-2">
        <button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
          <Send className="h-4 w-4" />
          {pending ? "Menyimpan..." : "Buat Rujukan"}
        </button>
        <FormMessage message={message} />
      </div>
    </form>
  );
}

export function SummonLetterForm({ cases, parents }: { cases: Option[]; parents: Option[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitJson("/api/admin/bk/summon-letters", {
        caseId: form.get("caseId"),
        parentId: form.get("parentId") || null,
        scheduledAt: form.get("scheduledAt"),
        agenda: form.get("agenda"),
        status: form.get("status"),
        parentVisible: form.get("parentVisible") !== "off",
      });
      event.currentTarget.reset();
      setMessage("Surat panggilan dibuat.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal membuat surat.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2">
      <select name="caseId" className="rounded-md border px-3 py-2 text-sm md:col-span-2" required>
        <option value="">Pilih kasus BK</option>
        {cases.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
      </select>
      <select name="parentId" className="rounded-md border px-3 py-2 text-sm">
        <option value="">Wali utama otomatis</option>
        {parents.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
      </select>
      <input name="scheduledAt" type="datetime-local" className="rounded-md border px-3 py-2 text-sm" required />
      <select name="status" className="rounded-md border px-3 py-2 text-sm" defaultValue="SENT">
        <option value="DRAFT">Draft</option>
        <option value="SENT">Dikirim</option>
        <option value="ATTENDED">Hadir</option>
        <option value="CANCELLED">Batal</option>
      </select>
      <textarea name="agenda" placeholder="Agenda pertemuan" className="rounded-md border px-3 py-2 text-sm md:col-span-2" required />
      <div className="flex items-center gap-3 md:col-span-2">
        <button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
          <Users className="h-4 w-4" />
          {pending ? "Menyimpan..." : "Buat Surat"}
        </button>
        <FormMessage message={message} />
      </div>
    </form>
  );
}
