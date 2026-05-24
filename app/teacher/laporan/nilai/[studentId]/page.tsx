"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  ArrowLeft,
  User,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Users,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────────────

interface RubricEntry { name: string; type: string; score: number; weight: number }

interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  rubrics: RubricEntry[];
  weightedAvg: number | null;
  attendance: { hadir: number; total: number };
  attendanceRate: number | null;
}

interface StudentProgress {
  student: {
    id: string;
    fullName: string;
    nisn: string;
    rombel: { id: string; name: string; className: string } | null;
  };
  subjects: SubjectProgress[];
}

const TYPE_LABELS: Record<string, string> = {
  TUGAS: "Tugas", UTS: "UTS", UAS: "UAS", PRAKTIK: "Praktik", ULANGAN_HARIAN: "Ulangan Harian",
};

// ─── Page ───────────────────────────────────────────────────────────────────

export default function StudentProgressPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = use(params);
  const router = useRouter();
  const [data, setData] = useState<StudentProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/teacher/laporan/nilai/${studentId}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => toast.error("Gagal memuat data siswa"))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  if (!data) return null;

  const { student, subjects } = data;
  const overallAvg = subjects.filter((s) => s.weightedAvg !== null).length > 0
    ? subjects.filter((s) => s.weightedAvg !== null).reduce((sum, s) => sum + (s.weightedAvg ?? 0), 0) /
      subjects.filter((s) => s.weightedAvg !== null).length
    : null;

  return (
    <div className="space-y-6 p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{student.fullName}</h1>
          <p className="text-sm text-muted-foreground">
            NISN: {student.nisn || "—"} · {student.rombel ? `${student.rombel.name} — ${student.rombel.className}` : ""}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-4 pb-4 text-center">
          <User className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Mapel</p>
          <p className="text-2xl font-bold">{subjects.length}</p>
        </CardContent></Card>

        <Card><CardContent className="pt-4 pb-4 text-center">
          <TrendingUp className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Rata-rata</p>
          <p className={`text-2xl font-bold ${overallAvg !== null && overallAvg >= 70 ? "text-green-600" : "text-red-500"}`}>
            {overallAvg !== null ? (Math.round(overallAvg * 10) / 10) : "—"}
          </p>
        </CardContent></Card>

        <Card><CardContent className="pt-4 pb-4 text-center">
          <Users className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Lulus</p>
          <p className="text-2xl font-bold">
            {subjects.filter((s) => s.weightedAvg !== null && s.weightedAvg >= 70).length}/{subjects.filter((s) => s.weightedAvg !== null).length}
          </p>
        </CardContent></Card>
      </div>

      {/* Per-subject cards */}
      {subjects.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground">
          <p>Belum ada data nilai untuk siswa ini.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-4">
          {subjects.map((subj) => {
            const isPassed = subj.weightedAvg !== null && subj.weightedAvg >= 70;
            return (
              <Card key={subj.subjectId}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{subj.subjectName}</CardTitle>
                    <div className="flex items-center gap-2">
                      {subj.weightedAvg !== null && (
                        <>
                          <span className={`text-lg font-bold ${isPassed ? "text-green-600" : "text-red-500"}`}>
                            {subj.weightedAvg}
                          </span>
                          <Badge variant="outline" className={`text-xs ${isPassed ? "text-green-600 border-green-300" : "text-red-500 border-red-300"}`}>
                            {isPassed ? <><CheckCircle2 className="h-3 w-3 mr-1" />TUNTAS</> : <><XCircle className="h-3 w-3 mr-1" />REMEDIAL</>}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Attendance */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Kehadiran:</span>
                    <span className={`font-medium ${(subj.attendanceRate ?? 0) >= 75 ? "text-green-600" : "text-amber-500"}`}>
                      {subj.attendance.hadir}/{subj.attendance.total} ({subj.attendanceRate ?? 0}%)
                    </span>
                    {subj.attendance.total > 0 && (
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-24">
                        <div
                          className={`h-full rounded-full ${(subj.attendanceRate ?? 0) >= 75 ? "bg-green-500" : "bg-amber-500"}`}
                          style={{ width: `${subj.attendanceRate ?? 0}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Rubric scores */}
                  {subj.rubrics.length > 0 ? (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-1 font-medium text-muted-foreground">Rubrik</th>
                          <th className="text-center py-1 font-medium text-muted-foreground">Tipe</th>
                          <th className="text-center py-1 font-medium text-muted-foreground">Bobot</th>
                          <th className="text-right py-1 font-medium text-muted-foreground">Nilai</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subj.rubrics.map((r, i) => (
                          <tr key={i} className="border-b last:border-0">
                            <td className="py-1.5">{r.name}</td>
                            <td className="py-1.5 text-center text-muted-foreground">{TYPE_LABELS[r.type] ?? r.type}</td>
                            <td className="py-1.5 text-center text-muted-foreground">{r.weight}</td>
                            <td className={`py-1.5 text-right font-semibold ${r.score >= 70 ? "text-green-600" : "text-red-500"}`}>
                              {r.score}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Belum ada nilai yang diinput.</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
