"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  ArrowLeft,
  Users,
  BarChart2,
  BookOpen,
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { useBreadcrumb } from "@/hooks/useBreadcrumb";

// ─── Types ──────────────────────────────────────────────────────────────────

interface RubricInfo {
  id: number;
  name: string;
  weight: number;
  maxScore: number;
}

interface StudentRow {
  studentId: string;
  studentName: string;
  nisn: string;
  rubricScores: Record<string, number | null>;
  finalScore: number | null;
  grade: string;
  status: "TUNTAS" | "REMEDIAL" | "BELUM";
}

interface SubjectData {
  subjectId: number;
  subjectName: string;
  kkm: number;
  rubrics: RubricInfo[];
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

// ─── Page ───────────────────────────────────────────────────────────────────

export default function RombelNilaiPage({
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
      ]);
    } catch {
      toast.error("Gagal memuat data nilai");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rombelId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDownloadRapor = async (studentId?: string, studentName?: string) => {
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
        : `rapor-massal-${rombel?.name}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Gagal mengunduh rapor");
    } finally {
      setDownloading(null);
    }
  };

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

  const statusColor = (status: string) => {
    if (status === "TUNTAS") return "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300";
    if (status === "REMEDIAL") return "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Nilai — ${rombel.name}`}
        description={`${rombel.className} · ${rombel.programName} · ${rombel.tahunAjaranLabel}`}
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/manajemen-akademik/nilai-rapor">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Kembali
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/manajemen-akademik/nilai-rapor/${rombelId}/rapor`}>
              <FileText className="h-4 w-4 mr-1" />
              Halaman Rapor
            </Link>
          </Button>
          <Button
            size="sm"
            onClick={() => handleDownloadRapor()}
            disabled={downloading === "all" || subjects.length === 0}
          >
            {downloading === "all" ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-1" />
            )}
            Unduh Rapor Massal
          </Button>
        </div>
      </PageHeader>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xl font-bold">{rombel.studentCount}</p>
                <p className="text-xs text-muted-foreground">Siswa</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xl font-bold">{subjects.length}</p>
                <p className="text-xs text-muted-foreground">Mata Pelajaran</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-xl font-bold text-green-600">
                  {subjects.reduce((s, subj) => s + subj.stats.passCount, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Entri TUNTAS</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-xl font-bold text-red-600">
                  {subjects.reduce(
                    (s, subj) =>
                      s + subj.students.filter((st) => st.status === "REMEDIAL").length,
                    0
                  )}
                </p>
                <p className="text-xs text-muted-foreground">Entri REMEDIAL</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject tabs */}
      {subjects.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <BarChart2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Belum ada data nilai untuk rombel ini</p>
            <p className="text-sm mt-1">Guru perlu menginput rubrik dan nilai melalui portal guru.</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue={String(subjects[0].subjectId)}>
          <div className="overflow-x-auto">
            <TabsList className="flex w-max gap-1">
              {subjects.map((subj) => (
                <TabsTrigger key={subj.subjectId} value={String(subj.subjectId)} className="text-xs gap-1.5">
                  {subj.subjectName}
                  {subj.stats.completedCount > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      subj.stats.passCount === subj.stats.totalStudents
                        ? "bg-green-500 text-white"
                        : "bg-amber-500 text-white"
                    }`}>
                      {Math.round((subj.stats.passCount / subj.stats.totalStudents) * 100)}%
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {subjects.map((subj) => (
            <TabsContent key={subj.subjectId} value={String(subj.subjectId)} className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <CardTitle className="text-base">{subj.subjectName}</CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-3">
                        <span>KKM: <strong>{subj.kkm}</strong></span>
                        <span>Selesai: <strong>{subj.stats.completedCount}/{subj.stats.totalStudents}</strong></span>
                        {subj.stats.averageScore !== null && (
                          <span>Rata-rata: <strong>{subj.stats.averageScore}</strong></span>
                        )}
                        <span className="text-green-600">Tuntas: <strong>{subj.stats.passCount}</strong></span>
                        <span className="text-red-600">
                          Remedial: <strong>{subj.students.filter(s => s.status === "REMEDIAL").length}</strong>
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50 border-b">
                          <th className="text-left px-3 py-2.5 font-medium text-muted-foreground w-10">No</th>
                          <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Nama Siswa</th>
                          <th className="text-left px-3 py-2.5 font-medium text-muted-foreground w-28">NISN</th>
                          {subj.rubrics.map((r) => (
                            <th key={r.id} className="text-center px-3 py-2.5 font-medium text-muted-foreground w-24">
                              <div className="text-xs">{r.name}</div>
                              <div className="text-xs font-normal opacity-60">bobot {r.weight}</div>
                            </th>
                          ))}
                          <th className="text-center px-3 py-2.5 font-medium text-muted-foreground w-24">Nilai Akhir</th>
                          <th className="text-center px-3 py-2.5 font-medium text-muted-foreground w-20">Predikat</th>
                          <th className="text-center px-3 py-2.5 font-medium text-muted-foreground w-24">Status</th>
                          <th className="text-center px-3 py-2.5 font-medium text-muted-foreground w-24">Rapor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {subj.students.map((student, idx) => (
                          <tr key={student.studentId} className="hover:bg-muted/20">
                            <td className="px-3 py-2.5 text-muted-foreground">{idx + 1}</td>
                            <td className="px-3 py-2.5 font-medium">{student.studentName}</td>
                            <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{student.nisn || "-"}</td>
                            {subj.rubrics.map((r) => (
                              <td key={r.id} className="px-3 py-2.5 text-center">
                                {student.rubricScores[String(r.id)] !== null &&
                                student.rubricScores[String(r.id)] !== undefined
                                  ? student.rubricScores[String(r.id)]
                                  : <span className="text-muted-foreground text-xs">—</span>}
                              </td>
                            ))}
                            <td className="px-3 py-2.5 text-center font-semibold">
                              {student.finalScore !== null ? student.finalScore : <span className="text-muted-foreground text-xs">—</span>}
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <span className="font-bold text-sm">{student.grade}</span>
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor(student.status)}`}>
                                {student.status}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => handleDownloadRapor(student.studentId, student.studentName)}
                                disabled={downloading === student.studentId || student.finalScore === null}
                              >
                                {downloading === student.studentId ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Download className="h-3 w-3" />
                                )}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
