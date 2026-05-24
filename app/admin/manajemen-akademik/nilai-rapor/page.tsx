"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, ChevronRight, BookOpen, Users, BarChart2, FileText } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { useBreadcrumb } from "@/hooks/useBreadcrumb";
import { useEffect as useLayoutEffect } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

interface TahunAjaran {
  id: string;
  label: string;
  isActive: boolean;
}

interface SubjectInfo {
  id: number;
  name: string;
  kkm: number;
  teacherName: string;
  hasData: boolean;
}

interface RombelRow {
  id: number;
  name: string;
  className: string;
  programName: string;
  tahunAjaranId: string | null;
  tahunAjaranLabel: string;
  studentCount: number;
  subjectCount: number;
  subjectsWithData: number;
  subjects: SubjectInfo[];
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function NilaiRaporPage() {
  const breadcrumbContext = useBreadcrumb();

  useLayoutEffect(() => {
    breadcrumbContext?.setBreadcrumbs?.([
      { label: "Manajemen Akademik", href: "/admin/manajemen-akademik" },
      { label: "Nilai & Rapor", href: "/admin/manajemen-akademik/nilai-rapor" },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);
  const [selectedTahunAjaranId, setSelectedTahunAjaranId] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [rombels, setRombels] = useState<RombelRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const pageSize = 20;

  // Fetch tahun ajaran
  useEffect(() => {
    fetch("/api/admin/manajemen-akademik/tahun-ajaran?pageSize=50")
      .then((r) => r.json())
      .then((data) => {
        const list: TahunAjaran[] = data.data ?? [];
        setTahunAjaranList(list);
        const active = list.find((t) => t.isActive);
        if (active) setSelectedTahunAjaranId(active.id);
      })
      .catch(() => {});
  }, []);

  const fetchRombels = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        ...(search ? { search } : {}),
        ...(selectedTahunAjaranId && selectedTahunAjaranId !== "all"
          ? { tahunAjaranId: selectedTahunAjaranId }
          : {}),
      });
      const res = await fetch(`/api/admin/manajemen-akademik/nilai-rapor?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRombels(data.data);
      setTotalCount(data.totalCount);
    } catch {
      toast.error("Gagal memuat data nilai rombel");
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedTahunAjaranId]);

  useEffect(() => {
    fetchRombels();
  }, [fetchRombels]);

  // Reset page on filter change
  useEffect(() => {
    setPage(0);
  }, [search, selectedTahunAjaranId]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nilai & Rapor"
        description="Pantau nilai siswa per rombel dan mata pelajaran, lalu cetak rapor"
      />

      {/* Filters */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari rombel..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedTahunAjaranId} onValueChange={setSelectedTahunAjaranId}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Semua Tahun Ajaran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tahun Ajaran</SelectItem>
                {tahunAjaranList.map((ta) => (
                  <SelectItem key={ta.id} value={ta.id}>
                    {ta.label}
                    {ta.isActive && (
                      <Badge className="ml-2 text-xs bg-green-600">Aktif</Badge>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => fetchRombels()} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Muat ulang"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats summary */}
      {!loading && rombels.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalCount}</p>
                  <p className="text-xs text-muted-foreground">Total Rombel</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {rombels.reduce((s, r) => s + r.studentCount, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Siswa</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950">
                  <BarChart2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {rombels.reduce((s, r) => s + r.subjectsWithData, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Mapel Ada Data Nilai</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rombel list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : rombels.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Tidak ada rombel ditemukan</p>
            <p className="text-sm mt-1">Coba ubah filter atau buat rombel terlebih dahulu di menu Rombel.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rombels.map((rombel) => (
            <Card key={rombel.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-base">{rombel.name}</h3>
                      <Badge variant="outline" className="text-xs">{rombel.className}</Badge>
                      <Badge variant="secondary" className="text-xs">{rombel.programName}</Badge>
                      {rombel.tahunAjaranLabel !== "-" && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          {rombel.tahunAjaranLabel}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {rombel.studentCount} siswa
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" />
                        {rombel.subjectCount} mata pelajaran
                      </span>
                      <span className="flex items-center gap-1">
                        <BarChart2 className="h-3.5 w-3.5" />
                        {rombel.subjectsWithData}/{rombel.subjectCount} mapel ada data
                      </span>
                    </div>

                    {/* Subject pills */}
                    {rombel.subjects.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {rombel.subjects.slice(0, 6).map((s) => (
                          <span
                            key={s.id}
                            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${
                              s.hasData
                                ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300"
                                : "bg-muted/50 border-border text-muted-foreground"
                            }`}
                          >
                            {s.hasData && <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />}
                            {s.name}
                          </span>
                        ))}
                        {rombel.subjects.length > 6 && (
                          <span className="text-xs text-muted-foreground self-center">
                            +{rombel.subjects.length - 6} lainnya
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/manajemen-akademik/nilai-rapor/${rombel.id}/rapor`}>
                        <FileText className="h-4 w-4 mr-1" />
                        Rapor
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href={`/admin/manajemen-akademik/nilai-rapor/${rombel.id}`}>
                        Lihat Nilai
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Menampilkan {page * pageSize + 1}–{Math.min((page + 1) * pageSize, totalCount)} dari {totalCount} rombel
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
