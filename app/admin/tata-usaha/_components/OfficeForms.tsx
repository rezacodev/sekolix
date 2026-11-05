"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Archive, CheckCircle, FileOutput, FileText, Inbox, PenLine, Send, Split } from "lucide-react";

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

export function TemplateForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitJson("/api/admin/tata-usaha/templates", {
        code: form.get("code"),
        name: form.get("name"),
        audience: form.get("audience"),
        subject: form.get("subject"),
        body: form.get("body"),
        variables: { contoh: "nilai" },
      });
      event.currentTarget.reset();
      setMessage("Template tersimpan.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan template.");
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2">
      <input name="code" placeholder="Kode template" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="name" placeholder="Nama template" className="rounded-md border px-3 py-2 text-sm" required />
      <select name="audience" defaultValue="STUDENT" className="rounded-md border px-3 py-2 text-sm"><option value="STUDENT">Siswa</option><option value="STAFF">Pegawai</option><option value="GENERAL">Umum</option></select>
      <input name="subject" placeholder="Perihal" className="rounded-md border px-3 py-2 text-sm" required />
      <textarea name="body" rows={5} placeholder="Isi template, contoh: Yang bertanda tangan menerangkan bahwa {{nama_siswa}}..." className="rounded-md border px-3 py-2 text-sm md:col-span-2" required />
      <div className="flex items-center gap-3 md:col-span-2">
        <button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-indigo-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"><FileText className="h-4 w-4" />{pending ? "Menyimpan..." : "Simpan Template"}</button>
        <Message text={message} />
      </div>
    </form>
  );
}

export function IncomingLetterForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitJson("/api/admin/tata-usaha/incoming-letters", {
        agendaNumber: form.get("agendaNumber") || null,
        letterNumber: form.get("letterNumber") || null,
        receivedAt: form.get("receivedAt"),
        letterDate: form.get("letterDate") || null,
        sender: form.get("sender"),
        subject: form.get("subject"),
        summary: form.get("summary"),
        fileUrl: form.get("fileUrl") || null,
        classification: form.get("classification"),
      });
      event.currentTarget.reset();
      setMessage("Surat masuk tercatat.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan surat masuk.");
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2">
      <input name="agendaNumber" placeholder="Nomor agenda otomatis jika kosong" className="rounded-md border px-3 py-2 text-sm" />
      <input name="letterNumber" placeholder="Nomor surat asal" className="rounded-md border px-3 py-2 text-sm" />
      <input name="receivedAt" type="date" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="letterDate" type="date" className="rounded-md border px-3 py-2 text-sm" />
      <input name="sender" placeholder="Pengirim" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="classification" placeholder="Klasifikasi" className="rounded-md border px-3 py-2 text-sm" />
      <input name="subject" placeholder="Perihal" className="rounded-md border px-3 py-2 text-sm md:col-span-2" required />
      <input name="fileUrl" type="url" placeholder="URL file surat" className="rounded-md border px-3 py-2 text-sm md:col-span-2" />
      <textarea name="summary" placeholder="Ringkasan" className="rounded-md border px-3 py-2 text-sm md:col-span-2" />
      <div className="flex items-center gap-3 md:col-span-2">
        <button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-indigo-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"><Inbox className="h-4 w-4" />{pending ? "Menyimpan..." : "Catat Surat Masuk"}</button>
        <Message text={message} />
      </div>
    </form>
  );
}

