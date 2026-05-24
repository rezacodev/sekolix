"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  ArrowLeft,
  Save,
  Search,
  BookOpen,
  Plus,
  X,
  Check,
  AlertCircle,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Subject {
  id: number;
  name: string;
}

interface Question {
  id: string;
  subject_id: number;
  question_type: string;
  difficulty: string;
  cognitive_level: string;
  question_text: string;
  options?: string[];
  correct_answer: string;
  tags: string[];
  topic?: string;
}

const EXAM_TYPES = [
  { value: "KUIS", label: "Kuis" },
  { value: "UTS", label: "UTS" },
  { value: "UAS", label: "UAS" },
  { value: "ULANGAN_HARIAN", label: "Ulangan Harian" },
  { value: "LATIHAN", label: "Latihan" },
] as const;

const DIFF_COLORS: Record<string, string> = {
  MUDAH: "bg-green-100 text-green-700",
  SEDANG: "bg-amber-100 text-amber-700",
  SULIT: "bg-red-100 text-red-700",
};

const TYPE_LABELS: Record<string, string> = {
  MULTIPLE_CHOICE: "PG",
  TRUE_FALSE: "B/S",
  SHORT_ANSWER: "Isian",
  ESSAY: "Esai",
  MATCHING: "Pasangan",
};

// ─── Page ───────────────────────────────────────────────────────────────────

