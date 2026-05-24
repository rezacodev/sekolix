"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, Search, RotateCcw, BookOpen, FlaskConical, Scale, Plus, Trash2, GraduationCap, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin";

// ─── KKM types ────────────────────────────────────────────────────────────────

interface SubjectKKM {
  id: number;
  code: string | null;
  name: string;
  is_practice: boolean;
  kkm: number;
}

// ─── Bobot types ──────────────────────────────────────────────────────────────

type ComponentKey = "TUGAS" | "ULANGAN_HARIAN" | "UTS" | "UAS" | "PRAKTIK";

interface ComponentWeight {
  component: ComponentKey;
  weight: number;
}

const COMPONENT_LABELS: Record<ComponentKey, string> = {
  TUGAS: "Tugas",
  ULANGAN_HARIAN: "Ulangan Harian",
  UTS: "UTS (Ujian Tengah Semester)",
  UAS: "UAS (Ujian Akhir Semester)",
  PRAKTIK: "Praktik",
};

const COMPONENT_COLORS: Record<ComponentKey, string> = {
  TUGAS: "bg-blue-500",
  ULANGAN_HARIAN: "bg-purple-500",
  UTS: "bg-amber-500",
  UAS: "bg-red-500",
  PRAKTIK: "bg-green-500",
};

// ─── Skala types ──────────────────────────────────────────────────────────────

interface GradeScaleEntry {
  grade: string;
  min_score: number;
  max_score: number;
  label: string;
}

const DEFAULT_SCALES: GradeScaleEntry[] = [
  { grade: "A", min_score: 90, max_score: 100, label: "Sangat Baik" },
  { grade: "B", min_score: 80, max_score: 89,  label: "Baik" },
  { grade: "C", min_score: 70, max_score: 79,  label: "Cukup" },
  { grade: "D", min_score: 60, max_score: 69,  label: "Kurang" },
  { grade: "E", min_score: 0,  max_score: 59,  label: "Sangat Kurang" },
];

const SCALE_COLORS = ["bg-green-500", "bg-blue-500", "bg-amber-500", "bg-orange-500", "bg-red-500"];

// ─── Semester types ───────────────────────────────────────────────────────────

interface TahunAjaranOption {
  id: string;
  label: string;
}