export function OutgoingLetterForm({ templates, staff }: { templates: Option[]; staff: Option[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitJson("/api/admin/tata-usaha/outgoing-letters", {
        letterNumber: form.get("letterNumber") || null,
        agendaNumber: form.get("agendaNumber") || null,
        templateId: form.get("templateId") || null,
        recipient: form.get("recipient"),
        recipientType: form.get("recipientType"),
        subject: form.get("subject"),
        body: form.get("body"),
        letterDate: form.get("letterDate"),
        status: form.get("status"),
        fileUrl: form.get("fileUrl") || null,
        signedBy: form.get("signedBy") || null,
      });
      event.currentTarget.reset();
      setMessage("Surat keluar tersimpan.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan surat keluar.");
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2">
      <input name="letterNumber" placeholder="Nomor surat otomatis jika kosong" className="rounded-md border px-3 py-2 text-sm" />
      <input name="agendaNumber" placeholder="Agenda otomatis jika kosong" className="rounded-md border px-3 py-2 text-sm" />
      <select name="templateId" className="rounded-md border px-3 py-2 text-sm"><option value="">Tanpa template</option>{templates.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <select name="signedBy" className="rounded-md border px-3 py-2 text-sm"><option value="">Penandatangan</option>{staff.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <input name="recipient" placeholder="Penerima" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="recipientType" defaultValue="GENERAL" className="rounded-md border px-3 py-2 text-sm" />
      <input name="subject" placeholder="Perihal" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="letterDate" type="date" className="rounded-md border px-3 py-2 text-sm" required />
      <select name="status" defaultValue="DRAFT" className="rounded-md border px-3 py-2 text-sm"><option value="DRAFT">Draft</option><option value="WAITING_APPROVAL">Ajukan Approval</option><option value="APPROVED">Disetujui</option><option value="SENT">Terkirim</option></select>
      <input name="fileUrl" type="url" placeholder="URL file" className="rounded-md border px-3 py-2 text-sm" />
      <textarea name="body" placeholder="Isi surat" className="rounded-md border px-3 py-2 text-sm md:col-span-2" />
      <div className="flex items-center gap-3 md:col-span-2">
        <button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-indigo-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"><Send className="h-4 w-4" />{pending ? "Menyimpan..." : "Simpan Surat Keluar"}</button>
        <Message text={message} />
      </div>
    </form>
  );
}

export function ApproveLetterButton({ letterId, status }: { letterId: string; status: "APPROVED" | "CANCELLED" }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  async function review() {
    setPending(true);
    try {
      await submitJson(`/api/admin/tata-usaha/outgoing-letters/${letterId}/approve`, { status }, "PATCH");
      router.refresh();
    } finally {
      setPending(false);
    }
  }
  return <button onClick={review} disabled={pending} className="rounded-md border px-2 py-1 text-xs font-semibold disabled:opacity-60">{status === "APPROVED" ? "Setujui" : "Batal"}</button>;
}

export function DispositionForm({ incoming, outgoing, staff }: { incoming: Option[]; outgoing: Option[]; staff: Option[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitJson("/api/admin/tata-usaha/dispositions", {
        incomingLetterId: form.get("incomingLetterId") || null,
        outgoingLetterId: form.get("outgoingLetterId") || null,
        assignedTo: form.get("assignedTo"),
        instruction: form.get("instruction"),
        dueDate: form.get("dueDate") || null,
        notes: form.get("notes"),
      });
      event.currentTarget.reset();
      setMessage("Disposisi tersimpan.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan disposisi.");
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2">
      <select name="incomingLetterId" className="rounded-md border px-3 py-2 text-sm"><option value="">Surat masuk</option>{incoming.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <select name="outgoingLetterId" className="rounded-md border px-3 py-2 text-sm"><option value="">Surat keluar</option>{outgoing.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <select name="assignedTo" className="rounded-md border px-3 py-2 text-sm" required><option value="">Tujuan disposisi</option>{staff.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <input name="dueDate" type="date" className="rounded-md border px-3 py-2 text-sm" />
      <input name="instruction" placeholder="Instruksi" className="rounded-md border px-3 py-2 text-sm md:col-span-2" required />
      <textarea name="notes" placeholder="Catatan" className="rounded-md border px-3 py-2 text-sm md:col-span-2" />
      <div className="flex items-center gap-3 md:col-span-2">
        <button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-indigo-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"><Split className="h-4 w-4" />{pending ? "Menyimpan..." : "Buat Disposisi"}</button>
        <Message text={message} />
      </div>
    </form>
  );
}

export function GenerateLetterForm({ templates, students, staff }: { templates: Option[]; students: Option[]; staff: Option[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitJson("/api/admin/tata-usaha/generated-letters", {
        templateId: form.get("templateId"),
        studentId: form.get("studentId") || null,
        staffId: form.get("staffId") || null,
        subjectName: form.get("subjectName") || null,
        subjectIdentifier: form.get("subjectIdentifier") || null,
        variables: { keperluan: form.get("purpose") || "" },
      });
      event.currentTarget.reset();
      setMessage("Surat tergenerate.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal generate surat.");
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2">
      <select name="templateId" className="rounded-md border px-3 py-2 text-sm" required><option value="">Pilih template</option>{templates.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <input name="purpose" placeholder="Keperluan" className="rounded-md border px-3 py-2 text-sm" />
      <select name="studentId" className="rounded-md border px-3 py-2 text-sm"><option value="">Pilih siswa</option>{students.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <select name="staffId" className="rounded-md border px-3 py-2 text-sm"><option value="">Pilih pegawai</option>{staff.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <input name="subjectName" placeholder="Nama subjek manual" className="rounded-md border px-3 py-2 text-sm" />
      <input name="subjectIdentifier" placeholder="NIS/NIP/manual" className="rounded-md border px-3 py-2 text-sm" />
      <div className="flex items-center gap-3 md:col-span-2">
        <button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-indigo-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"><FileOutput className="h-4 w-4" />{pending ? "Generate..." : "Generate Surat"}</button>
        <Message text={message} />
      </div>
    </form>
  );
}

export function ArchiveForm({ incoming, outgoing, generated }: { incoming: Option[]; outgoing: Option[]; generated: Option[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitJson("/api/admin/tata-usaha/archives", {
        code: form.get("code") || null,
        title: form.get("title"),
        category: form.get("category"),
        visibility: form.get("visibility"),
        incomingLetterId: form.get("incomingLetterId") || null,
        outgoingLetterId: form.get("outgoingLetterId") || null,
        generatedLetterId: form.get("generatedLetterId") || null,
        fileUrl: form.get("fileUrl") || null,
        tags: String(form.get("tags") ?? "").split(",").map((item) => item.trim()).filter(Boolean),
        notes: form.get("notes"),
      });
      event.currentTarget.reset();
      setMessage("Arsip tersimpan.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan arsip.");
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2">
      <input name="code" placeholder="Kode arsip otomatis jika kosong" className="rounded-md border px-3 py-2 text-sm" />
      <input name="title" placeholder="Judul arsip" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="category" defaultValue="SURAT" className="rounded-md border px-3 py-2 text-sm" />
      <select name="visibility" defaultValue="INTERNAL" className="rounded-md border px-3 py-2 text-sm"><option value="INTERNAL">Internal</option><option value="RESTRICTED">Terbatas</option><option value="PUBLIC_LINK">Public Link</option></select>
      <select name="incomingLetterId" className="rounded-md border px-3 py-2 text-sm"><option value="">Surat masuk</option>{incoming.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <select name="outgoingLetterId" className="rounded-md border px-3 py-2 text-sm"><option value="">Surat keluar</option>{outgoing.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <select name="generatedLetterId" className="rounded-md border px-3 py-2 text-sm"><option value="">Generated letter</option>{generated.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <input name="fileUrl" type="url" placeholder="URL file arsip" className="rounded-md border px-3 py-2 text-sm" />
      <input name="tags" placeholder="tag dipisah koma" className="rounded-md border px-3 py-2 text-sm md:col-span-2" />
      <textarea name="notes" placeholder="Catatan" className="rounded-md border px-3 py-2 text-sm md:col-span-2" />
      <div className="flex items-center gap-3 md:col-span-2">
        <button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-indigo-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"><Archive className="h-4 w-4" />{pending ? "Menyimpan..." : "Simpan Arsip"}</button>
        <Message text={message} />
      </div>
    </form>
  );
}

