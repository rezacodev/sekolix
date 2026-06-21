"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  BarChart2,
  Users,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Star,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────────────

interface TopStudent { id: string; fullName: string; avgScore: number }

interface ClassSummary {
  rombelId: string;
  rombelName: string;
  className: string;
  subjectId: string;
  subjectName: string;
  studentCount: number;
  rubricCount: number;
  studentsWithGrades: number;
  avgScore: number | null;
  passCount: number;
  passRate: number | null;
  topStudents: TopStudent[];
  needAttention: TopStudent[];
}

interface LaporanNilai {
  summary: { totalRombel: number; totalSubjects: number; overallAvgScore: number | null; overallPassRate: number | null };
  byClass: ClassSummary[];
  filters: { rombels: { id: string; name: string; className: string }[]; subjects: { id: string; name: string }[] };
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function LaporanNilaiPage() {
  const [data, setData] = useState<LaporanNilai | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterRombel, setFilterRombel] = useState("all");
  const [filterSubject, setFilterSubject] = useState("all");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterRombel !== "all") params.set("rombelId", filterRombel);
      if (filterSubject !== "all") params.set("subjectId", filterSubject);
      const res = await fetch(`/api/teacher/laporan/nilai?${params}`);
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      toast.error("Gagal memuat laporan nilai");
    } finally {
      setLoading(false);
    }
  }, [filterRombel, filterSubject]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const exportUrl = () => {
    const params = new URLSearchParams();
    if (filterRombel !== "all") params.set("rombelId", filterRombel);
    if (filterSubject !== "all") params.set("subjectId", filterSubject);
    return `/api/teacher/laporan/nilai/export?${params}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Laporan Nilai</h1>
          <p className="text-sm text-muted-foreground">Rekap nilai dan prestasi siswa per kelas dan mata pelajaran</p>
        </div>
        <Button variant="outline" asChild className="gap-1">
          <a href={exportUrl()} download>
            <FileSpreadsheet className="h-4 w-4" /> Export Excel
          </a>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={filterRombel} onValueChange={setFilterRombel}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Semua Kelas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kelas</SelectItem>
            {data?.filters.rombels.map((r) => (
              <SelectItem key={r.id} value={r.id}>{r.name} — {r.className}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterSubject} onValueChange={setFilterSubject}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Semua Mapel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Mapel</SelectItem>
            {data?.filters.subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(filterRombel !== "all" || filterSubject !== "all") && (
          <Button variant="ghost" size="sm" onClick={() => { setFilterRombel("all"); setFilterSubject("all"); }}>
            Reset
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !data ? null : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card><CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Total Kelas</p>
                  <p className="text-2xl font-bold">{data.summary.totalRombel}</p>
                  <p className="text-xs text-muted-foreground">{data.summary.totalSubjects} mapel</p>
                </div>
              </div>
            </CardContent></Card>

            <Card><CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Rata-rata Nilai</p>
                  <p className={`text-2xl font-bold ${(data.summary.overallAvgScore ?? 0) >= 70 ? "text-green-600" : "text-amber-500"}`}>
                    {data.summary.overallAvgScore ?? "—"}
                  </p>
                </div>
              </div>
            </CardContent></Card>

            <Card><CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Pass Rate</p>
                  <p className={`text-2xl font-bold ${(data.summary.overallPassRate ?? 0) >= 75 ? "text-green-600" : "text-red-500"}`}>
                    {data.summary.overallPassRate !== null ? `${data.summary.overallPassRate}%` : "—"}
                  </p>
                </div>
              </div>
            </CardContent></Card>

            <Card><CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Sumber Data</p>
                  <p className="text-2xl font-bold">{data.byClass.reduce((s, c) => s + c.rubricCount, 0)}</p>
                  <p className="text-xs text-muted-foreground">rubrik penilaian</p>
                </div>
              </div>
            </CardContent></Card>
          </div>

          {/* Class cards */}
          {data.byClass.length === 0 ? (
            <Card><CardContent className="py-16 text-center text-muted-foreground">
              <BarChart2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Belum ada data nilai. Isi penilaian di menu Nilai Siswa terlebih dahulu.</p>
            </CardContent></Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {data.byClass.map((cls) => (
                <Card key={`${cls.rombelId}-${cls.subjectId}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-sm">{cls.subjectName}</CardTitle>
                        <p className="text-xs text-muted-foreground">{cls.rombelName} — {cls.className}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" asChild className="h-7 w-7 p-0">
                          <Link href={`/teacher/laporan/nilai?rombelId=${cls.rombelId}&subjectId=${cls.subjectId}`}>
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Stats row */}
                    <div className="flex gap-5 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Rata-rata</p>
                        <p className={`font-semibold text-base ${(cls.avgScore ?? 0) >= 70 ? "text-green-600" : "text-red-500"}`}>
                          {cls.avgScore ?? "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Lulus</p>
                        <p className="font-semibold text-base">{cls.passCount}/{cls.studentsWithGrades}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Pass Rate</p>
                        <p className={`font-semibold text-base ${(cls.passRate ?? 0) >= 75 ? "text-green-600" : "text-red-500"}`}>
                          {cls.passRate !== null ? `${cls.passRate}%` : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Didata</p>
                        <p className="font-semibold text-base">{cls.studentsWithGrades}/{cls.studentCount}</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    {cls.passRate !== null && (
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${cls.passRate >= 75 ? "bg-green-500" : cls.passRate >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${cls.passRate}%` }}
                        />
                      </div>
                    )}

                    {/* Top students */}
                    {cls.topStudents.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                          <Star className="h-3 w-3" /> Terbaik
                        </p>
                        <div className="flex flex-col gap-0.5">
                          {cls.topStudents.map((s) => (
                            <div key={s.id} className="flex items-center justify-between text-xs">
                              <Link href={`/teacher/laporan/nilai/${s.id}`} className="hover:underline truncate max-w-[180px]">{s.fullName}</Link>
                              <span className="text-green-600 font-medium ml-2">{s.avgScore}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Need attention */}
                    {cls.needAttention.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                          <AlertTriangle className="h-3 w-3 text-amber-500" /> Perlu Perhatian
                        </p>
                        <div className="flex flex-col gap-0.5">
                          {cls.needAttention.map((s) => (
                            <div key={s.id} className="flex items-center justify-between text-xs">
                              <Link href={`/teacher/laporan/nilai/${s.id}`} className="hover:underline truncate max-w-[180px]">{s.fullName}</Link>
                              <span className="text-red-500 font-medium ml-2">{s.avgScore}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
