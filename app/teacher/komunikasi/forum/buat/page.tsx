"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";

interface Rombel {
  id: string;
  name: string;
  className: string;
  subjects: { id: string; name: string }[];
}

export default function BuatForumPage() {
  const router = useRouter();
  const [rombels, setRombels] = useState<Rombel[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    title: "",
    content: "",
    rombelId: "none",
    subjectId: "none",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/teacher/komunikasi/forum")
      .then((r) => r.json())
      .then((data) => setRombels(data.filterRombels ?? []));
  }, []);

  function handleRombelChange(value: string) {
    setForm((f) => ({ ...f, rombelId: value, subjectId: "none" }));
    if (value !== "none") {
      fetch(`/api/teacher/my-classes/${value}/subjects`)
        .then((r) => r.json())
        .then((data) => setSubjects(data.subjects ?? []));
    } else {
      setSubjects([]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/teacher/komunikasi/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          content: form.content,
          rombelId: form.rombelId !== "none" ? form.rombelId : undefined,
          subjectId: form.subjectId !== "none" ? form.subjectId : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.id) {
        router.push(`/teacher/komunikasi/forum/${data.id}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Buat Diskusi Baru</h1>
          <p className="text-muted-foreground text-sm">Buat topik diskusi untuk siswa atau rekan guru</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Detail Diskusi</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Judul Diskusi *</Label>
              <Input
                id="title"
                placeholder="Masukkan judul diskusi..."
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Isi Diskusi *</Label>
              <Textarea
                id="content"
                placeholder="Tuliskan topik atau pertanyaan diskusi..."
                rows={6}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rombel (Opsional)</Label>
                <Select value={form.rombelId} onValueChange={handleRombelChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih rombel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak dipilih</SelectItem>
                    {rombels.map((r) => (
                      <SelectItem key={r.id} value={r.id}>{r.className} - {r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mata Pelajaran (Opsional)</Label>
                <Select
                  value={form.subjectId}
                  onValueChange={(v) => setForm((f) => ({ ...f, subjectId: v }))}
                  disabled={subjects.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih mapel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak dipilih</SelectItem>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Membuat..." : "Buat Diskusi"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
