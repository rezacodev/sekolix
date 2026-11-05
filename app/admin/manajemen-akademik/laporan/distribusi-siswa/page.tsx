import Link from "next/link";
import { ChevronLeft, PieChart } from "lucide-react";
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

export default async function DistribusiSiswaPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const { tahunAjaranId } = await props.searchParams;

  const activeTA = await prisma.tahunAjaran.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
  const effectiveTAId = tahunAjaranId ?? activeTA?.id;

  const [tahunAjaranList, rombels, genderCounts] = await Promise.all([
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
          orderBy: { student_count: "desc" },
        })
      : Promise.resolve([]),
    effectiveTAId
      ? prisma.pesertaDidik.groupBy({
          by: ["gender"],
          where: {
            status: "accepted",
            rombels: { some: { tahunAjaranId: effectiveTAId, deleted_at: null } },
          },
          _count: { _all: true },
        })
      : Promise.resolve([]),
  ]);

  const totalLaki = genderCounts.find((c) => c.gender === "L")?._count._all ?? 0;
  const totalPerempuan = genderCounts.find((c) => c.gender === "P")?._count._all ?? 0;
  const totalSiswa = totalLaki + totalPerempuan;

  const queryString = new URLSearchParams({
    ...(effectiveTAId ? { tahunAjaranId: effectiveTAId } : {}),
  }).toString();
  const exportBase = `/api/admin/manajemen-akademik/laporan/distribusi-siswa?${queryString}`;

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
          <h1 className="text-2xl font-semibold">B3 — Distribusi Siswa per Kelas</h1>
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
            Prioritas Rendah
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Sebaran jumlah siswa per rombel dan per jenis kelamin.
        </p>
      </div>

      <LaporanFilters
        basePath="/admin/manajemen-akademik/laporan/distribusi-siswa"
        tahunAjaranOptions={tahunAjaranList.map((t) => ({
          value: t.id,
          label: t.label + (t.isActive ? " (Aktif)" : ""),
        }))}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Siswa</CardDescription>
            <CardTitle className="text-3xl">{totalSiswa}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Laki-laki</CardDescription>
            <CardTitle className="text-3xl text-blue-700">{totalLaki}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Perempuan</CardDescription>
            <CardTitle className="text-3xl text-pink-700">{totalPerempuan}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rasio L:P</CardDescription>
            <CardTitle className="text-3xl">
              {totalPerempuan > 0 ? `${Math.round((totalLaki / totalPerempuan) * 100)}:100` : "-"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Sebaran per Rombel
            </CardTitle>
            <CardDescription>Diurutkan dari rombel terbesar</CardDescription>
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
                  <th className="px-3 py-2 text-left font-medium">Kelas</th>
                  <th className="px-3 py-2 text-left font-medium">Program</th>
                  <th className="px-3 py-2 text-right font-medium">Siswa</th>
                  <th className="px-3 py-2 text-right font-medium">Kapasitas</th>
                  <th className="px-3 py-2 text-left font-medium">% Kapasitas</th>
                </tr>
              </thead>
              <tbody>
                {rombels.map((r, idx) => {
                  const pct = r.capacity ? Math.round((r.student_count / r.capacity) * 100) : 0;
                  return (
                    <tr key={String(r.id)} className="border-b hover:bg-muted/20">
                      <td className="px-3 py-2">{idx + 1}</td>
                      <td className="px-3 py-2 font-medium">{r.name}</td>
                      <td className="px-3 py-2">{r.class.name}</td>
                      <td className="px-3 py-2">{r.program?.name ?? "-"}</td>
                      <td className="px-3 py-2 text-right font-mono">{r.student_count}</td>
                      <td className="px-3 py-2 text-right">{r.capacity ?? "-"}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                            <div
                              className={`h-full ${
                                pct >= 90
                                  ? "bg-red-500"
                                  : pct >= 70
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                              }`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {rombels.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">
                      Belum ada data rombel.
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
