"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Search,
  BarChart2,
  Users,
  BookOpen,
  Calendar,
  TrendingUp,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────────────

interface HasilRow {
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
  stats: {
    total_students: number;
    submitted_count: number;
    scored_count: number;
    passed_count: number;
    avg_score: number | null;
    has_pending_essay: boolean;
  };
}

const EXAM_TYPE_LABELS: Record<string, string> = {
  KUIS: "Kuis", UTS: "UTS", UAS: "UAS", ULANGAN_HARIAN: "Ulangan Harian", LATIHAN: "Latihan",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function HasilUjianPage() {
  const [items, setItems] = useState<HasilRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  const pageSize = 15;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        ...(search ? { search } : {}),
      });
      const res = await fetch(`/api/teacher/ujian/hasil?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setItems(data.data);
      setTotalCount(data.totalCount);
    } catch {
      toast.error("Gagal memuat data hasil ujian");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(0); }, [search]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Hasil Ujian</h1>
          <p className="text-sm text-muted-foreground mt-1">Rekap nilai dan analisis hasil ujian per kelas</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari ujian..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <BarChart2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Belum ada hasil ujian</p>
            <p className="text-sm mt-1">Hasil akan muncul setelah ujian selesai dilaksanakan.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const { stats, package: pkg, rombel } = item;
            const passRate =
              stats.scored_count > 0
                ? Math.round((stats.passed_count / stats.scored_count) * 100)
                : null;
            const completionRate =
              stats.total_students > 0
                ? Math.round((stats.submitted_count / stats.total_students) * 100)
                : 0;

            return (
              <Card key={item.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-4 flex-wrap md:flex-nowrap">
                    {/* Left: info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm">{item.title}</h3>
                        <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                          {EXAM_TYPE_LABELS[pkg.exam_type] ?? pkg.exam_type}
                        </span>
                        {stats.has_pending_essay && (
                          <Badge variant="outline" className="text-xs gap-1 text-amber-600 border-amber-300">
                            <AlertCircle className="h-3 w-3" /> Essay belum dikoreksi
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{pkg.title}</p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {rombel.name} — {rombel.className}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5" />
                          {pkg.question_count} soal · {pkg.duration} menit
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {fmtDate(item.start_at)}
                        </span>
                      </div>

                      {/* Stats bar */}
                      <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-xs">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">Submit:</span>
                          <strong>{stats.submitted_count}/{stats.total_students}</strong>
                          <span className="text-muted-foreground">({completionRate}%)</span>
                        </span>
                        {stats.avg_score !== null && (
                          <span className="flex items-center gap-1.5">
                            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">Rata-rata:</span>
                            <strong className={stats.avg_score >= pkg.passing_grade ? "text-green-600" : "text-red-500"}>
                              {stats.avg_score}
                            </strong>
                          </span>
                        )}
                        {passRate !== null && (
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">Lulus:</span>
                            <strong className={passRate >= 75 ? "text-green-600" : passRate >= 50 ? "text-amber-600" : "text-red-500"}>
                              {stats.passed_count}/{stats.scored_count} ({passRate}%)
                            </strong>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Button size="sm" variant="outline" asChild className="gap-1 text-xs">
                        <a
                          href={`/api/teacher/ujian/hasil/${item.id}/export`}
                          download
                        >
                          <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
                        </a>
                      </Button>
                      <Button size="sm" asChild className="gap-1 text-xs">
                        <Link href={`/teacher/ujian/hasil/${item.id}`}>
                          <BarChart2 className="h-3.5 w-3.5" /> Detail
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {page * pageSize + 1}–{Math.min((page + 1) * pageSize, totalCount)} dari {totalCount} ujian
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 0}>
              Sebelumnya
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1}>
              Berikutnya
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
