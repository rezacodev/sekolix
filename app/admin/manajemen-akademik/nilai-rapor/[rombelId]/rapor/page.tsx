"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Download, FileText, Users, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { useBreadcrumb } from "@/hooks/useBreadcrumb";

interface StudentRow {
  studentId: string;
  studentName: string;
  nisn: string;
  finalScore: number | null;
  grade: string;
  status: "TUNTAS" | "REMEDIAL" | "BELUM";
}

interface SubjectData {
  subjectId: number;
  subjectName: string;
  kkm: number;
  students: StudentRow[];
  stats: {
    totalStudents: number;
    completedCount: number;
    passCount: number;
    averageScore: number | null;
  };
}

interface RombelInfo {
  id: number;
  name: string;
  className: string;
  programName: string;
  tahunAjaranLabel: string;
  studentCount: number;
}

export default function RaporPage({
  params,
}: {
  params: Promise<{ rombelId: string }>;
}) {
  const { rombelId } = use(params);
  const breadcrumbContext = useBreadcrumb();

  const [rombel, setRombel] = useState<RombelInfo | null>(null);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/manajemen-akademik/nilai-rapor/${rombelId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRombel(data.rombel);
      setSubjects(data.subjects);
      breadcrumbContext?.setBreadcrumbs?.([
        { label: "Manajemen Akademik", href: "/admin/manajemen-akademik" },
        { label: "Nilai & Rapor", href: "/admin/manajemen-akademik/nilai-rapor" },
        { label: data.rombel.name, href: `/admin/manajemen-akademik/nilai-rapor/${rombelId}` },
        { label: "Rapor", href: `/admin/manajemen-akademik/nilai-rapor/${rombelId}/rapor` },
      ]);
    } catch {
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rombelId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const downloadRapor = async (studentId?: string, studentName?: string) => {
    const key = studentId ?? "all";
    try {
      setDownloading(key);
      const params = new URLSearchParams({ rombelId });
      if (studentId) params.append("studentId", studentId);
      const res = await fetch(`/api/admin/manajemen-akademik/rapor/generate?${params}`);
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Gagal generate rapor");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = studentName
        ? `rapor-${studentName}.pdf`
        : `rapor-massal-${rombel?.name ?? "rombel"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(studentId ? "Rapor berhasil diunduh" : "Rapor massal berhasil diunduh");
    } catch {
      toast.error("Gagal mengunduh rapor");
    } finally {
      setDownloading(null);
    }
  };

  // Build per-student summary across all subjects
  const studentSummary = (() => {
    if (!rombel || subjects.length === 0) return [];
    const map = new Map<string, { name: string; nisn: string; scores: number[]; passCount: number; totalSubjects: number }>();

    for (const subj of subjects) {
      for (const st of subj.students) {
        if (!map.has(st.studentId)) {
          map.set(st.studentId, { name: st.studentName, nisn: st.nisn, scores: [], passCount: 0, totalSubjects: 0 });
        }
        const entry = map.get(st.studentId)!;
        entry.totalSubjects++;
        if (st.finalScore !== null) {
          entry.scores.push(st.finalScore);
          if (st.status === "TUNTAS") entry.passCount++;
        }
      }
    }

    return [...map.entries()].map(([id, v]) => ({
      studentId: id,
      studentName: v.name,
      nisn: v.nisn,
      avgScore: v.scores.length > 0 ? Math.round((v.scores.reduce((s, x) => s + x, 0) / v.scores.length) * 100) / 100 : null,
      passCount: v.passCount,
      totalSubjects: v.totalSubjects,
      completedSubjects: v.scores.length,
      readyForRapor: v.scores.length === subjects.length,
    })).sort((a, b) => a.studentName.localeCompare(b.studentName));
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!rombel) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>Rombel tidak ditemukan.</p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/admin/manajemen-akademik/nilai-rapor">
            <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
          </Link>
        </Button>
      </div>
    );
  }

  const readyCount = studentSummary.filter((s) => s.readyForRapor).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Rapor — ${rombel.name}`}
        description={`${rombel.className} · ${rombel.programName} · ${rombel.tahunAjaranLabel}`}
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/manajemen-akademik/nilai-rapor/${rombelId}`}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Kembali ke Nilai
            </Link>
          </Button>
          <Button
            size="sm"
            onClick={() => downloadRapor()}
            disabled={downloading === "all" || readyCount === 0}
          >
            {downloading === "all" ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-1" />
            )}
            Unduh Semua Rapor ({readyCount} siswa)
          </Button>
        </div>
      </PageHeader>

      {/* Info banner */}
      <Card className={readyCount === rombel.studentCount
        ? "border-green-200 bg-green-50 dark:bg-green-950/20"
        : "border-amber-200 bg-amber-50 dark:bg-amber-950/20"}>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            {readyCount === rombel.studentCount ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            )}
            <div className="text-sm">
              <p className="font-medium">
                {readyCount}/{rombel.studentCount} siswa siap cetak rapor
              </p>
              {readyCount < rombel.studentCount && (
                <p className="text-muted-foreground mt-0.5">
                  {rombel.studentCount - readyCount} siswa belum memiliki data nilai lengkap di semua mata pelajaran.
                  Rapor tetap dapat dicetak dengan nilai yang sudah ada.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student rapor table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5" />
            Daftar Rapor Siswa
          </CardTitle>
          <CardDescription>
            Klik tombol unduh untuk cetak rapor PDF per siswa, atau gunakan tombol "Unduh Semua" di atas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {studentSummary.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Belum ada data siswa atau nilai untuk rombel ini.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="text-left px-3 py-2.5 font-medium text-muted-foreground w-10">No</th>
                    <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Nama Siswa</th>
                    <th className="text-left px-3 py-2.5 font-medium text-muted-foreground w-32">NISN</th>
                    <th className="text-center px-3 py-2.5 font-medium text-muted-foreground w-28">Nilai Rata-rata</th>
                    <th className="text-center px-3 py-2.5 font-medium text-muted-foreground w-28">Tuntas / Mapel</th>
                    <th className="text-center px-3 py-2.5 font-medium text-muted-foreground w-28">Data Nilai</th>
                    <th className="text-center px-3 py-2.5 font-medium text-muted-foreground w-28">Unduh Rapor</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {studentSummary.map((student, idx) => (
                    <tr key={student.studentId} className="hover:bg-muted/20">
                      <td className="px-3 py-2.5 text-muted-foreground">{idx + 1}</td>
                      <td className="px-3 py-2.5 font-medium">{student.studentName}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{student.nisn || "-"}</td>
                      <td className="px-3 py-2.5 text-center font-semibold">
                        {student.avgScore !== null ? student.avgScore : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={student.passCount === student.completedSubjects && student.completedSubjects > 0
                          ? "text-green-600 font-semibold"
                          : student.passCount === 0
                            ? "text-red-500"
                            : "text-amber-600"}>
                          {student.passCount}/{student.totalSubjects}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {student.readyForRapor ? (
                          <Badge className="bg-green-600 text-xs">Lengkap</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            {student.completedSubjects}/{student.totalSubjects} mapel
                          </Badge>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1"
                          onClick={() => downloadRapor(student.studentId, student.studentName)}
                          disabled={downloading === student.studentId}
                        >
                          {downloading === student.studentId ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Download className="h-3 w-3" />
                          )}
                          PDF
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