export default function BuatPaketPage() {
  const router = useRouter();

  // ── Form fields ───────────────────────────────────────────────────────────
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [examType, setExamType] = useState<string>("KUIS");
  const [duration, setDuration] = useState(60);
  const [passingGrade, setPassingGrade] = useState(70);
  const [randomize, setRandomize] = useState(false);

  // ── Question picker ───────────────────────────────────────────────────────
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [bankQuestions, setBankQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [qSearch, setQSearch] = useState("");
  const [qFilterDiff, setQFilterDiff] = useState("all");
  const [qFilterType, setQFilterType] = useState("all");
  const [qLoading, setQLoading] = useState(false);

  // ── Save state ────────────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);

  // Fetch subjects
  useEffect(() => {
    fetch("/api/teacher/subjects")
      .then((r) => r.json())
      .then((data) => {
        const list = (data.subjects ?? data).map((s: { id: number; name: string }) => ({
          id: Number(s.id),
          name: s.name,
        }));
        setSubjects(list);
      })
      .catch(() => {});
  }, []);

  // Fetch bank soal when subjectId changes
  const fetchBankSoal = useCallback(async () => {
    if (!subjectId) { setBankQuestions([]); return; }
    try {
      setQLoading(true);
      const params = new URLSearchParams({
        subjectId,
        pageSize: "100",
        ...(qSearch ? { search: qSearch } : {}),
        ...(qFilterDiff !== "all" ? { difficulty: qFilterDiff } : {}),
        ...(qFilterType !== "all" ? { question_type: qFilterType } : {}),
      });
      const res = await fetch(`/api/teacher/bank-soal?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBankQuestions(data.questions ?? data.data ?? data);
    } catch {
      toast.error("Gagal memuat bank soal");
    } finally {
      setQLoading(false);
    }
  }, [subjectId, qSearch, qFilterDiff, qFilterType]);

  useEffect(() => { fetchBankSoal(); }, [fetchBankSoal]);

  const toggleQuestion = (q: Question) => {
    setSelectedQuestions((prev) => {
      const exists = prev.find((sq) => sq.id === q.id);
      return exists ? prev.filter((sq) => sq.id !== q.id) : [...prev, q];
    });
  };

  const removeQuestion = (id: string) => {
    setSelectedQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const isSelected = (id: string) => selectedQuestions.some((q) => q.id === id);

  // Available bank questions (not yet selected)
  const availableQuestions = bankQuestions.filter((q) => !isSelected(q.id));

  const handleSave = async (publish = false) => {
    if (!title.trim()) { toast.error("Judul paket harus diisi"); return; }
    if (!subjectId) { toast.error("Pilih mata pelajaran"); return; }
    if (publish && selectedQuestions.length === 0) {
      toast.error("Tambahkan minimal satu soal sebelum mempublikasi");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/teacher/ujian/paket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject_id: parseInt(subjectId),
          title: title.trim(),
          description: description.trim() || null,
          exam_type: examType,
          duration,
          passing_grade: passingGrade,
          randomize,
          question_ids: selectedQuestions.map((q) => parseInt(q.id)),
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Gagal menyimpan paket"); return; }

      if (publish) {
        await fetch(`/api/teacher/ujian/paket/${data.id}/publish`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publish: true }),
        });
      }

      toast.success(publish ? "Paket disimpan dan dipublikasikan" : "Paket berhasil disimpan sebagai draft");
      router.push("/teacher/ujian/paket");
    } catch {
      toast.error("Gagal menyimpan paket");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Buat Paket Ujian</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Susun soal dari bank soal menjadi paket ujian</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            Simpan Draft
          </Button>
          <Button onClick={() => handleSave(true)} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
            Simpan & Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6">
        {/* Left: Form settings */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Informasi Paket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Judul Paket <span className="text-destructive">*</span></label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ujian Tengah Semester Matematika"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Deskripsi</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Petunjuk pengerjaan ujian..."
                  className="w-full h-20 px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Mata Pelajaran <span className="text-destructive">*</span></label>
                <Select value={subjectId} onValueChange={setSubjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih mata pelajaran..." />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Tipe Ujian</label>
                <Select value={examType} onValueChange={setExamType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAM_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Durasi (menit)</label>
                  <Input
                    type="number"
                    min={1}
                    max={300}
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Passing Grade (%)</label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={passingGrade}
                    onChange={(e) => setPassingGrade(parseInt(e.target.value) || 70)}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={randomize}
                  onChange={(e) => setRandomize(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Acak urutan soal</span>
              </label>
            </CardContent>
          </Card>

          {/* Selected questions summary */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Soal Terpilih
                </CardTitle>
                <Badge variant={selectedQuestions.length > 0 ? "default" : "secondary"}>
                  {selectedQuestions.length} soal
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {selectedQuestions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  Belum ada soal dipilih
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {selectedQuestions.map((q, idx) => (
                    <div key={q.id} className="flex items-start gap-2 group">
                      <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0 opacity-40" />
                      <span className="text-xs text-muted-foreground w-5 shrink-0 mt-0.5">{idx + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs line-clamp-2">{q.question_text}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${DIFF_COLORS[q.difficulty] ?? ""}`}>
                            {q.difficulty}
                          </span>
                          <span className="text-xs text-muted-foreground">{TYPE_LABELS[q.question_type] ?? q.question_type}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                        onClick={() => removeQuestion(q.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Bank soal picker */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pilih Soal dari Bank Soal</CardTitle>
            <CardDescription>
              {subjectId ? `${bankQuestions.length} soal tersedia · ${availableQuestions.length} belum dipilih` : "Pilih mata pelajaran terlebih dahulu"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-3">
            {/* Bank soal filters */}
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-40">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Cari soal..."
                  value={qSearch}
                  onChange={(e) => setQSearch(e.target.value)}
                  className="pl-8 h-8 text-sm"
                  disabled={!subjectId}
                />
              </div>
              <Select value={qFilterType} onValueChange={setQFilterType} disabled={!subjectId}>
                <SelectTrigger className="w-32 h-8 text-sm">
                  <SelectValue placeholder="Tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tipe</SelectItem>
                  <SelectItem value="MULTIPLE_CHOICE">PG</SelectItem>
                  <SelectItem value="TRUE_FALSE">B/S</SelectItem>
                  <SelectItem value="SHORT_ANSWER">Isian</SelectItem>
                  <SelectItem value="ESSAY">Esai</SelectItem>
                </SelectContent>
              </Select>
              <Select value={qFilterDiff} onValueChange={setQFilterDiff} disabled={!subjectId}>
                <SelectTrigger className="w-32 h-8 text-sm">
                  <SelectValue placeholder="Kesulitan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tingkat</SelectItem>
                  <SelectItem value="MUDAH">Mudah</SelectItem>
                  <SelectItem value="SEDANG">Sedang</SelectItem>
                  <SelectItem value="SULIT">Sulit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Question list */}
            <div className="flex-1 overflow-y-auto space-y-2 max-h-[520px] pr-1">
              {!subjectId ? (
                <div className="text-center py-16 text-muted-foreground text-sm">
                  <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  Pilih mata pelajaran untuk melihat bank soal
                </div>
              ) : qLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : availableQuestions.length === 0 && selectedQuestions.length === bankQuestions.length && bankQuestions.length > 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  <Check className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  Semua soal sudah dipilih
                </div>
              ) : availableQuestions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  Tidak ada soal ditemukan
                </div>
              ) : (
                availableQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => toggleQuestion(q)}
                  >
                    <div className="mt-0.5">
                      <div className="w-4 h-4 rounded border-2 border-muted-foreground/40 flex items-center justify-center">
                        {isSelected(q.id) && <Check className="h-2.5 w-2.5 text-primary" />}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2 font-medium">{q.question_text}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${DIFF_COLORS[q.difficulty] ?? ""}`}>
                          {q.difficulty}
                        </span>
                        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {TYPE_LABELS[q.question_type] ?? q.question_type}
                        </span>
                        {q.topic && (
                          <span className="text-xs text-muted-foreground">{q.topic}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-primary"
                      onClick={(e) => { e.stopPropagation(); toggleQuestion(q); }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
