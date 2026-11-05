import Link from "next/link";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LaporanFilters } from "../_components/LaporanFilters";
import { ExportButtons } from "../_components/ExportButtons";

interface SearchParams {
  tahunAjaranId?: string;
}

export const dynamic = "force-dynamic";

const KKM = 75;

export default async function KetuntasanKKMPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const { tahunAjaranId } = await props.searchParams;

  const [tahunAjaranList, assessments] = await Promise.all([
    prisma.tahunAjaran.findMany({
      where: { deleted_at: null },
      orderBy: { startDate: "desc" },
      select: { id: true, label: true, isActive: true },
    }),
    prisma.assessment.findMany({
      where: { deleted_at: null },
      include: {
        subject: { select: { name: true } },
        grades: { where: { deleted_at: null }, select: { score: true } },
      },
    }),
  ]);

  const bySubject = new Map<
    string,
    { name: string; totalStudents: number; tuntas: number }
  >();
  for (const a of assessments) {
    const sid = String(a.subject_id);
    const entry = bySubject.get(sid) ?? { name: a.subject.name, totalStudents: 0, tuntas: 0 };
    const max = Number(a.max_score ?? 100);
    for (const g of a.grades) {
      const norm = max > 0 ? (Number(g.score) / max) * 100 : Number(g.score);
      entry.totalStudents += 1;
      if (norm >= KKM) entry.tuntas += 1;
    }
    bySubject.set(sid, entry);
  }

  const rows = Array.from(bySubject.values())
    .map((v) => ({
      name: v.name,
      total: v.totalStudents,
      tuntas: v.tuntas,
      belumTuntas: v.totalStudents - v.tuntas,
      persen: v.totalStudents > 0 ? Math.round((v.tuntas / v.totalStudents) * 100) : 0,
    }))
    .sort((a, b) => b.persen - a.persen);

  const totalPenilaian = rows.reduce((acc, r) => acc + r.total, 0);
  const totalTuntas = rows.reduce((acc, r) => acc + r.tuntas, 0);
  const overallPct = totalPenilaian > 0 ? Math.round((totalTuntas / totalPenilaian) * 100) : 0;

  const queryString = new URLSearchParams({
    ...(tahunAjaranId ? { tahunAjaranId } : {}),
  }).toString();
  const exportBase = `/api/admin/manajemen-akademik/laporan/ketuntasan-kkm?${queryString}`;

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
          <h1 className="text-2xl font-semibold">C5 — Ketuntasan Belajar (KKM)</h1>
          <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
            Prioritas Sedang
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Persentase siswa yang mencapai KKM ({KKM}) per mata pelajaran.
        </p>
      </div>

      <LaporanFilters
        basePath="/admin/manajemen-akademik/laporan/ketuntasan-kkm"
        tahunAjaranOptions={tahunAjaranList.map((t) => ({
          value: t.id,
          label: t.label + (t.isActive ? " (Aktif)" : ""),
        }))}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Mata Pelajaran</CardDescription>
            <CardTitle className="text-3xl">{rows.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Penilaian</CardDescription>
            <CardTitle className="text-3xl">{totalPenilaian}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>% Tuntas Keseluruhan</CardDescription>
            <CardTitle
              className={`text-3xl ${
                overallPct >= 75 ? "text-emerald-700" : overallPct >= 50 ? "text-amber-700" : "text-red-700"
              }`}
            >
              {overallPct}%
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Persentase Ketuntasan per Mata Pelajaran</CardTitle>
            <CardDescription>Diurutkan dari yang paling tuntas</CardDescription>
          </div>
          <ExportButtons
            excelUrl={`${exportBase}&format=excel`}
            pdfUrl={`${exportBase}&format=pdf`}
          />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {rows.map((r, idx) => (
              <div
                key={r.name}
                className="flex items-center gap-4 rounded-lg border p-3 hover:bg-muted/20"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {idx + 1}
                </span>
                <CheckCircle2
                  className={`h-4 w-4 ${r.persen >= 75 ? "text-emerald-600" : "text-amber-600"}`}
                />
                <div className="flex-1">
                  <p className="font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.tuntas} dari {r.total} penilaian tuntas
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full ${
                        r.persen >= 75 ? "bg-emerald-500" : r.persen >= 50 ? "bg-amber-500" : "bg-red-500"
                      }`}
                      style={{ width: `${r.persen}%` }}
                    />
                  </div>
                  <Badge
                    variant={
                      r.persen >= 75 ? "default" : r.persen >= 50 ? "secondary" : "destructive"
                    }
                    className="w-14 justify-center"
                  >
                    {r.persen}%
                  </Badge>
                </div>
              </div>
            ))}
            {rows.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Belum ada data nilai.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
