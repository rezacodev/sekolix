import Link from "next/link";
import { ChevronLeft, ClipboardList } from "lucide-react";
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

export default async function NilaiKelasPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const { tahunAjaranId } = await props.searchParams;

  const activeTA = await prisma.tahunAjaran.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
  const effectiveTAId = tahunAjaranId ?? activeTA?.id;

  const [tahunAjaranList, rombels, students] = await Promise.all([
    prisma.tahunAjaran.findMany({
      where: { deleted_at: null },
      orderBy: { startDate: "desc" },
      select: { id: true, label: true, isActive: true },
    }),
    effectiveTAId
      ? prisma.rombel.findMany({
          where: { deleted_at: null, tahunAjaranId: effectiveTAId },
          include: {
            class: { select: { name: true } },
            program: { select: { name: true } },
          },
        })
      : Promise.resolve([]),
    effectiveTAId
      ? prisma.pesertaDidik.findMany({
          where: {
            status: "accepted",
            rombels: { some: { tahunAjaranId: effectiveTAId, deleted_at: null } },
          },
          select: {
            id: true,
            fullName: true,
            rombels: {
              where: { deleted_at: null, tahunAjaranId: effectiveTAId },
              select: { id: true },
            },
            grades: {
              where: { deleted_at: null },
              select: {
                score: true,
                assessment: { select: { max_score: true, weight: true } },
              },
            },
          },
        })
      : Promise.resolve([]),
  ]);

  // Aggregate per rombel
  const aggregates = new Map<
    string,
    {
      name: string;
      kelas: string;
      program: string;
      avgs: number[];
    }
  >();
  for (const r of rombels) {
    aggregates.set(String(r.id), {
      name: r.name,
      kelas: r.class.name,
      program: r.program?.name ?? "-",
      avgs: [],
    });
  }
  for (const s of students) {
    let w = 0;
    let ws = 0;
    for (const g of s.grades) {
      const max = Number(g.assessment.max_score ?? 100);
      const norm = max > 0 ? (Number(g.score) / max) * 100 : Number(g.score);
      w += norm * (g.assessment.weight || 1);
      ws += g.assessment.weight || 1;
    }
    const avg = ws > 0 ? w / ws : 0;
    for (const r of s.rombels) {
      const e = aggregates.get(String(r.id));
      if (e) e.avgs.push(avg);
    }
  }

  const rows = Array.from(aggregates.values())
    .map((v) => {
      const total = v.avgs.length;
      const rata = total > 0 ? v.avgs.reduce((a, b) => a + b, 0) / total : 0;
      const lulus = v.avgs.filter((a) => a >= KKM).length;
      return {
        name: v.name,
        kelas: v.kelas,
        program: v.program,
        jumlahSiswa: total,
        rataRata: Math.round(rata * 100) / 100,
        lulus: total > 0 ? Math.round((lulus / total) * 100) : 0,
      };
    })
    .sort((a, b) => b.rataRata - a.rataRata);

  const totalSiswa = rows.reduce((acc, r) => acc + r.jumlahSiswa, 0);
  const totalLulus = rows.reduce((acc, r) => acc + Math.round((r.lulus / 100) * r.jumlahSiswa), 0);

  const queryString = new URLSearchParams({
    ...(effectiveTAId ? { tahunAjaranId: effectiveTAId } : {}),
  }).toString();
  const exportBase = `/api/admin/manajemen-akademik/laporan/nilai-kelas?${queryString}`;

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
          <h1 className="text-2xl font-semibold">C2 — Nilai Per Kelas/Rombel</h1>
          <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
            Prioritas Sedang
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Rekap nilai rata-rata per rombel (KKM = {KKM}). Diurutkan dari rata-rata tertinggi.
        </p>
      </div>

      <LaporanFilters
        basePath="/admin/manajemen-akademik/laporan/nilai-kelas"
        tahunAjaranOptions={tahunAjaranList.map((t) => ({
          value: t.id,
          label: t.label + (t.isActive ? " (Aktif)" : ""),
        }))}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Rombel</CardDescription>
            <CardTitle className="text-3xl">{rows.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Siswa</CardDescription>
            <CardTitle className="text-3xl">{totalSiswa}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>% Lulus KKM</CardDescription>
            <CardTitle className="text-3xl">
              {totalSiswa > 0 ? Math.round((totalLulus / totalSiswa) * 100) : 0}%
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Rekap Per Rombel</CardTitle>
            <CardDescription>Rata-rata dihitung dari seluruh nilai siswa di rombel</CardDescription>
          </div>
          <ExportButtons
            excelUrl={`${exportBase}&format=excel`}
            pdfUrl={`${exportBase}&format=pdf`}
          />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-3 py-2 text-left font-medium">No</th>
                  <th className="px-3 py-2 text-left font-medium">Rombel</th>
                  <th className="px-3 py-2 text-left font-medium">Program</th>
                  <th className="px-3 py-2 text-right font-medium">Siswa</th>
                  <th className="px-3 py-2 text-right font-medium">Rata-rata</th>
                  <th className="px-3 py-2 text-right font-medium">% ≥ KKM</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={r.name} className="border-b hover:bg-muted/20">
                    <td className="px-3 py-2">{idx + 1}</td>
                    <td className="px-3 py-2 font-medium">
                      <span className="flex items-center gap-2">
                        <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />
                        {r.name}
                      </span>
                    </td>
                    <td className="px-3 py-2">{r.program}</td>
                    <td className="px-3 py-2 text-right">{r.jumlahSiswa}</td>
                    <td className="px-3 py-2 text-right font-mono">{r.rataRata.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right">
                      <Badge
                        variant={r.lulus >= 75 ? "default" : r.lulus >= 50 ? "secondary" : "destructive"}
                      >
                        {r.lulus}%
                      </Badge>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                      Belum ada data nilai.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
