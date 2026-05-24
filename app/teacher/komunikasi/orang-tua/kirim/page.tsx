"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, CheckCircle2 } from "lucide-react";

interface SentResult {
  sent: number;
  students: { id: string; fullName: string; parent: string | null }[];
}

function KirimPesanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentIds = searchParams.get("studentIds")?.split(",").filter(Boolean) ?? [];

  const [students, setStudents] = useState<{ id: string; fullName: string; rombelName: string; className: string; parentInfo: { primaryContact: string | null } }[]>([]);
  const [form, setForm] = useState({ subject: "", content: "" });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SentResult | null>(null);

  useEffect(() => {
    if (studentIds.length === 0) return;
    fetch(`/api/teacher/komunikasi/orang-tua`)
      .then((r) => r.json())
      .then((data) => {
        const all = data.students ?? [];
        setStudents(all.filter((s: { id: string }) => studentIds.includes(s.id)));
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.content.trim() || studentIds.length === 0) return;
    setSending(true);
    try {
      const res = await fetch("/api/teacher/komunikasi/orang-tua/kirim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentIds,
          subject: form.subject || undefined,
          content: form.content,
        }),
      });
      const data = await res.json();
      if (res.ok) setResult(data);
    } finally {
      setSending(false);
    }
  }

  if (result) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-10">
            <CheckCircle2 className="w-14 h-14 text-green-500" />
            <h2 className="text-xl font-bold">Pesan Terkirim!</h2>
            <p className="text-muted-foreground text-center">
              Pesan berhasil dikirim ke <span className="font-semibold">{result.sent}</span> orang tua siswa.
            </p>
            <div className="w-full space-y-1.5 max-h-40 overflow-y-auto border rounded-lg p-3">
              {result.students.map((s) => (
                <div key={s.id} className="flex justify-between text-sm">
                  <span>{s.fullName}</span>
                  <span className="text-muted-foreground">{s.parent ?? "-"}</span>
                </div>
              ))}
            </div>
            <Button onClick={() => router.push("/teacher/komunikasi/orang-tua")}>
              Kembali ke Daftar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Kirim Pesan ke Orang Tua</h1>
          <p className="text-muted-foreground text-sm">Mengirim ke {studentIds.length} siswa</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Penerima</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {students.map((s) => (
              <Badge key={s.id} variant="secondary" className="text-xs">
                {s.fullName}
                {s.parentInfo.primaryContact && (
                  <span className="text-muted-foreground ml-1">({s.parentInfo.primaryContact})</span>
                )}
              </Badge>
            ))}
            {students.length === 0 && (
              <p className="text-sm text-muted-foreground">Memuat data siswa...</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Isi Pesan</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subjek (Opsional)</Label>
              <Input
                id="subject"
                placeholder="Masukkan subjek pesan..."
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Isi Pesan *</Label>
              <Textarea
                id="content"
                placeholder="Tulis pesan untuk orang tua siswa..."
                rows={6}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                required
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
              <Button type="submit" disabled={sending || !form.content.trim()}>
                <Send className="w-4 h-4 mr-2" />
                {sending ? "Mengirim..." : `Kirim ke ${studentIds.length} Orang Tua`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function KirimPesanPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-muted-foreground">Memuat...</div>}>
      <KirimPesanContent />
    </Suspense>
  );
}
