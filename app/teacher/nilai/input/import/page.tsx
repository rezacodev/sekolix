"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft, Download, Upload, FileSpreadsheet, CheckCircle2,
  AlertTriangle, XCircle, Loader2, Info,
} from "lucide-react";
import { toast } from "sonner";

// ── Types ────────────────────────────────────────────────────────────────────

interface ClassSubject {
  teacherSubjectId: string;
  rombelId: string;
  rombelName: string;
  className: string;
  subjectId: string;
  subjectName: string;
}

interface PreviewRow {
  row: number;
  studentId: string | null;
  studentName: string;
  nisn: string;
  found: boolean;
  scores: Record<string, number | null>;
  errors: string[];
}

interface RubricCol {
  rubricId: string;
  name: string;
  maxScore: number;
}

interface PreviewResult {
  preview: PreviewRow[];
  rubricCols: RubricCol[];
  totalRows: number;
  validRows: number;
  errorRows: number;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function ImportNilaiPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [selected, setSelected] = useState<ClassSubject | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);

  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [saveResult, setSaveResult] = useState<{ saved: number; errors: string[] } | null>(null);

  // Load teacher class+subject list
  useEffect(() => {
    fetch("/api/teacher/my-classes")
      .then((r) => r.json())
      .then((data) => {
        const flat: ClassSubject[] = [];
        data.data?.forEach((rombel: {
          rombelId: number; rombelName: string; className: string;
          subjects?: { teacherSubjectId: number; id: number; name: string }[];
        }) => {
          rombel.subjects?.forEach((sub) => {
            flat.push({
              teacherSubjectId: String(sub.teacherSubjectId),
              rombelId: String(rombel.rombelId),
              rombelName: rombel.rombelName,
              className: rombel.className,
              subjectId: String(sub.id),
              subjectName: sub.name,
            });
          });
        });
        setClassSubjects(flat);
      })
      .catch(() => toast.error("Gagal memuat daftar kelas"));
  }, []);

  function handleClassChange(key: string) {
    setSelectedKey(key);
    setSelected(classSubjects.find((c) => c.teacherSubjectId === key) ?? null);
    setFile(null);
    setPreview(null);
    setSaveResult(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null);
    setPreview(null);
    setSaveResult(null);
  }

  async function downloadTemplate() {
    if (!selected) return;
    setDownloadingTemplate(true);
    try {
      const params = new URLSearchParams({ rombelId: selected.rombelId, subjectId: selected.subjectId });
      const res = await fetch(`/api/teacher/nilai/input/import/template?${params}`);
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Gagal mengunduh template");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `template-import-nilai-${selected.className}-${selected.rombelName}-${selected.subjectName}.xlsx`
        .replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Template berhasil diunduh");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengunduh template");
    } finally {
      setDownloadingTemplate(false);
    }
  }

  async function handlePreview() {
    if (!file || !selected) return;
    setPreviewing(true);
    setPreview(null);
    setSaveResult(null);
    try {
      const params = new URLSearchParams({ rombelId: selected.rombelId, subjectId: selected.subjectId, preview: "1" });
      const form = new FormData();
      form.append("file", file);
      form.append("rombelId", selected.rombelId);
      form.append("subjectId", selected.subjectId);
      const res = await fetch(`/api/teacher/nilai/input/import?${params}`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal memproses file");
      setPreview(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memproses file");
    } finally {
      setPreviewing(false);
    }
  }

  async function handleSave() {
    if (!file || !selected || !preview) return;
    setSaving(true);
    setSaveResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("rombelId", selected.rombelId);
      form.append("subjectId", selected.subjectId);
      const res = await fetch("/api/teacher/nilai/input/import", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan nilai");
      setSaveResult({ saved: data.saved, errors: data.errors ?? [] });
      if (data.saved > 0) toast.success(`${data.saved} nilai berhasil disimpan`);
      if (data.errors?.length > 0) toast.warning(`${data.errors.length} baris gagal disimpan`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan nilai");
    } finally {
      setSaving(false);
    }
  }

  const canPreview = !!file && !!selected;
  const canSave = !!preview && preview.validRows > 0 && !saveResult;

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/teacher/nilai/input")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Import Nilai dari Excel</h1>
          <p className="text-muted-foreground text-sm">Upload file Excel untuk memasukkan nilai secara massal</p>
        </div>
      </div>

      {/* Step 1: Pilih kelas + mapel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <span className="rounded-full bg-primary text-primary-foreground w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0">1</span>
            Pilih Kelas &amp; Mata Pelajaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <div className="flex-1 space-y-1.5">
              <Label>Kelas &amp; Mata Pelajaran</Label>
              <Select value={selectedKey} onValueChange={handleClassChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kelas dan mata pelajaran..." />
                </SelectTrigger>
                <SelectContent>
                  {classSubjects.map((cs) => (
                    <SelectItem key={cs.teacherSubjectId} value={cs.teacherSubjectId}>
                      {cs.className} {cs.rombelName} — {cs.subjectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              disabled={!selected || downloadingTemplate}
              onClick={downloadTemplate}
              className="shrink-0"
            >
              {downloadingTemplate
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mengunduh...</>
                : <><Download className="w-4 h-4 mr-2" /> Unduh Template</>}
            </Button>
          </div>
          {selected && (
            <div className="flex items-start gap-2 mt-3 p-3 rounded-lg border border-blue-200 bg-blue-50 text-sm text-blue-700">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p>
                Unduh template Excel untuk kelas <strong>{selected.className} {selected.rombelName}</strong> — <strong>{selected.subjectName}</strong>.
                Template sudah berisi nama siswa, NISN, dan kolom rubrik yang benar. Isi nilai pada kolom rubrik lalu upload kembali.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Upload file */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <span className="rounded-full bg-primary text-primary-foreground w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0">2</span>
            Upload File Excel
          </CardTitle>
          <CardDescription>Format yang didukung: .xlsx · .xls</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <FileSpreadsheet className="w-8 h-8 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              {file ? (
                <>
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                </>
              ) : (
                <>
                  <p className="font-medium text-muted-foreground">Klik untuk pilih file Excel</p>
                  <p className="text-xs text-muted-foreground">atau drag &amp; drop file di sini</p>
                </>
              )}
            </div>
            {file && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); setSaveResult(null); if (fileRef.current) fileRef.current.value = ""; }}
              >
                Ganti
              </Button>
            )}
          </div>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="hidden" onChange={handleFileChange} />

          <div className="flex gap-3 mt-4">
            <Button onClick={handlePreview} disabled={!canPreview || previewing}>
              {previewing
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memeriksa...</>
                : "Periksa Data"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Preview */}
      {preview && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="rounded-full bg-primary text-primary-foreground w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                  Preview Data
                </CardTitle>
                <CardDescription className="mt-1">
                  {preview.totalRows} baris ditemukan · <span className="text-green-600 font-medium">{preview.validRows} valid</span>
                  {preview.errorRows > 0 && <> · <span className="text-red-600 font-medium">{preview.errorRows} bermasalah</span></>}
                </CardDescription>
              </div>
              <Button onClick={handleSave} disabled={!canSave || saving}>
                {saving
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</>
                  : <><Upload className="w-4 h-4 mr-2" /> Simpan {preview.validRows} Nilai</>}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-center p-2.5 font-medium border-b min-w-[40px]">#</th>
                    <th className="text-left p-2.5 font-medium border-b min-w-[40px]">Status</th>
                    <th className="text-left p-2.5 font-medium border-b min-w-[180px]">Nama Siswa</th>
                    <th className="text-left p-2.5 font-medium border-b min-w-[120px]">NISN</th>
                    {preview.rubricCols.map((rc) => (
                      <th key={rc.rubricId} className="text-center p-2.5 font-medium border-b min-w-[110px]">
                        <div>{rc.name}</div>
                        <div className="text-xs font-normal text-muted-foreground">maks {rc.maxScore}</div>
                      </th>
                    ))}
                    <th className="text-left p-2.5 font-medium border-b min-w-[160px]">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.preview.map((row, idx) => {
                    const hasErr = !row.found || row.errors.length > 0;
                    return (
                      <tr key={row.row} className={`${idx % 2 === 1 ? "bg-muted/20" : ""} ${hasErr ? "bg-red-50" : ""}`}>
                        <td className="p-2.5 text-center text-muted-foreground text-xs">{row.row}</td>
                        <td className="p-2.5">
                          {hasErr
                            ? <XCircle className="w-4 h-4 text-red-500" />
                            : <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        </td>
                        <td className="p-2.5 font-medium">{row.studentName || <span className="text-muted-foreground italic">—</span>}</td>
                        <td className="p-2.5 text-muted-foreground text-xs">{row.nisn || "—"}</td>
                        {preview.rubricCols.map((rc) => {
                          const score = row.scores[rc.rubricId];
                          return (
                            <td key={rc.rubricId} className="p-2.5 text-center">
                              {score != null ? (
                                <span className={score >= rc.maxScore * 0.75 ? "text-green-700 font-medium" : score < rc.maxScore * 0.5 ? "text-red-600" : ""}>
                                  {score}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="p-2.5">
                          {row.errors.length > 0 ? (
                            <ul className="space-y-0.5">
                              {row.errors.map((e, i) => (
                                <li key={i} className="text-xs text-red-600 flex items-start gap-1">
                                  <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />{e}
                                </li>
                              ))}
                            </ul>
                          ) : !row.found ? (
                            <span className="text-xs text-red-600">Siswa tidak ditemukan</span>
                          ) : (
                            <span className="text-xs text-green-600">Siap disimpan</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save result */}
      {saveResult && (
        <Card className={saveResult.errors.length === 0 ? "border-green-300 bg-green-50" : "border-amber-300 bg-amber-50"}>
          <CardContent className="pt-5">
            <div className="flex items-start gap-3">
              {saveResult.errors.length === 0
                ? <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                : <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />}
              <div className="flex-1">
                <p className="font-semibold">
                  {saveResult.saved} nilai berhasil disimpan
                  {saveResult.errors.length > 0 && `, ${saveResult.errors.length} gagal`}
                </p>
                {saveResult.errors.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {saveResult.errors.map((e, i) => (
                      <li key={i} className="text-xs text-amber-700">{e}</li>
                    ))}
                  </ul>
                )}
              </div>
              <Button size="sm" variant="outline" onClick={() => router.push("/teacher/nilai/input")}>
                Ke Input Nilai
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
