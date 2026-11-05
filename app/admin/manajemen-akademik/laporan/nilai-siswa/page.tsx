import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LaporanFilters } from "../_components/LaporanFilters";
import { ExportButtons } from "../_components/ExportButtons";

interface SearchParams {
  tahunAjaranId?: string;
  rombelId?: string;
}

export const dynamic = "force-dynamic";

export default async function NilaiSiswaPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const { tahunAjaranId, rombelId } = await props.searchParams;

  const activeTahunAjaran = await prisma.tahunAjaran.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
  const effectiveTahunAjaranId = tahunAjaranId ?? activeTahunAjaran?.id;

  const [tahunAjaranList, rombelList] = await Promise.all([
    prisma.tahunAjaran.findMany({
      where: { deleted_at: null },
      orderBy: { startDate: "desc" },
      select: { id: true, label: true, isActive: true },
    }),
    effectiveTahunAjaranId
      ? prisma.rombel.findMany({
          where: { deleted_at: null, tahunAjaranId: effectiveTahunAjaranId },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
  ]);

  const queryString = new URLSearchParams({
    ...(effectiveTahunAjaranId ? { tahunAjaranId: effectiveTahunAjaranId } : {}),
    ...(rombelId ? { rombelId } : {}),
  }).toString();
  const exportBase = `/api/admin/manajemen-akademik/laporan/nilai-siswa?${queryString}`;

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
          <h1 className="text-2xl font-semibold">C1 — Nilai Per Siswa</h1>
          <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
            Prioritas Tinggi
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Pilih rombel untuk rekap nilai per siswa, atau gunakan API transkrip dengan parameter
          <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs">studentId</code> untuk nilai
          individual.
        </p>
      </div>

      <LaporanFilters
        basePath="/admin/manajemen-akademik/laporan/nilai-siswa"
        tahunAjaranOptions={tahunAjaranList.map((t) => ({
          value: t.id,
          label: t.label + (t.isActive ? " (Aktif)" : ""),
        }))}
        rombelOptions={rombelList.map((r) => ({
          value: String(r.id),
          label: r.name,
        }))}
        showRombel
      />

      {!rombelId && (
        <Card>
          <CardHeader>
            <CardTitle>Pilih Rombel</CardTitle>
            <CardDescription>
              Silakan pilih rombel pada filter di atas untuk menampilkan rekap nilai siswa. Export
              akan menghasilkan daftar nilai rata-rata per siswa dalam rombel tersebut.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Belum ada rombel dipilih. Atau gunakan API untuk siswa tertentu dengan menambahkan
              parameter <code className="rounded bg-muted px-1 py-0.5 text-xs">studentId</code>.
            </p>
          </CardContent>
        </Card>
      )}

      {rombelId && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Rekap Nilai Rombel</CardTitle>
              <CardDescription>
                Daftar siswa dengan nilai rata-rata tertimbang per mata pelajaran.
              </CardDescription>
            </div>
            <ExportButtons
              excelUrl={`${exportBase}&format=excel`}
              pdfUrl={`${exportBase}&format=pdf`}
            />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Klik <strong>Export Excel / PDF</strong> untuk mengunduh rekap nilai rombel ini.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
