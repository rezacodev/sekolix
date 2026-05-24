"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  ArrowLeft,
  PlayCircle,
  PauseCircle,
  XCircle,
  Clock,
  Users,
  BookOpen,
  KeyRound,
  RefreshCw,
  AlertTriangle,
  Activity,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ScheduleDetail {
  id: string;
  title: string;
  token: string;
  start_at: string;
  end_at: string;
  window_minutes: number;
  status: "DRAFT" | "OPEN" | "PAUSED" | "CLOSED";
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
    students: { id: string; fullName: string; nisn: string }[];
  };
}

const STATUS_CONFIG = {
  DRAFT:  { label: "Draft",       class: "bg-slate-100 text-slate-700" },
  OPEN:   { label: "Berlangsung", class: "bg-green-100 text-green-700" },
  PAUSED: { label: "Dijeda",      class: "bg-amber-100 text-amber-700" },
  CLOSED: { label: "Selesai",     class: "bg-red-100 text-red-700" },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function useCountdown(endAt: string, status: string) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    if (status !== "OPEN") { setRemaining(""); return; }
    const update = () => {
      const diff = new Date(endAt).getTime() - Date.now();
      if (diff <= 0) { setRemaining("Waktu habis"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${h > 0 ? h + "j " : ""}${m}m ${s}d`);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [endAt, status]);

  return remaining;
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function MonitorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [schedule, setSchedule] = useState<ScheduleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [extendMinutes, setExtendMinutes] = useState(15);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const countdown = useCountdown(schedule?.end_at ?? "", schedule?.status ?? "");

  const fetchSchedule = useCallback(async () => {
    try {
      const res = await fetch(`/api/teacher/ujian/jadwal/${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSchedule(data);
    } catch {
      // silent on auto-refresh
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchSchedule(); }, [fetchSchedule]);

  // Auto-refresh every 15s when OPEN
  useEffect(() => {
    if (!autoRefresh || schedule?.status !== "OPEN") return;
    const timer = setInterval(fetchSchedule, 15000);
    return () => clearInterval(timer);
  }, [autoRefresh, schedule?.status, fetchSchedule]);

  const changeStatus = async (newStatus: "OPEN" | "PAUSED" | "CLOSED") => {
    try {
      setActionLoading("status");
      const res = await fetch(`/api/teacher/ujian/jadwal/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Gagal mengubah status"); return; }
      const label = newStatus === "OPEN" ? "dibuka/dilanjutkan" : newStatus === "PAUSED" ? "dijeda" : "ditutup";
      toast.success(`Ujian berhasil ${label}`);
      fetchSchedule();
    } catch {
      toast.error("Gagal mengubah status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleExtend = async () => {
    try {
      setActionLoading("extend");
      const res = await fetch(`/api/teacher/ujian/jadwal/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extend_minutes: extendMinutes }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Gagal memperpanjang waktu"); return; }
      toast.success(`Waktu ujian diperpanjang ${extendMinutes} menit`);
      fetchSchedule();
    } catch {
      toast.error("Gagal memperpanjang waktu");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <AlertTriangle className="h-10 w-10 mx-auto mb-3 opacity-40" />
        <p>Jadwal tidak ditemukan.</p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/teacher/ujian/jadwal"><ArrowLeft className="h-4 w-4 mr-2" /> Kembali</Link>
        </Button>
      </div>
    );
  }

  const { status } = schedule;
  const cfg = STATUS_CONFIG[status];
  const isOpen = status === "OPEN";
  const isPaused = status === "PAUSED";
  const isClosed = status === "CLOSED";
  const totalStudents = schedule.rombel.students.length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/teacher/ujian/jadwal"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{schedule.title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${cfg.class}`}>
                {cfg.label}
              </span>
              <span className="text-sm text-muted-foreground">
                {schedule.rombel.name} — {schedule.rombel.className}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSchedule}
            className="gap-1"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Muat Ulang
          </Button>
          <label className="flex items-center gap-1.5 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-3.5 h-3.5"
            />
            Auto-refresh
          </label>
        </div>
      </div>

      {/* Info + control row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Stats */}
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center gap-3">
              <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Paket</p>
                <p className="text-sm font-medium">{schedule.package.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex gap-4 text-sm">
                <span><strong>{schedule.package.question_count}</strong> soal</span>
                <span><strong>{schedule.package.duration}</strong> menit</span>
                <span>KKM <strong>{schedule.package.passing_grade}%</strong></span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Waktu</p>
                <p className="text-sm">{fmtDate(schedule.start_at)}</p>
                <p className="text-sm">s/d {fmtDate(schedule.end_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Countdown */}
        <Card className={isOpen ? "border-green-300 bg-green-50 dark:bg-green-950/20" : ""}>
          <CardContent className="pt-4 flex flex-col items-center justify-center h-full text-center gap-2">
            {isOpen && countdown ? (
              <>
                <Activity className="h-6 w-6 text-green-600 animate-pulse" />
                <p className="text-xs text-muted-foreground">Sisa Waktu</p>
                <p className="text-3xl font-bold font-mono text-green-700 dark:text-green-400">{countdown}</p>
              </>
            ) : isClosed ? (
              <>
                <XCircle className="h-8 w-8 text-red-400" />
                <p className="text-sm font-medium text-red-600">Ujian Selesai</p>
              </>
            ) : isPaused ? (
              <>
                <PauseCircle className="h-8 w-8 text-amber-500" />
                <p className="text-sm font-medium text-amber-700">Dijeda</p>
              </>
            ) : (
              <>
                <Clock className="h-8 w-8 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">Belum dibuka</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Token + Controls */}
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <KeyRound className="h-3.5 w-3.5" /> Kode Akses Siswa
              </p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-mono font-bold tracking-widest select-all">{schedule.token}</span>
                <button
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => { navigator.clipboard.writeText(schedule.token); toast.success("Token disalin"); }}
                >
                  Salin
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              {!isOpen && !isClosed && (
                <Button
                  size="sm"
                  className="gap-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => changeStatus("OPEN")}
                  disabled={actionLoading === "status"}
                >
                  {actionLoading === "status" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlayCircle className="h-3.5 w-3.5" />}
                  {isPaused ? "Lanjutkan" : "Buka Ujian"}
                </Button>
              )}
              {isOpen && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 border-amber-300 text-amber-700 hover:bg-amber-50"
                  onClick={() => changeStatus("PAUSED")}
                  disabled={actionLoading === "status"}
                >
                  {actionLoading === "status" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PauseCircle className="h-3.5 w-3.5" />}
                  Jeda
                </Button>
              )}
              {!isClosed && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 border-red-300 text-red-700 hover:bg-red-50"
                  onClick={() => changeStatus("CLOSED")}
                  disabled={actionLoading === "status"}
                >
                  {actionLoading === "status" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                  Tutup
                </Button>
              )}
            </div>

            {/* Extend time */}
            {!isClosed && (
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Perpanjang Waktu</p>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={120}
                    value={extendMinutes}
                    onChange={(e) => setExtendMinutes(parseInt(e.target.value) || 15)}
                    className="w-20 h-8 text-sm"
                  />
                  <span className="text-sm text-muted-foreground">menit</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={handleExtend}
                    disabled={actionLoading === "extend"}
                  >
                    {actionLoading === "extend" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Tambah"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Student list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Daftar Siswa
          </CardTitle>
          <CardDescription>
            {totalStudents} siswa terdaftar di {schedule.rombel.name}
            {isOpen && <span className="ml-2 text-xs text-muted-foreground animate-pulse">• Pemantauan real-time partisipasi siswa memerlukan modul siswa aktif</span>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="text-left px-3 py-2.5 font-medium text-muted-foreground w-10">No</th>
                  <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Nama Siswa</th>
                  <th className="text-left px-3 py-2.5 font-medium text-muted-foreground w-36">NISN</th>
                  <th className="text-center px-3 py-2.5 font-medium text-muted-foreground w-32">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {schedule.rombel.students.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-muted/20">
                    <td className="px-3 py-2.5 text-muted-foreground">{idx + 1}</td>
                    <td className="px-3 py-2.5 font-medium">{student.fullName}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{student.nisn || "—"}</td>
                    <td className="px-3 py-2.5 text-center">
                      {isClosed ? (
                        <Badge variant="secondary" className="text-xs">Selesai</Badge>
                      ) : isOpen ? (
                        <Badge className="text-xs bg-green-100 text-green-700 hover:bg-green-100">Dapat mengerjakan</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs text-muted-foreground">Menunggu</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isOpen && (
            <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Catatan:</strong> Tracking real-time pengerjaan siswa (soal berapa, sudah submit atau belum) akan tersedia setelah modul portal siswa aktif. Saat ini, gunakan monitor ini untuk mengelola status ujian dan token akses.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
