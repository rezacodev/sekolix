"use client";

import { useState, useEffect, useCallback } from "react";
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
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Users,
  Lightbulb,
  BarChart2,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────────────

interface CorrelationPoint { id: string; fullName: string; attRate: number; avgScore: number }
interface AttBucket { range: string; students: number; avgScore: number | null }
interface RubricStat { id: string; name: string; type: string; subjectName: string; studentCount: number; avgScore: number | null; passCount: number; isLowScore: boolean }

interface AnalisisData {
  correlationData: CorrelationPoint[];
  attAnalysis: AttBucket[];
  rubricStats: RubricStat[];
  lowScoreRubrics: RubricStat[];
  recommendations: string[];
  summary: { totalStudents: number; withData: number; avgAttRate: number | null; avgScore: number | null };
  filters: { rombels: { id: string; name: string; className: string }[]; subjects: { id: string; name: string }[] };
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function AnalisisPage() {
  const [data, setData] = useState<AnalisisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterRombel, setFilterRombel] = useState("all");
  const [filterSubject, setFilterSubject] = useState("all");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterRombel !== "all") params.set("rombelId", filterRombel);
      if (filterSubject !== "all") params.set("subjectId", filterSubject);
      const res = await fetch(`/api/teacher/laporan/analisis?${params}`);
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      toast.error("Gagal memuat data analisis");
    } finally {
      setLoading(false);
    }
  }, [filterRombel, filterSubject]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Simple scatter: bucket into attendance quartiles
  const maxRubricScore = data?.rubricStats.reduce((m, r) => Math.max(m, r.avgScore ?? 0), 0) ?? 100;
  const maxBucketStudents = data?.attAnalysis.reduce((m, b) => Math.max(m, b.students), 1) ?? 1;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Analisis Pembelajaran</h1>
        <p className="text-sm text-muted-foreground mt-1">Korelasi kehadiran vs nilai, materi rendah, dan rekomendasi perbaikan</p>
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
                  <p className="text-xs text-muted-foreground">Total Siswa</p>
                  <p className="text-2xl font-bold">{data.summary.totalStudents}</p>
                  <p className="text-xs text-muted-foreground">{data.summary.withData} ada data</p>
                </div>
              </div>
            </CardContent></Card>

            <Card><CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Rata-rata Hadir</p>
                  <p className={`text-2xl font-bold ${(data.summary.avgAttRate ?? 0) >= 75 ? "text-green-600" : "text-amber-500"}`}>
                    {data.summary.avgAttRate !== null ? `${data.summary.avgAttRate}%` : "—"}
                  </p>
                </div>
              </div>
            </CardContent></Card>

            <Card><CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Rata-rata Nilai</p>
                  <p className={`text-2xl font-bold ${(data.summary.avgScore ?? 0) >= 70 ? "text-green-600" : "text-red-500"}`}>
                    {data.summary.avgScore ?? "—"}
                  </p>
                </div>
              </div>
            </CardContent></Card>

            <Card><CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Rubrik Rendah</p>
                  <p className={`text-2xl font-bold ${data.lowScoreRubrics.length > 0 ? "text-red-500" : "text-green-600"}`}>
                    {data.lowScoreRubrics.length}
                  </p>
                  <p className="text-xs text-muted-foreground">di bawah KKM</p>
                </div>
              </div>
            </CardContent></Card>
          </div>

          {/* Recommendations */}
          <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Lightbulb className="h-4 w-4" /> Rekomendasi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-blue-800 dark:text-blue-200">
                    <span className="shrink-0 mt-0.5">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Attendance vs Score analysis */}
          {data.attAnalysis.some((b) => b.students > 0) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart2 className="h-4 w-4" /> Korelasi Kehadiran vs Nilai
                </CardTitle>
                <p className="text-xs text-muted-foreground">Rata-rata nilai siswa berdasarkan kelompok kehadiran</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.attAnalysis.map((bucket) => (
                    <div key={bucket.range} className="flex items-center gap-3">
                      <div className="w-20 text-xs text-muted-foreground text-right shrink-0">
                        Hadir {bucket.range}%
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                          {bucket.avgScore !== null && (
                            <div
                              className={`h-full rounded-full flex items-center justify-end pr-2 text-xs font-medium text-white transition-all ${
                                bucket.avgScore >= 70 ? "bg-green-500" : bucket.avgScore >= 60 ? "bg-amber-500" : "bg-red-500"
                              }`}
                              style={{ width: `${(bucket.avgScore / 100) * 100}%` }}
                            >
                              {bucket.avgScore}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground w-20 shrink-0">
                          {bucket.students} siswa
                          {bucket.avgScore === null ? " (—)" : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rubric performance table */}
          {data.rubricStats.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Performa per Rubrik Penilaian</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">Rubrik</th>
                        <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">Mapel</th>
                        <th className="text-center px-4 py-2.5 text-xs text-muted-foreground font-medium">Siswa</th>
                        <th className="text-center px-4 py-2.5 text-xs text-muted-foreground font-medium">Rata-rata</th>
                        <th className="text-center px-4 py-2.5 text-xs text-muted-foreground font-medium">Lulus</th>
                        <th className="w-28 px-4 py-2.5"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.rubricStats.map((r) => (
                        <tr key={r.id} className={`border-b last:border-0 hover:bg-muted/20 ${r.isLowScore ? "bg-red-50/50 dark:bg-red-950/10" : ""}`}>
                          <td className="px-4 py-2.5 font-medium">
                            {r.isLowScore && <AlertTriangle className="h-3.5 w-3.5 text-red-500 inline mr-1" />}
                            {r.name}
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground text-xs">{r.subjectName}</td>
                          <td className="px-4 py-2.5 text-center text-xs">{r.studentCount}</td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={`font-semibold ${(r.avgScore ?? 0) >= 70 ? "text-green-600" : "text-red-500"}`}>
                              {r.avgScore ?? "—"}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-center text-xs">
                            {r.studentCount > 0 ? `${r.passCount}/${r.studentCount}` : "—"}
                          </td>
                          <td className="px-4 py-2.5">
                            {r.avgScore !== null && (
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${r.avgScore >= 70 ? "bg-green-500" : r.avgScore >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                                  style={{ width: `${(r.avgScore / (maxRubricScore || 100)) * 100}%` }}
                                />
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Low attendance detail */}
          {data.attAnalysis.find((b) => b.range === "<60" && b.students > 0) && (
            <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="h-4 w-4" /> Siswa Kehadiran Rendah (&lt;60%)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {data.correlationData
                    .filter((d) => d.attRate < 60)
                    .sort((a, b) => a.attRate - b.attRate)
                    .map((d) => (
                      <div key={d.id} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                        <span>{d.fullName}</span>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>Hadir: <strong className="text-amber-600">{d.attRate}%</strong></span>
                          <span>Nilai: <strong className={(d.avgScore ?? 0) >= 70 ? "text-green-600" : "text-red-500"}>{d.avgScore ?? "—"}</strong></span>
                        </div>
                      </div>
                    ))}
                  {data.correlationData.filter((d) => d.attRate < 60).length === 0 && (
                    <p className="text-sm text-muted-foreground">Tidak ada siswa dengan kehadiran di bawah 60%.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No data state */}
          {data.summary.withData === 0 && (
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground">
                <BarChart2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Belum ada data untuk dianalisis</p>
                <p className="text-sm mt-1">Pastikan jurnal mengajar, absensi, dan nilai sudah diisi.</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