interface SemesterEntry {
  id?: number;
  number: 1 | 2;
  label: string;
  startDate: string;
  endDate: string;
  is_active: boolean;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PengaturanAkademikPage() {
  // ── KKM state ────────────────────────────────────────────────────────────
  const [subjects, setSubjects] = useState<SubjectKKM[]>([]);
  const [editedKKM, setEditedKKM] = useState<Record<number, number>>({});
  const [loadingKKM, setLoadingKKM] = useState(true);
  const [savingKKM, setSavingKKM] = useState(false);
  const [search, setSearch] = useState("");

  // ── Bobot state ───────────────────────────────────────────────────────────
  const [weights, setWeights] = useState<ComponentWeight[]>([]);
  const [editedWeights, setEditedWeights] = useState<Record<ComponentKey, number>>({} as Record<ComponentKey, number>);
  const [loadingBobot, setLoadingBobot] = useState(true);
  const [savingBobot, setSavingBobot] = useState(false);
  const [bobotDirty, setBobotDirty] = useState(false);

  // ── Skala state ───────────────────────────────────────────────────────────
  const [scales, setScales] = useState<GradeScaleEntry[]>(DEFAULT_SCALES);
  const [loadingSkala, setLoadingSkala] = useState(true);
  const [savingSkala, setSavingSkala] = useState(false);
  const [skalaDirty, setSkalaDirty] = useState(false);

  // ── Semester state ────────────────────────────────────────────────────────
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaranOption[]>([]);
  const [selectedTahunAjaranId, setSelectedTahunAjaranId] = useState<string>("");
  const [semesters, setSemesters] = useState<SemesterEntry[]>([
    { number: 1, label: "Semester 1 (Ganjil)", startDate: "", endDate: "", is_active: false },
    { number: 2, label: "Semester 2 (Genap)", startDate: "", endDate: "", is_active: false },
  ]);
  const [loadingSemester, setLoadingSemester] = useState(false);
  const [savingSemester, setSavingSemester] = useState(false);

  // ── Fetch KKM ─────────────────────────────────────────────────────────────
  const fetchKKM = useCallback(async () => {
    try {
      setLoadingKKM(true);
      const res = await fetch("/api/admin/manajemen-akademik/pengaturan-akademik/kkm");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSubjects(data.subjects);
      setEditedKKM({});
    } catch {
      toast.error("Gagal memuat data KKM");
    } finally {
      setLoadingKKM(false);
    }
  }, []);

  // ── Fetch Bobot ───────────────────────────────────────────────────────────
  const fetchBobot = useCallback(async () => {
    try {
      setLoadingBobot(true);
      const res = await fetch("/api/admin/manajemen-akademik/pengaturan-akademik/bobot");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setWeights(data.weights);
      const map = {} as Record<ComponentKey, number>;
      data.weights.forEach((w: ComponentWeight) => { map[w.component] = w.weight; });
      setEditedWeights(map);
      setBobotDirty(false);
    } catch {
      toast.error("Gagal memuat data bobot nilai");
    } finally {
      setLoadingBobot(false);
    }
  }, []);

  // ── Fetch Skala ───────────────────────────────────────────────────────────
  const fetchSkala = useCallback(async () => {
    try {
      setLoadingSkala(true);
      const res = await fetch("/api/admin/manajemen-akademik/pengaturan-akademik/skala");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setScales(data.scales.map((s: GradeScaleEntry) => ({ ...s, label: s.label ?? "" })));
      setSkalaDirty(false);
    } catch {
      toast.error("Gagal memuat data skala nilai");
    } finally {
      setLoadingSkala(false);
    }
  }, []);

  // ── Fetch Semester ────────────────────────────────────────────────────────
  const fetchTahunAjaran = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/manajemen-akademik/tahun-ajaran");
      if (!res.ok) return;
      const data = await res.json();
      const list: TahunAjaranOption[] = (data.data ?? data).map((t: { id: string; label: string; isActive?: boolean }) => ({
        id: t.id,
        label: t.label,
      }));
      setTahunAjaranList(list);
      if (list.length > 0) {
        const active = (data.data ?? data).find((t: { isActive: boolean }) => t.isActive);
        setSelectedTahunAjaranId(active?.id ?? list[0].id);
      }
    } catch {
      // silent
    }
  }, []);

  const fetchSemesters = useCallback(async (tahunAjaranId: string) => {
    if (!tahunAjaranId) return;
    try {
      setLoadingSemester(true);
      const res = await fetch(`/api/admin/manajemen-akademik/pengaturan-akademik/semester?tahunAjaranId=${tahunAjaranId}`);
      if (!res.ok) throw new Error();
      const data: Array<{ id: number; number: 1 | 2; label: string; startDate: string; endDate: string; is_active: boolean }> = await res.json();
      if (data.length > 0) {
        setSemesters(data.map(s => ({
          id: s.id,
          number: s.number,
          label: s.label,
          startDate: s.startDate.slice(0, 10),
          endDate: s.endDate.slice(0, 10),
          is_active: s.is_active,
        })));
      } else {
        setSemesters([
          { number: 1, label: "Semester 1 (Ganjil)", startDate: "", endDate: "", is_active: false },
          { number: 2, label: "Semester 2 (Genap)", startDate: "", endDate: "", is_active: false },
        ]);
      }
    } catch {
      toast.error("Gagal memuat data semester");
    } finally {
      setLoadingSemester(false);
    }
  }, []);

  useEffect(() => { fetchKKM(); }, [fetchKKM]);
  useEffect(() => { fetchBobot(); }, [fetchBobot]);
  useEffect(() => { fetchSkala(); }, [fetchSkala]);
  useEffect(() => { fetchTahunAjaran(); }, [fetchTahunAjaran]);
  useEffect(() => { if (selectedTahunAjaranId) fetchSemesters(selectedTahunAjaranId); }, [selectedTahunAjaranId, fetchSemesters]);

  // ── KKM handlers ──────────────────────────────────────────────────────────
  const handleKKMChange = (id: number, value: string) => {
    const num = parseInt(value, 10);
    if (value === "" || (num >= 0 && num <= 100)) {
      setEditedKKM(prev => ({ ...prev, [id]: value === "" ? 0 : num }));
    }
  };

  const kkmDirtyCount = Object.keys(editedKKM).length;

  const handleSaveKKM = async () => {
    if (kkmDirtyCount === 0) return;
    const updates = Object.entries(editedKKM).map(([id, kkm]) => ({ id: Number(id), kkm }));
    if (updates.some(u => u.kkm < 0 || u.kkm > 100)) {
      toast.error("KKM harus antara 0 dan 100");
      return;
    }
    try {
      setSavingKKM(true);
      const res = await fetch("/api/admin/manajemen-akademik/pengaturan-akademik/kkm", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Gagal menyimpan KKM"); return; }
      setSubjects(prev => prev.map(s => editedKKM[s.id] !== undefined ? { ...s, kkm: editedKKM[s.id] } : s));
      setEditedKKM({});
      toast.success(`KKM ${data.updated} mata pelajaran berhasil disimpan`);
    } catch {
      toast.error("Gagal menyimpan KKM");
    } finally {
      setSavingKKM(false);
    }
  };

  // ── Bobot handlers ────────────────────────────────────────────────────────
  const currentTotal = Object.values(editedWeights).reduce((s, v) => s + v, 0);

  const handleWeightChange = (component: ComponentKey, value: number) => {
    setEditedWeights(prev => ({ ...prev, [component]: value }));
    setBobotDirty(true);
  };

  const handleWeightInput = (component: ComponentKey, raw: string) => {
    const num = parseInt(raw, 10);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      handleWeightChange(component, num);
    }
  };

  const handleResetBobot = () => {
    const map = {} as Record<ComponentKey, number>;
    weights.forEach(w => { map[w.component] = w.weight; });
    setEditedWeights(map);
    setBobotDirty(false);
    toast.info("Perubahan bobot dibatalkan");
  };

  const handleSaveBobot = async () => {
    if (currentTotal !== 100) {
      toast.error(`Total bobot harus 100%. Saat ini: ${currentTotal}%`);
      return;
    }
    try {
      setSavingBobot(true);
      const payload = (Object.entries(editedWeights) as [ComponentKey, number][]).map(
        ([component, weight]) => ({ component, weight })
      );
      const res = await fetch("/api/admin/manajemen-akademik/pengaturan-akademik/bobot", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weights: payload }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Gagal menyimpan bobot"); return; }
      setWeights(payload);
      setBobotDirty(false);
      toast.success("Bobot komponen nilai berhasil disimpan");
    } catch {
      toast.error("Gagal menyimpan bobot");
    } finally {
      setSavingBobot(false);
    }
  };

  // ── Skala handlers ────────────────────────────────────────────────────────
  const updateScale = (index: number, field: keyof GradeScaleEntry, value: string | number) => {
    setScales(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
    setSkalaDirty(true);
  };

  const addScale = () => {
    setScales(prev => [...prev, { grade: "", min_score: 0, max_score: 0, label: "" }]);
    setSkalaDirty(true);
  };

  const removeScale = (index: number) => {
    setScales(prev => prev.filter((_, i) => i !== index));
    setSkalaDirty(true);
  };

  const handleSaveSkala = async () => {
    // Validate no empty grades
    if (scales.some(s => !s.grade.trim())) {
      toast.error("Semua predikat harus diisi");
      return;
    }
    // Validate no duplicate grades
    const gradeKeys = scales.map(s => s.grade.trim().toUpperCase());
    if (new Set(gradeKeys).size !== gradeKeys.length) {
      toast.error("Predikat tidak boleh duplikat");
      return;
    }
    try {
      setSavingSkala(true);
      const res = await fetch("/api/admin/manajemen-akademik/pengaturan-akademik/skala", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scales: scales.map(s => ({
            ...s,
            grade: s.grade.trim().toUpperCase(),
            label: s.label || null,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Gagal menyimpan skala nilai"); return; }
      setSkalaDirty(false);
      toast.success("Skala konversi nilai berhasil disimpan");
    } catch {
      toast.error("Gagal menyimpan skala nilai");
    } finally {
      setSavingSkala(false);
    }
  };

  // ── Semester handlers ─────────────────────────────────────────────────────
  const updateSemester = (index: number, field: keyof SemesterEntry, value: string | boolean) => {
    setSemesters(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const handleSaveSemester = async () => {
    for (const sem of semesters) {
      if (!sem.startDate || !sem.endDate) {
        toast.error(`Semester ${sem.number}: tanggal mulai dan selesai harus diisi`);
        return;
      }
      if (sem.startDate >= sem.endDate) {
        toast.error(`Semester ${sem.number}: tanggal mulai harus sebelum tanggal selesai`);
        return;
      }
    }
    try {
      setSavingSemester(true);
      const res = await fetch("/api/admin/manajemen-akademik/pengaturan-akademik/semester", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tahunAjaranId: selectedTahunAjaranId,
          semesters: semesters.map(s => ({
            number: s.number,
            label: s.label,
            startDate: new Date(s.startDate).toISOString(),
            endDate: new Date(s.endDate).toISOString(),
            is_active: s.is_active,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Gagal menyimpan semester"); return; }
      toast.success("Pengaturan semester berhasil disimpan");
      fetchSemesters(selectedTahunAjaranId);
    } catch {
      toast.error("Gagal menyimpan semester");
    } finally {
      setSavingSemester(false);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const filteredSubjects = subjects.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.code ?? "").toLowerCase().includes(search.toLowerCase())
  );
  const practiceSubjects = filteredSubjects.filter(s => s.is_practice);
  const regularSubjects = filteredSubjects.filter(s => !s.is_practice);

  const totalOk = currentTotal === 100;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaturan Akademik"
        description="Kelola KKM per mata pelajaran dan bobot komponen nilai"
      />

      <Tabs defaultValue="kkm">
        <TabsList>
          <TabsTrigger value="kkm" className="gap-2">
            <BookOpen className="h-4 w-4" />
            KKM per Mata Pelajaran
          </TabsTrigger>
          <TabsTrigger value="bobot" className="gap-2">
            <Scale className="h-4 w-4" />
            Bobot Komponen Nilai
          </TabsTrigger>
          <TabsTrigger value="skala" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            Skala Nilai Huruf
          </TabsTrigger>
          <TabsTrigger value="semester" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            Semester
          </TabsTrigger>
        </TabsList>

        {/* ── TAB KKM ───────────────────────────────────────────────────── */}
        <TabsContent value="kkm" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    KKM per Mata Pelajaran
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Nilai minimal yang harus dicapai siswa. Berlaku untuk semua kelas dan rombel.
                  </CardDescription>
                </div>
                {kkmDirtyCount > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{kkmDirtyCount} perubahan belum disimpan</Badge>
                    <Button variant="outline" size="sm" onClick={() => setEditedKKM({})} disabled={savingKKM}>
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Batal
                    </Button>
                    <Button size="sm" onClick={handleSaveKKM} disabled={savingKKM}>
                      {savingKKM ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                      Simpan
                    </Button>
                  </div>
                )}
              </div>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari mata pelajaran..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 max-w-sm"
                />
              </div>
            </CardHeader>

            <CardContent>
              {loadingKKM ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : subjects.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Belum ada mata pelajaran. Tambahkan di menu Kurikulum & Mata Pelajaran.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {[
                    { label: "Mata Pelajaran Teori", icon: BookOpen, items: regularSubjects },
                    { label: "Mata Pelajaran Praktik", icon: FlaskConical, items: practiceSubjects },
                  ].map(({ label, icon: Icon, items }) =>
                    items.length > 0 ? (
                      <div key={label}>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {label} ({items.length})
                        </h3>
                        <div className="rounded-lg border overflow-hidden">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-muted/50 border-b">
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground w-16">Kode</th>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nama Mata Pelajaran</th>
                                <th className="text-center px-4 py-3 font-medium text-muted-foreground w-36">KKM (0–100)</th>
                                <th className="text-center px-4 py-3 font-medium text-muted-foreground w-24">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {items.map(subject => {
                                const currentKKM = editedKKM[subject.id] !== undefined ? editedKKM[subject.id] : subject.kkm;
                                const isDirty = editedKKM[subject.id] !== undefined;
                                return (
                                  <tr key={subject.id} className={isDirty ? "bg-amber-50 dark:bg-amber-950/20" : "hover:bg-muted/30"}>
                                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{subject.code ?? "—"}</td>
                                    <td className="px-4 py-3 font-medium">
                                      {subject.name}
                                      {isDirty && <span className="ml-2 text-xs text-amber-600">• diubah</span>}
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center justify-center">
                                        <Input
                                          type="number"
                                          min={0}
                                          max={100}
                                          value={currentKKM}
                                          onChange={e => handleKKMChange(subject.id, e.target.value)}
                                          className="w-24 text-center h-8 text-sm"
                                        />
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <Badge variant={currentKKM >= 75 ? "default" : "secondary"} className="text-xs">
                                        {currentKKM >= 75 ? "Standar" : "Di bawah standar"}
                                      </Badge>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : null
                  )}
                  {filteredSubjects.length === 0 && (
                    <p className="text-center py-8 text-muted-foreground">
                      Tidak ada mata pelajaran yang cocok dengan pencarian &ldquo;{search}&rdquo;
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {kkmDirtyCount > 0 && (
            <div className="sticky bottom-4 flex justify-end mt-4">
              <div className="flex items-center gap-3 bg-background border rounded-lg shadow-lg px-4 py-3">
                <span className="text-sm text-muted-foreground">{kkmDirtyCount} mata pelajaran diubah</span>
                <Button variant="outline" size="sm" onClick={() => setEditedKKM({})} disabled={savingKKM}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Batal
                </Button>
                <Button size="sm" onClick={handleSaveKKM} disabled={savingKKM}>
                  {savingKKM ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                  Simpan Semua
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── TAB BOBOT ─────────────────────────────────────────────────── */}
        <TabsContent value="bobot" className="mt-6">
          <div className="space-y-6">
            {/* Progress bar visual total */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Scale className="h-5 w-5" />
                      Bobot Komponen Nilai
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Total bobot semua komponen harus tepat 100%. Berlaku secara global untuk semua mata pelajaran.
                    </CardDescription>
                  </div>
                  {bobotDirty && (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={handleResetBobot} disabled={savingBobot}>
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Batal
                      </Button>
                      <Button size="sm" onClick={handleSaveBobot} disabled={savingBobot || !totalOk}>
                        {savingBobot ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                        Simpan
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Stacked bar visual */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Total: {currentTotal}%</span>
                    {totalOk
                      ? <Badge variant="default" className="bg-green-600">✓ Tepat 100%</Badge>
                      : <Badge variant="destructive">{currentTotal > 100 ? `Kelebihan ${currentTotal - 100}%` : `Kurang ${100 - currentTotal}%`}</Badge>
                    }
                  </div>
                  <div className="h-6 rounded-full overflow-hidden flex bg-muted">
                    {(Object.entries(editedWeights) as [ComponentKey, number][]).map(([comp, pct]) =>
                      pct > 0 ? (
                        <div
                          key={comp}
                          className={`${COMPONENT_COLORS[comp]} transition-all duration-300`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                          title={`${COMPONENT_LABELS[comp]}: ${pct}%`}
                        />
                      ) : null
                    )}
                  </div>
                  {/* Legend */}
                  <div className="flex flex-wrap gap-3 mt-3">
                    {(Object.keys(COMPONENT_LABELS) as ComponentKey[]).map(comp => (
                      <div key={comp} className="flex items-center gap-1.5 text-xs">
                        <div className={`w-3 h-3 rounded-sm ${COMPONENT_COLORS[comp]}`} />
                        <span className="text-muted-foreground">{COMPONENT_LABELS[comp]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Slider controls */}
                {loadingBobot ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {(Object.keys(COMPONENT_LABELS) as ComponentKey[]).map(comp => {
                      const val = editedWeights[comp] ?? 0;
                      return (
                        <div key={comp} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-sm shrink-0 ${COMPONENT_COLORS[comp]}`} />
                              <span className="text-sm font-medium">{COMPONENT_LABELS[comp]}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={val}
                                onChange={e => handleWeightInput(comp, e.target.value)}
                                className="w-20 h-8 text-center text-sm"
                              />
                              <span className="text-sm text-muted-foreground w-4">%</span>
                            </div>
                          </div>
                          <Slider
                            min={0}
                            max={100}
                            step={1}
                            value={[val]}
                            onValueChange={([v]) => handleWeightChange(comp, v)}
                            className="w-full"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info card */}
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
              <CardContent className="pt-5">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Catatan:</strong> Bobot ini digunakan sebagai referensi global untuk kalkulasi nilai akhir siswa.
                  Guru tetap dapat menyesuaikan bobot rubrik penilaian secara individual per kelas melalui menu Tugas & Nilai.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── TAB SKALA ─────────────────────────────────────────────────── */}
        <TabsContent value="skala" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Skala Konversi Nilai Huruf
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Tentukan rentang nilai angka untuk setiap predikat huruf. Gunakan di laporan dan rekap nilai.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {skalaDirty && (
                    <>
                      <Button variant="outline" size="sm" onClick={fetchSkala} disabled={savingSkala}>
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Batal
                      </Button>
                      <Button size="sm" onClick={handleSaveSkala} disabled={savingSkala}>
                        {savingSkala ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                        Simpan
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {loadingSkala ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Preview bar */}
                  <div className="flex h-8 rounded-full overflow-hidden gap-0.5 mb-6">
                    {scales
                      .slice()
                      .sort((a, b) => b.min_score - a.min_score)
                      .map((s, i) => {
                        const span = Math.max(0, s.max_score - s.min_score + 1);
                        return span > 0 ? (
                          <div
                            key={s.grade || i}
                            className={`${SCALE_COLORS[i % SCALE_COLORS.length]} flex items-center justify-center text-white text-xs font-bold transition-all`}
                            style={{ width: `${span}%` }}
                            title={`${s.grade}: ${s.min_score}–${s.max_score}`}
                          >
                            {span >= 6 ? s.grade : ""}
                          </div>
                        ) : null;
                      })}
                  </div>

                  {/* Header row */}
                  <div className="grid grid-cols-[48px_1fr_100px_100px_120px] gap-3 px-1">
                    <div />
                    <span className="text-xs font-medium text-muted-foreground">Label / Deskripsi</span>
                    <span className="text-xs font-medium text-muted-foreground text-center">Min</span>
                    <span className="text-xs font-medium text-muted-foreground text-center">Maks</span>
                    <span className="text-xs font-medium text-muted-foreground text-center">Predikat</span>
                  </div>

                  <Separator />

                  {/* Scale rows */}
                  <div className="space-y-2">
                    {scales.map((s, i) => (
                      <div key={i} className="grid grid-cols-[48px_1fr_100px_100px_120px] gap-3 items-center">
                        {/* Color dot */}
                        <div className="flex justify-center">
                          <div className={`w-4 h-4 rounded-full ${SCALE_COLORS[i % SCALE_COLORS.length]}`} />
                        </div>

                        {/* Label */}
                        <Input
                          value={s.label}
                          onChange={e => updateScale(i, "label", e.target.value)}
                          placeholder="Sangat Baik, Baik, ..."
                          className="h-8 text-sm"
                        />

                        {/* Min */}
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={s.min_score}
                          onChange={e => updateScale(i, "min_score", parseInt(e.target.value) || 0)}
                          className="h-8 text-sm text-center"
                        />

                        {/* Max */}
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={s.max_score}
                          onChange={e => updateScale(i, "max_score", parseInt(e.target.value) || 0)}
                          className="h-8 text-sm text-center"
                        />

                        {/* Grade + delete */}
                        <div className="flex items-center gap-1">
                          <Input
                            value={s.grade}
                            onChange={e => updateScale(i, "grade", e.target.value.toUpperCase())}
                            placeholder="A"
                            maxLength={5}
                            className="h-8 text-sm text-center font-bold w-16"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeScale(i)}
                            disabled={scales.length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addScale}
                    className="mt-2 gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Tambah Predikat
                  </Button>

                  {/* Info */}
                  <div className="mt-4 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                    <strong>Tips:</strong> Pastikan rentang nilai tidak tumpang tindih. Sistem akan otomatis mendeteksi predikat berdasarkan nilai akhir siswa.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB SEMESTER ──────────────────────────────────────────────── */}
        <TabsContent value="semester" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    Pengaturan Semester
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Atur tanggal mulai dan selesai semester per tahun ajaran.
                  </CardDescription>
                </div>
                <Button size="sm" onClick={handleSaveSemester} disabled={savingSemester || !selectedTahunAjaranId}>
                  {savingSemester ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                  Simpan
                </Button>
              </div>

              {/* Tahun Ajaran selector */}
              <div className="mt-3 flex items-center gap-3">
                <label className="text-sm font-medium shrink-0">Tahun Ajaran:</label>
                <Select value={selectedTahunAjaranId} onValueChange={setSelectedTahunAjaranId}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Pilih tahun ajaran..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tahunAjaranList.map(ta => (
                      <SelectItem key={ta.id} value={ta.id}>{ta.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent>
              {loadingSemester ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : !selectedTahunAjaranId ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Pilih tahun ajaran untuk mengatur semester.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {semesters.map((sem, i) => (
                    <div key={sem.number} className="rounded-lg border p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">Semester {sem.number}</Badge>
                          <Input
                            value={sem.label}
                            onChange={e => updateSemester(i, "label", e.target.value)}
                            placeholder="Semester 1 (Ganjil)"
                            className="h-8 text-sm w-56"
                          />
                        </h3>
                        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={sem.is_active}
                            onChange={e => updateSemester(i, "is_active", e.target.checked)}
                            className="w-4 h-4"
                          />
                          <span className="text-muted-foreground">Aktif</span>
                          {sem.is_active && <Badge className="bg-green-600 text-xs">Berjalan</Badge>}
                        </label>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">Tanggal Mulai</label>
                          <Input
                            type="date"
                            value={sem.startDate}
                            onChange={e => updateSemester(i, "startDate", e.target.value)}
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">Tanggal Selesai</label>
                          <Input
                            type="date"
                            value={sem.endDate}
                            onChange={e => updateSemester(i, "endDate", e.target.value)}
                            className="h-9"
                          />
                        </div>
                      </div>

                      {sem.startDate && sem.endDate && sem.startDate < sem.endDate && (
                        <p className="text-xs text-muted-foreground">
                          Durasi:{" "}
                          {Math.round((new Date(sem.endDate).getTime() - new Date(sem.startDate).getTime()) / (1000 * 60 * 60 * 24 * 7))}{" "}
                          minggu
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
