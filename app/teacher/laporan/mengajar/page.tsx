"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  BookOpen,
  CalendarDays,
  Users,
  TrendingUp,
  FileSpreadsheet,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────────────

interface JournalEntry {
  id: string;
  date: string;
  rombelName: string;
  className: string;
  subjectName: string;
  topic: string;
  teachingMethod: string | null;
  period: number | null;
  timeStart: string | null;
  timeEnd: string | null;
  notes: string | null;
}

interface ClassSummary {
  rombelId: string;
  rombelName: string;
  className: string;
  subjectId: string;
  subjectName: string;
  totalMeetings: number;
  avgHadir: number;
  topics: string[];
}

interface WeekData { week: string; count: number }

interface FilterOption { id: string; name: string; className?: string }

interface LaporanData {
  summary: { totalJournals: number; totalMeetings: number; totalAttendanceRecords: number; avgHadirRate: number };
  byClass: ClassSummary[];
  weeklyChart: WeekData[];
  journals: JournalEntry[];
  filters: { rombels: FilterOption[]; subjects: FilterOption[] };
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function LaporanMengajarPage() {
  const [data, setData] = useState<LaporanData | null>(null);
  const [loading, setLoading] = useState(true);

  const [filterRombel, setFilterRombel] = useState("all");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterMonth, setFilterMonth] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterRombel !== "all") params.set("rombelId", filterRombel);
      if (filterSubject !== "all") params.set("subjectId", filterSubject);
      if (filterMonth) params.set("month", filterMonth);
      const res = await fetch(`/api/teacher/laporan/mengajar?${params}`);
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      toast.error("Gagal memuat laporan mengajar");
    } finally {
      setLoading(false);
    }
  }, [filterRombel, filterSubject, filterMonth]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const exportUrl = () => {
    const params = new URLSearchParams();
    if (filterRombel !== "all") params.set("rombelId", filterRombel);
    if (filterMonth) params.set("month", filterMonth);
    return `/api/teacher/laporan/mengajar/export?${params}`;
  };

  const maxCount = data?.weeklyChart.reduce((m, w) => Math.max(m, w.count), 0) ?? 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Laporan Mengajar</h1>
          <p className="text-sm text-muted-foreground">Rekap jurnal dan absensi kelas yang Anda ampu</p>
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
        <Input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="w-44"
          placeholder="Filter bulan"
        />
        {(filterRombel !== "all" || filterSubject !== "all" || filterMonth) && (
          <Button variant="ghost" size="sm" onClick={() => { setFilterRombel("all"); setFilterSubject("all"); setFilterMonth(""); }}>
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
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card><CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Total Jurnal</p>
                  <p className="text-2xl font-bold">{data.summary.totalJournals}</p>
                </div>
              </div>
            </CardContent></Card>

            <Card><CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Total Pertemuan</p>
                  <p className="text-2xl font-bold">{data.summary.totalMeetings}</p>
                </div>
              </div>
            </CardContent></Card>

            <Card><CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Rekap Absensi</p>
                  <p className="text-2xl font-bold">{data.summary.totalAttendanceRecords}</p>
                </div>
              </div>
            </CardContent></Card>

            <Card><CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Rata-rata Hadir</p>
                  <p className={`text-2xl font-bold ${data.summary.avgHadirRate >= 75 ? "text-green-600" : "text-amber-500"}`}>
                    {data.summary.avgHadirRate}%
                  </p>
                </div>
              </div>
            </CardContent></Card>
          </div>

          {/* Weekly bar chart */}
          {data.weeklyChart.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Pertemuan per Minggu</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-end gap-1.5 h-24 overflow-x-auto pb-1">
                  {data.weeklyChart.map((w) => (
                    <div key={w.week} className="flex flex-col items-center gap-1 shrink-0">
                      <span className="text-xs text-muted-foreground">{w.count}</span>
                      <div
                        className="w-8 bg-blue-500 rounded-t"
                        style={{ height: `${Math.max(4, (w.count / maxCount) * 72)}px` }}
                        title={`${w.week}: ${w.count} pertemuan`}
                      />
                      <span className="text-xs text-muted-foreground rotate-45 origin-left w-8">{w.week.slice(5)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Per-class summary */}
          {data.byClass.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-4">
              {data.byClass.map((cls) => (
                <Card key={`${cls.rombelId}-${cls.subjectId}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{cls.subjectName}</CardTitle>
                    <p className="text-xs text-muted-foreground">{cls.rombelName} — {cls.className}</p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex gap-6 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Pertemuan</p>
                        <p className="font-semibold">{cls.totalMeetings}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Rata-rata Hadir</p>
                        <p className={`font-semibold ${cls.avgHadir >= 75 ? "text-green-600" : "text-amber-500"}`}>{cls.avgHadir}%</p>
                      </div>
                    </div>
                    {cls.topics.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Topik terakhir:</p>
                        <div className="flex flex-wrap gap-1">
                          {cls.topics.slice(0, 3).map((t, i) => (
                            <span key={i} className="text-xs bg-muted px-2 py-0.5 rounded truncate max-w-xs">{t}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Journal list */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Jurnal Mengajar ({data.journals.length} terakhir)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {data.journals.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Belum ada jurnal tercatat.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">Tanggal</th>
                        <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">Kelas</th>
                        <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">Mapel</th>
                        <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">Topik</th>
                        <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">Jam</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.journals.map((j) => (
                        <tr key={j.id} className="border-b last:border-0 hover:bg-muted/20">
                          <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{j.date}</td>
                          <td className="px-4 py-2.5 text-xs">{j.rombelName}</td>
                          <td className="px-4 py-2.5 text-xs">{j.subjectName}</td>
                          <td className="px-4 py-2.5 text-xs max-w-xs truncate">{j.topic}</td>
                          <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                            {j.timeStart && j.timeEnd ? `${j.timeStart}–${j.timeEnd}` : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
