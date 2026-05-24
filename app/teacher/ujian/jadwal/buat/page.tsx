"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import {
  Loader2,
  ArrowLeft,
  Save,
  BookOpen,
  Users,
  Clock,
  KeyRound,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ExamPackage {
  id: string;
  title: string;
  exam_type: string;
  duration: number;
  passing_grade: number;
  question_count: number;
  subjectName: string;
}

interface RombelOption {
  id: string;
  name: string;
  className: string;
  student_count: number;
}

const EXAM_TYPE_LABELS: Record<string, string> = {
  KUIS: "Kuis", UTS: "UTS", UAS: "UAS", ULANGAN_HARIAN: "Ulangan Harian", LATIHAN: "Latihan",
};

function generateToken() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

// Default: start now, end = start + package duration + 15 min buffer
function defaultTimes(durationMinutes = 60) {
  const now = new Date();
  now.setSeconds(0, 0);
  const end = new Date(now.getTime() + (durationMinutes + 15) * 60 * 1000);
  return {
    start: now.toISOString().slice(0, 16),
    end: end.toISOString().slice(0, 16),
  };
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function BuatJadwalPage() {
  const router = useRouter();

  const [packages, setPackages] = useState<ExamPackage[]>([]);
  const [rombels, setRombels] = useState<RombelOption[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [loadingRombels, setLoadingRombels] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [packageId, setPackageId] = useState("");
  const [rombelId, setRombelId] = useState("");
  const [title, setTitle] = useState("");
  const [startAt, setStartAt] = useState(defaultTimes().start);
  const [endAt, setEndAt] = useState(defaultTimes().end);
  const [windowMinutes, setWindowMinutes] = useState(0);
  const [token, setToken] = useState(generateToken());

  const selectedPackage = packages.find((p) => p.id === packageId);
  const selectedRombel = rombels.find((r) => r.id === rombelId);

  // Fetch published packages
  useEffect(() => {
    setLoadingPackages(true);
    fetch("/api/teacher/ujian/paket?status=published&pageSize=100")
      .then((r) => r.json())
      .then((data) => setPackages(data.data ?? []))
      .catch(() => toast.error("Gagal memuat paket ujian"))
      .finally(() => setLoadingPackages(false));
  }, []);

  // Fetch rombels (teacher's classes)
  useEffect(() => {
    setLoadingRombels(true);
    fetch("/api/teacher/my-classes")
      .then((r) => r.json())
      .then((data) => {
        const list = (data.data ?? data).map((r: { id: string | number; name: string; class?: { name: string }; className?: string; _count?: { students: number }; student_count?: number }) => ({
          id: String(r.id),
          name: r.name,
          className: r.class?.name ?? r.className ?? "",
          student_count: r._count?.students ?? r.student_count ?? 0,
        }));
        setRombels(list);
      })
      .catch(() => toast.error("Gagal memuat daftar kelas"))
      .finally(() => setLoadingRombels(false));
  }, []);

  // Auto-set title when package is selected
  useEffect(() => {
    if (selectedPackage && !title) {
      setTitle(selectedPackage.title);
    }
    if (selectedPackage) {
      const { start, end } = defaultTimes(selectedPackage.duration);
      setStartAt(start);
      setEndAt(end);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packageId]);

  const handleSave = async () => {
    if (!packageId) { toast.error("Pilih paket ujian"); return; }
    if (!rombelId) { toast.error("Pilih kelas/rombel"); return; }
    if (!title.trim()) { toast.error("Judul jadwal harus diisi"); return; }
    if (!startAt || !endAt) { toast.error("Waktu mulai dan selesai harus diisi"); return; }
    if (new Date(startAt) >= new Date(endAt)) {
      toast.error("Waktu mulai harus sebelum waktu selesai");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/teacher/ujian/jadwal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package_id: parseInt(packageId),
          rombel_id: parseInt(rombelId),
          title: title.trim(),
          start_at: new Date(startAt).toISOString(),
          end_at: new Date(endAt).toISOString(),
          window_minutes: windowMinutes,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Gagal membuat jadwal"); return; }
      toast.success("Jadwal ujian berhasil dibuat");
      router.push("/teacher/ujian/jadwal");
    } catch {
      toast.error("Gagal membuat jadwal ujian");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Jadwalkan Ujian</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Pilih paket, kelas, dan waktu pelaksanaan ujian</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Detail Jadwal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Paket ujian */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Paket Ujian <span className="text-destructive">*</span></label>
            {loadingPackages ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Memuat paket...
              </div>
            ) : packages.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                Tidak ada paket ujian yang sudah dipublikasikan.{" "}
                <a href="/teacher/ujian/paket" className="text-primary underline">Buat paket</a> terlebih dahulu.
              </p>
            ) : (
              <Select value={packageId} onValueChange={setPackageId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih paket ujian..." />
                </SelectTrigger>
                <SelectContent>
                  {packages.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title} — {p.subjectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Package detail card */}
            {selectedPackage && (
              <div className="mt-2 p-3 rounded-lg bg-muted/50 border text-sm flex flex-wrap gap-x-4 gap-y-1">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5" />
                  {selectedPackage.question_count} soal
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {selectedPackage.duration} menit
                </span>
                <span className="text-muted-foreground">KKM: {selectedPackage.passing_grade}%</span>
                <Badge variant="outline" className="text-xs">{EXAM_TYPE_LABELS[selectedPackage.exam_type] ?? selectedPackage.exam_type}</Badge>
              </div>
            )}
          </div>

          {/* Rombel */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Kelas / Rombel <span className="text-destructive">*</span></label>
            {loadingRombels ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Memuat kelas...
              </div>
            ) : (
              <Select value={rombelId} onValueChange={setRombelId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kelas..." />
                </SelectTrigger>
                <SelectContent>
                  {rombels.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name} — {r.className} ({r.student_count} siswa)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {selectedRombel && (
              <div className="mt-2 p-3 rounded-lg bg-muted/50 border text-sm flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                {selectedRombel.student_count} siswa terdaftar
              </div>
            )}
          </div>

          {/* Judul */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Judul Ujian <span className="text-destructive">*</span></label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="mis. UTS Matematika Kelas X-A"
            />
          </div>

          {/* Waktu */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Waktu Mulai <span className="text-destructive">*</span></label>
              <Input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Waktu Selesai <span className="text-destructive">*</span></label>
              <Input
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
              />
            </div>
          </div>

          {/* Window toleransi */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Toleransi Keterlambatan Masuk</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={60}
                value={windowMinutes}
                onChange={(e) => setWindowMinutes(parseInt(e.target.value) || 0)}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">menit setelah ujian dibuka</span>
            </div>
            <p className="text-xs text-muted-foreground">
              0 = siswa tidak bisa masuk setelah ujian dimulai. Nilai &gt;0 memberi toleransi keterlambatan.
            </p>
          </div>

          {/* Token */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <KeyRound className="h-4 w-4" />
              Kode Akses (Token)
            </label>
            <div className="flex items-center gap-2">
              <Input
                value={token}
                onChange={(e) => setToken(e.target.value.toUpperCase().slice(0, 8))}
                className="font-mono font-bold tracking-widest text-base w-36"
                maxLength={8}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setToken(generateToken())}
                className="gap-1"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Buat Ulang
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Token ini akan digunakan siswa untuk mengakses ujian. Token dibuat otomatis oleh server saat disimpan.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preview info */}
      {selectedPackage && selectedRombel && startAt && endAt && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="pt-4 pb-4">
            <CardDescription className="text-blue-800 dark:text-blue-300 text-sm space-y-1">
              <p className="font-medium">Ringkasan Jadwal:</p>
              <p>• <strong>{selectedPackage.title}</strong> untuk <strong>{selectedRombel.name} — {selectedRombel.className}</strong></p>
              <p>• {selectedPackage.question_count} soal · {selectedPackage.duration} menit · KKM {selectedPackage.passing_grade}%</p>
              <p>• Mulai: {new Date(startAt).toLocaleString("id-ID")} s/d {new Date(endAt).toLocaleString("id-ID")}</p>
              {windowMinutes > 0 && <p>• Toleransi masuk: {windowMinutes} menit</p>}
            </CardDescription>
          </CardContent>
        </Card>
      )}

      {/* Save button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.back()} disabled={saving}>
          Batal
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
          Simpan Jadwal
        </Button>
      </div>
    </div>
  );
}
