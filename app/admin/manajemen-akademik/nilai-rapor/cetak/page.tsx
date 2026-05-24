"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Loader2, Search, Printer, Download, Users, BookOpen, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { useBreadcrumb } from "@/hooks/useBreadcrumb";
import { useEffect as useLayoutEffect } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface TahunAjaran {
  id: string;
  label: string;
  isActive: boolean;
}

interface RombelRow {
  id: number;
  name: string;
  className: string;
  programName: string;
  tahunAjaranLabel: string;
  studentCount: number;
  subjectCount: number;
  subjectsWithData: number;
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function CetakRaporPage() {
  const breadcrumbContext = useBreadcrumb();

  useLayoutEffect(() => {
    breadcrumbContext?.setBreadcrumbs?.([
      { label: "Manajemen Akademik", href: "/admin/manajemen-akademik" },
      { label: "Nilai & Rapor", href: "/admin/manajemen-akademik/nilai-rapor" },
      { label: "Cetak Rapor Massal", href: "/admin/manajemen-akademik/nilai-rapor/cetak" },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);
  const [selectedTahunAjaranId, setSelectedTahunAjaranId] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [rombels, setRombels] = useState<RombelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRombels, setSelectedRombels] = useState<Set<number>>(new Set());
  const [downloading, setDownloading] = useState<number | "batch" | null>(null);

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
        pageSize: "100",
        ...(search ? { search } : {}),
        ...(selectedTahunAjaranId && selectedTahunAjaranId !== "all"
          ? { tahunAjaranId: selectedTahunAjaranId }
          : {}),
      });
      const res = await fetch(`/api/admin/manajemen-akademik/nilai-rapor?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRombels(data.data);
    } catch {
      toast.error("Gagal memuat data rombel");
    } finally {
      setLoading(false);
    }
  }, [search, selectedTahunAjaranId]);

  useEffect(() => { fetchRombels(); }, [fetchRombels]);

  const toggleSelect = (id: number) => {
    setSelectedRombels((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedRombels.size === rombels.length) {
      setSelectedRombels(new Set());
    } else {
      setSelectedRombels(new Set(rombels.map((r) => r.id)));
    }
  };

  const downloadRapor = async (rombelId: number) => {
    try {
      setDownloading(rombelId);
      const res = await fetch(`/api/admin/manajemen-akademik/rapor/generate?rombelId=${rombelId}`);
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Gagal generate rapor");
        return;
      }
      const blob = await res.blob();
      const rombel = rombels.find((r) => r.id === rombelId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rapor-massal-${rombel?.name ?? rombelId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Gagal mengunduh rapor");
    } finally {
      setDownloading(null);
    }
  };

  const handleBatchDownload = async () => {
    if (selectedRombels.size === 0) {
      toast.error("Pilih minimal satu rombel");
      return;
    }
    setDownloading("batch");
    toast.info(`Mengunduh rapor untuk ${selectedRombels.size} rombel secara berurutan...`);
    for (const rombelId of selectedRombels) {
      await downloadRapor(rombelId);
    }
    setDownloading(null);
    toast.success("Semua rapor berhasil diunduh");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cetak Rapor Massal"
        description="Pilih rombel dan unduh rapor PDF untuk semua siswa sekaligus"
      >
        <div className="flex items-center gap-2">
          {selectedRombels.size > 0 && (
            <Button
              onClick={handleBatchDownload}
              disabled={downloading !== null}
              className="gap-2"
            >
              {downloading === "batch" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Printer className="h-4 w-4" />
              )}
              Cetak {selectedRombels.size} Rombel Terpilih
            </Button>
          )}
        </div>
      </PageHeader>

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
                    {ta.isActive && <span className="ml-1 text-green-600">(Aktif)</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {rombels.length > 0 && (
              <Button variant="outline" size="sm" onClick={toggleAll}>
                {selectedRombels.size === rombels.length ? "Batal Pilih Semua" : "Pilih Semua"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rombel list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : rombels.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Tidak ada rombel ditemukan.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rombels.map((rombel) => {
            const isSelected = selectedRombels.has(rombel.id);
            const isReady = rombel.subjectsWithData > 0;

            return (
              <Card
                key={rombel.id}
                className={`cursor-pointer transition-all ${
                  isSelected ? "ring-2 ring-primary shadow-md" : "hover:shadow-sm"
                }`}
                onClick={() => toggleSelect(rombel.id)}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-4">
                    {/* Checkbox */}
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? "bg-primary border-primary" : "border-border"
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{rombel.name}</h3>
                        <Badge variant="outline" className="text-xs">{rombel.className}</Badge>
                        <Badge variant="secondary" className="text-xs">{rombel.programName}</Badge>
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          {rombel.tahunAjaranLabel}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {rombel.studentCount} siswa
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5" />
                          {rombel.subjectsWithData}/{rombel.subjectCount} mapel ada data
                        </span>
                        {isReady ? (
                          <Badge className="text-xs bg-green-600">Siap cetak</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Belum ada data</Badge>
                        )}
                      </div>
                    </div>

                    {/* Download button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 gap-1"
                      disabled={!isReady || downloading === rombel.id || downloading === "batch"}
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadRapor(rombel.id);
                      }}
                    >
                      {downloading === rombel.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      Unduh PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Sticky batch bar */}
      {selectedRombels.size > 0 && (
        <div className="sticky bottom-4 flex justify-end">
          <div className="flex items-center gap-3 bg-background border rounded-lg shadow-lg px-4 py-3">
            <span className="text-sm text-muted-foreground">
              {selectedRombels.size} rombel dipilih
            </span>
            <Button
              size="sm"
              onClick={handleBatchDownload}
              disabled={downloading !== null}
            >
              {downloading === "batch" ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Printer className="h-4 w-4 mr-1" />
              )}
              Cetak Semua Terpilih
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
