import Link from "next/link";
import { ChevronLeft, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AnalitikPage() {
  // Get trends: students per year, average grades per year
  const [yearList, recentGrades] = await Promise.all([
    prisma.tahunAjaran.findMany({
      where: { deleted_at: null },
      orderBy: { startDate: "asc" },
      select: {
        id: true,
        label: true,
        startDate: true,
        _count: { select: { pesertaDidik: true } },
      },
    }),
    prisma.grade.findMany({
      where: { deleted_at: null },
      take: 500,
      orderBy: { created_at: "desc" },
      include: {
        assessment: { select: { max_score: true, weight: true } },
        student: { select: { entryYearId: true } },
      },
    }),
  ]);

  // Group grades by year
  const gradesByYear = new Map<string, { total: number; count: number }>();
  for (const g of recentGrades) {
    const yearId = g.student.entryYearId ?? "unknown";
    const entry = gradesByYear.get(yearId) ?? { total: 0, count: 0 };
    const max = Number(g.assessment.max_score ?? 100);
    const norm = max > 0 ? (Number(g.score) / max) * 100 : Number(g.score);
    entry.total += norm * (g.assessment.weight || 1);
    entry.count += g.assessment.weight || 1;
    gradesByYear.set(yearId, entry);
  }

  const trendData = yearList.map((y) => {
    const grades = gradesByYear.get(y.id);
    return {
      label: y.label,
      students: y._count.pesertaDidik,
      avgScore: grades && grades.count > 0 ? Math.round((grades.total / grades.count) * 100) / 100 : 0,
    };
  });

  const maxStudents = Math.max(...trendData.map((d) => d.students), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/manajemen-akademik/laporan">
            <ChevronLeft className="h-4 w-4" />
            Kembali
          </Link>
        </Button>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">D — Laporan Analitik</h1>
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
            Prioritas Rendah
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Tren lintas tahun: pertumbuhan siswa, tren nilai, perbandingan antar tahun ajaran.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Tren Pertumbuhan Siswa
          </CardTitle>
          <CardDescription>Per tahun ajaran</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trendData.map((d) => (
              <div key={d.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{d.label}</span>
                  <span className="font-mono">{d.students} siswa</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${maxStudents > 0 ? (d.students / maxStudents) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
            {trendData.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Belum ada data tahun ajaran.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rata-rata Nilai per Tahun Ajaran</CardTitle>
          <CardDescription>Diperoleh dari 500 nilai terakhir</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {trendData
              .filter((d) => d.avgScore > 0)
              .map((d) => (
                <div
                  key={d.label}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <span className="font-medium">{d.label}</span>
                  <Badge variant="outline" className="font-mono">
                    {d.avgScore.toFixed(2)}
                  </Badge>
                </div>
              ))}
            {trendData.every((d) => d.avgScore === 0) && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Belum ada data nilai yang cukup.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
