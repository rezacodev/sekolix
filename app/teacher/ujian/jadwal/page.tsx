"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Loader2,
  Plus,
  Search,
  MoreHorizontal,
  Trash2,
  Activity,
  Clock,
  Users,
  BookOpen,
  Calendar,
  KeyRound,
  PlayCircle,
  PauseCircle,
  XCircle,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

// ─── Types ──────────────────────────────────────────────────────────────────

type DisplayStatus = "DRAFT" | "UPCOMING" | "OPEN" | "PAUSED" | "CLOSED";

interface ScheduleRow {
  id: string;
  title: string;
  token: string;
  start_at: string;
  end_at: string;
  window_minutes: number;
  status: "DRAFT" | "OPEN" | "PAUSED" | "CLOSED";
  computedStatus: DisplayStatus;
  package: {
    id: string;
    title: string;
    exam_type: string;
    duration: number;
    passing_grade: number;
    question_count: number;
  };
  rombel: {
    id: string;
    name: string;
    className: string;
    student_count: number;
  };
}

const STATUS_CONFIG: Record<DisplayStatus, { label: string; class: string; icon: React.ReactNode }> = {
  DRAFT:    { label: "Draft",       class: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", icon: <Clock className="h-3 w-3" /> },
  UPCOMING: { label: "Akan Datang", class: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300", icon: <Calendar className="h-3 w-3" /> },
  OPEN:     { label: "Berlangsung", class: "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300", icon: <Activity className="h-3 w-3" /> },
  PAUSED:   { label: "Dijeda",      class: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300", icon: <PauseCircle className="h-3 w-3" /> },
  CLOSED:   { label: "Selesai",     class: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300", icon: <XCircle className="h-3 w-3" /> },
};

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

export default function JadwalUjianPage() {
  const [schedules, setSchedules] = useState<ScheduleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ScheduleRow | null>(null);

  const pageSize = 15;

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        ...(search ? { search } : {}),
        ...(filterStatus !== "all" ? { status: filterStatus } : {}),
      });
      const res = await fetch(`/api/teacher/ujian/jadwal?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSchedules(data.data);
      setTotalCount(data.totalCount);
    } catch {
      toast.error("Gagal memuat daftar jadwal ujian");
    } finally {
      setLoading(false);
    }
  }, [page, search, filterStatus]);

  useEffect(() => { fetchSchedules(); }, [fetchSchedules]);
  useEffect(() => { setPage(0); }, [search, filterStatus]);

  const changeStatus = async (id: string, newStatus: "OPEN" | "PAUSED" | "CLOSED") => {
    try {
      setActionLoading(id + "-status");
      const res = await fetch(`/api/teacher/ujian/jadwal/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Gagal mengubah status"); return; }
      const statusLabel = newStatus === "OPEN" ? "dibuka" : newStatus === "PAUSED" ? "dijeda" : "ditutup";
      toast.success(`Ujian berhasil ${statusLabel}`);
      fetchSchedules();
    } catch {
      toast.error("Gagal mengubah status ujian");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (s: ScheduleRow) => {
    try {
      setActionLoading(s.id + "-del");
      const res = await fetch(`/api/teacher/ujian/jadwal/${s.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Gagal menghapus jadwal"); return; }
      toast.success("Jadwal berhasil dihapus");
      setDeleteTarget(null);
      fetchSchedules();
    } catch {
      toast.error("Gagal menghapus jadwal");
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Jadwal Ujian</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola jadwal pelaksanaan ujian untuk setiap kelas</p>
        </div>
        <Button asChild>
          <Link href="/teacher/ujian/jadwal/buat">
            <Plus className="h-4 w-4 mr-1" />
            Jadwalkan Ujian
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari jadwal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="OPEN">Berlangsung</SelectItem>
            <SelectItem value="PAUSED">Dijeda</SelectItem>
            <SelectItem value="CLOSED">Selesai</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : schedules.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Belum ada jadwal ujian</p>
            <p className="text-sm mt-1">Klik &quot;Jadwalkan Ujian&quot; untuk membuat jadwal baru.</p>
            <Button asChild className="mt-4">
              <Link href="/teacher/ujian/jadwal/buat">
                <Plus className="h-4 w-4 mr-1" /> Jadwalkan Ujian
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {schedules.map((s) => {
            const cfg = STATUS_CONFIG[s.computedStatus];
            const isOpen = s.status === "OPEN";
            const isPaused = s.status === "PAUSED";
            const isClosed = s.status === "CLOSED";
            const isActionLoading = actionLoading === s.id + "-status";

            return (
              <Card key={s.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-4 flex-wrap md:flex-nowrap">
                    {/* Status dot */}
                    <div className="mt-1 shrink-0">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.class}`}>
                        {cfg.icon}
                        {cfg.label}
                      </span>
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm">{s.title}</h3>
                        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {EXAM_TYPE_LABELS[s.package.exam_type] ?? s.package.exam_type}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.package.title}</p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {s.rombel.name} — {s.rombel.className} ({s.rombel.student_count} siswa)
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5" />
                          {s.package.question_count} soal · {s.package.duration} menit
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {fmtDate(s.start_at)}
                        </span>
                        <span>s/d {fmtDate(s.end_at)}</span>
                      </div>

                      {/* Token */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="flex items-center gap-1.5 text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md font-mono font-bold tracking-widest select-all">
                          <KeyRound className="h-3 w-3 text-muted-foreground" />
                          {s.token}
                        </span>
                        <button
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => { navigator.clipboard.writeText(s.token); toast.success("Token disalin"); }}
                        >
                          Salin
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Quick action buttons */}
                      {!isClosed && (
                        <Button
                          size="sm"
                          variant={isOpen ? "outline" : "default"}
                          className="gap-1 text-xs"
                          onClick={() => changeStatus(s.id, isOpen ? "PAUSED" : isPaused ? "OPEN" : "OPEN")}
                          disabled={isActionLoading}
                        >
                          {isActionLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : isOpen ? (
                            <><PauseCircle className="h-3.5 w-3.5" /> Jeda</>
                          ) : (
                            <><PlayCircle className="h-3.5 w-3.5" /> {isPaused ? "Lanjutkan" : "Buka"}</>
                          )}
                        </Button>
                      )}

                      {isOpen && (
                        <Button size="sm" variant="outline" asChild className="gap-1 text-xs">
                          <Link href={`/teacher/ujian/jadwal/${s.id}/monitor`}>
                            <Eye className="h-3.5 w-3.5" /> Monitor
                          </Link>
                        </Button>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/teacher/ujian/jadwal/${s.id}/monitor`}>
                              <Activity className="h-4 w-4 mr-2" /> Monitor
                            </Link>
                          </DropdownMenuItem>
                          {!isClosed && !isOpen && (
                            <DropdownMenuItem onClick={() => changeStatus(s.id, "CLOSED")} disabled={isActionLoading}>
                              <XCircle className="h-4 w-4 mr-2" /> Tutup Ujian
                            </DropdownMenuItem>
                          )}
                          {isOpen && (
                            <DropdownMenuItem onClick={() => changeStatus(s.id, "CLOSED")} disabled={isActionLoading}>
                              <XCircle className="h-4 w-4 mr-2" /> Tutup Ujian
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteTarget(s)}
                            disabled={isOpen}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
            {page * pageSize + 1}–{Math.min((page + 1) * pageSize, totalCount)} dari {totalCount} jadwal
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

      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus Jadwal Ujian"
        description={`Jadwal "${deleteTarget?.title}" akan dihapus. Lanjutkan?`}
        confirmText="Hapus"
        isDestructive
        isLoading={actionLoading === deleteTarget?.id + "-del"}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
