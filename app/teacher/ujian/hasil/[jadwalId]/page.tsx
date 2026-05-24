"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  ArrowLeft,
  Users,
  TrendingUp,
  TrendingDown,
  Award,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  FileSpreadsheet,
  PenLine,
  BarChart2,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────────────

interface StudentResult {
  id: string;
  fullName: string;
  nisn: string;
  status: "BELUM" | "MENGERJAKAN" | "MENUNGGU_KOREKSI" | "SELESAI";
  score: number | null;
  auto_score: number | null;
  essay_score: number | null;
  started_at: string | null;
  submitted_at: string | null;
  graded_at: string | null;
  attempt_id: string | undefined;
  answered_count: number;
  is_passed: boolean;
  has_pending_essay: boolean;
}

interface DetailData {
  id: string;
  title: string;
  token: string;
  start_at: string;
  end_at: string;
  status: string;
  package: {
    title: string;
    exam_type: string;
    duration: number;
    passing_grade: number;
    question_count: number;
  };
  rombel: {
    name: string;
    className: string;
    student_count: number;
  };
  students: StudentResult[];
  stats: {
    total: number;
    submitted: number;
    scored: number;
    passed: number;
    not_started: number;
    in_progress: number;
    avg_score: number | null;
    highest_score: number | null;
    lowest_score: number | null;
    pass_rate: number | null;
  };
}

const STUDENT_STATUS_CONFIG = {
  BELUM:             { label: "Belum Mulai",       class: "bg-slate-100 text-slate-600 dark:bg-slate-800", icon: <Clock className="h-3 w-3" /> },
  MENGERJAKAN:       { label: "Sedang Mengerjakan", class: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  MENUNGGU_KOREKSI:  { label: "Menunggu Koreksi",  class: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300", icon: <AlertCircle className="h-3 w-3" /> },
  SELESAI:           { label: "Selesai",            class: "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300", icon: <CheckCircle2 className="h-3 w-3" /> },
};

const EXAM_TYPE_LABELS: Record<string, string> = {
  KUIS: "Kuis", UTS: "UTS", UAS: "UAS", ULANGAN_HARIAN: "Ulangan Harian", LATIHAN: "Latihan",
};

function fmtDate(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function DetailHasilPage({ params }: { params: Promise<{ jadwalId: string }> }) {
  const { jadwalId } = use(params);
  const router = useRouter();
  const [data, setData] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/teacher/ujian/hasil/${jadwalId}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => toast.error("Gagal memuat data hasil ujian"))
      .finally(() => setLoading(false));
  }, [jadwalId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>Data tidak ditemukan.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>Kembali</Button>
      </div>
    );
  }

  const { stats, package: pkg, students } = data;
  const hasEssay = students.some((s) => s.has_pending_essay);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold truncate">{data.title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {data.rombel.name} — {data.rombel.className} ·{" "}
            {EXAM_TYPE_LABELS[pkg.exam_type] ?? pkg.exam_type} · KKM {pkg.passing_grade}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {hasEssay && (
            <Button size="sm" variant="outline" asChild className="gap-1">
              <Link href={`/teacher/ujian/hasil/${jadwalId}/koreksi`}>
                <PenLine className="h-4 w-4" /> Koreksi Essay
              </Link>
            </Button>
          )}
          <Button size="sm" variant="outline" asChild className="gap-1">
            <a href={`/api/teacher/ujian/hasil/${jadwalId}/export`} download>
              <FileSpreadsheet className="h-4 w-4" /> Export Excel
            </a>
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Total Siswa</p>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">{stats.submitted} submit</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Rata-rata</p>
                <p className={`text-2xl font-bold ${stats.avg_score !== null && stats.avg_score >= pkg.passing_grade ? "text-green-600" : "text-red-500"}`}>
                  {stats.avg_score ?? "-"}
                </p>
                <p className="text-xs text-muted-foreground">dari {stats.scored} dinilai</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Tinggi / Rendah</p>
                <p className="text-2xl font-bold">
                  <span className="text-green-600">{stats.highest_score ?? "-"}</span>
                  <span className="text-muted-foreground text-base"> / </span>
                  <span className="text-red-500">{stats.lowest_score ?? "-"}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Pass Rate</p>
                <p className={`text-2xl font-bold ${(stats.pass_rate ?? 0) >= 75 ? "text-green-600" : (stats.pass_rate ?? 0) >= 50 ? "text-amber-600" : "text-red-500"}`}>
                  {stats.pass_rate !== null ? `${stats.pass_rate}%` : "-"}
                </p>
                <p className="text-xs text-muted-foreground">{stats.passed} lulus</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution bar */}
      {stats.scored > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart2 className="h-4 w-4" /> Distribusi Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex gap-4 text-xs flex-wrap">
              <span className="flex items-center gap-1.5 text-green-600 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" /> Lulus: {stats.passed}
              </span>
              <span className="flex items-center gap-1.5 text-red-500 font-medium">
                <XCircle className="h-3.5 w-3.5" /> Tidak Lulus: {stats.scored - stats.passed}
              </span>
              <span className="flex items-center gap-1.5 text-amber-600 font-medium">
                <AlertCircle className="h-3.5 w-3.5" /> Menunggu Koreksi: {stats.submitted - stats.scored}
              </span>
              <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                <Clock className="h-3.5 w-3.5" /> Belum Mulai: {stats.not_started}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Daftar Nilai Siswa</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-2.5 font-medium text-xs text-muted-foreground w-8">No</th>
                  <th className="text-left px-4 py-2.5 font-medium text-xs text-muted-foreground">Nama Siswa</th>
                  <th className="text-left px-4 py-2.5 font-medium text-xs text-muted-foreground">NISN</th>
                  <th className="text-center px-4 py-2.5 font-medium text-xs text-muted-foreground">Status</th>
                  <th className="text-center px-4 py-2.5 font-medium text-xs text-muted-foreground">Nilai Akhir</th>
                  <th className="text-center px-4 py-2.5 font-medium text-xs text-muted-foreground">Keterangan</th>
                  <th className="text-right px-4 py-2.5 font-medium text-xs text-muted-foreground">Submit</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, i) => {
                  const cfg = STUDENT_STATUS_CONFIG[student.status];
                  return (
                    <tr key={student.id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-2.5 text-muted-foreground text-xs">{i + 1}</td>
                      <td className="px-4 py-2.5 font-medium">{student.fullName}</td>
                      <td className="px-4 py-2.5 text-muted-foreground font-mono text-xs">{student.nisn || "-"}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.class}`}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {student.score !== null ? (
                          <span className={`text-base font-bold ${student.is_passed ? "text-green-600" : "text-red-500"}`}>
                            {student.score}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {student.score !== null ? (
                          <Badge
                            variant="outline"
                            className={`text-xs ${student.is_passed ? "text-green-600 border-green-300" : "text-red-500 border-red-300"}`}
                          >
                            {student.is_passed ? "LULUS" : "TIDAK LULUS"}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right text-xs text-muted-foreground">
                        {fmtDate(student.submitted_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
