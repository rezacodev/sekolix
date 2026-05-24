"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────────────

interface EssayAnswer {
  id: string;
  question_id: string;
  question_text: string;
  answer: string;
  score: number | null;
  essay_note: string;
  is_graded: boolean;
}

interface AttemptData {
  id: string;
  student: { id: string; fullName: string; nisn: string };
  status: string;
  submitted_at: string | null;
  graded_at: string | null;
  essay_answers: EssayAnswer[];
  all_graded: boolean;
}

interface KoreksiData {
  schedule_id: string;
  schedule_title: string;
  essay_question_count: number;
  attempts: AttemptData[];
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function KoreksiEssayPage({ params }: { params: Promise<{ jadwalId: string }> }) {
  const { jadwalId } = use(params);
  const router = useRouter();

  const [data, setData] = useState<KoreksiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedAttempts, setExpandedAttempts] = useState<Set<string>>(new Set());

  // Local scores and notes keyed by answer_id
  const [localScores, setLocalScores] = useState<Record<string, { score: string; note: string }>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    fetch(`/api/teacher/ujian/hasil/${jadwalId}/koreksi`)
      .then((r) => r.json())
      .then((d: KoreksiData) => {
        setData(d);
        // Pre-populate local state with existing scores
        const init: Record<string, { score: string; note: string }> = {};
        d.attempts.forEach((a) => {
          a.essay_answers.forEach((ans) => {
            init[ans.id] = {
              score: ans.score !== null ? String(ans.score) : "",
              note: ans.essay_note ?? "",
            };
          });
        });
        setLocalScores(init);
        // Auto-expand attempts that need grading
        const toExpand = new Set(d.attempts.filter((a) => !a.all_graded).map((a) => a.id));
        setExpandedAttempts(toExpand);
      })
      .catch(() => toast.error("Gagal memuat data koreksi"))
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, [jadwalId]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleExpand = (attemptId: string) => {
    setExpandedAttempts((prev) => {
      const next = new Set(prev);
      if (next.has(attemptId)) next.delete(attemptId);
      else next.add(attemptId);
      return next;
    });
  };

  const handleSave = async (attempt: AttemptData) => {
    const corrections = attempt.essay_answers.map((ans) => {
      const local = localScores[ans.id];
      const scoreNum = parseFloat(local?.score ?? "");
      if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
        throw new Error(`Nilai tidak valid untuk jawaban siswa ${attempt.student.fullName}`);
      }
      return {
        answer_record_id: ans.id,
        score: scoreNum,
        essay_note: local?.note ?? "",
      };
    });

    try {
      setSaving(attempt.id);
      const res = await fetch(`/api/teacher/ujian/hasil/${jadwalId}/koreksi`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attempt_id: attempt.id, corrections }),
      });
      const result = await res.json();
      if (!res.ok) { toast.error(result.error ?? "Gagal menyimpan koreksi"); return; }
      toast.success(
        result.final_score !== undefined
          ? `Koreksi disimpan. Nilai akhir: ${result.final_score} (${result.is_passed ? "LULUS" : "TIDAK LULUS"})`
          : "Koreksi disimpan (sebagian soal belum dikoreksi)"
      );
      fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan koreksi");
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) return null;

  const pendingCount = data.attempts.filter((a) => !a.all_graded).length;

  return (
    <div className="space-y-6 p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Koreksi Essay</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{data.schedule_title}</p>
        </div>
      </div>

      {/* Summary banner */}
      <div className={`rounded-lg p-3 flex items-center gap-3 text-sm ${pendingCount === 0 ? "bg-green-50 border border-green-200 dark:bg-green-950/20" : "bg-amber-50 border border-amber-200 dark:bg-amber-950/20"}`}>
        {pendingCount === 0 ? (
          <>
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            <span className="text-green-800 dark:text-green-300 font-medium">Semua jawaban essay sudah dikoreksi.</span>
          </>
        ) : (
          <>
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <span className="text-amber-800 dark:text-amber-300 font-medium">
              {pendingCount} siswa belum selesai dikoreksi · {data.essay_question_count} soal essay
            </span>
          </>
        )}
      </div>

      {/* Attempt cards */}
      {data.attempts.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Tidak ada soal essay yang perlu dikoreksi.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.attempts.map((attempt) => {
            const isExpanded = expandedAttempts.has(attempt.id);
            const isSaving = saving === attempt.id;
            const pendingAnswers = attempt.essay_answers.filter((a) => {
              const local = localScores[a.id];
              return !local || local.score === "";
            }).length;

            return (
              <Card key={attempt.id} className={attempt.all_graded ? "opacity-75" : ""}>
                {/* Card header — click to expand */}
                <CardHeader
                  className="pb-3 cursor-pointer select-none"
                  onClick={() => toggleExpand(attempt.id)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {attempt.all_graded ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                      )}
                      <div>
                        <CardTitle className="text-sm">{attempt.student.fullName}</CardTitle>
                        <p className="text-xs text-muted-foreground">{attempt.student.nisn || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {attempt.all_graded ? (
                        <Badge variant="outline" className="text-xs text-green-600 border-green-300">Selesai</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                          {pendingAnswers} belum dinilai
                        </Badge>
                      )}
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0 space-y-4">
                    {attempt.essay_answers.map((ans, qi) => {
                      const local = localScores[ans.id] ?? { score: "", note: "" };
                      return (
                        <div key={ans.id} className="space-y-2 pb-4 border-b last:border-0">
                          <p className="text-xs font-semibold text-muted-foreground">Soal {qi + 1}</p>
                          <div className="bg-muted/40 rounded p-3 text-sm">
                            <p className="text-muted-foreground text-xs mb-1 font-medium">Pertanyaan:</p>
                            <p>{ans.question_text}</p>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-950/20 rounded p-3 text-sm border border-blue-100 dark:border-blue-900">
                            <p className="text-blue-700 dark:text-blue-300 text-xs mb-1 font-medium">Jawaban Siswa:</p>
                            <p className="whitespace-pre-wrap">{ans.answer || <span className="italic text-muted-foreground">(tidak dijawab)</span>}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-xs font-medium">Nilai (0–100) <span className="text-destructive">*</span></label>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                placeholder="0–100"
                                value={local.score}
                                onChange={(e) =>
                                  setLocalScores((prev) => ({
                                    ...prev,
                                    [ans.id]: { ...prev[ans.id], score: e.target.value },
                                  }))
                                }
                                className="font-mono"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-medium">Catatan (opsional)</label>
                              <Textarea
                                placeholder="Catatan untuk siswa..."
                                value={local.note}
                                onChange={(e) =>
                                  setLocalScores((prev) => ({
                                    ...prev,
                                    [ans.id]: { ...prev[ans.id], note: e.target.value },
                                  }))
                                }
                                rows={2}
                                className="resize-none text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <div className="flex justify-end pt-1">
                      <Button
                        size="sm"
                        onClick={() => handleSave(attempt)}
                        disabled={isSaving}
                        className="gap-1"
                      >
                        {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        Simpan Koreksi
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
