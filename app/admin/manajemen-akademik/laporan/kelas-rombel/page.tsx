import Link from "next/link";
import { ChevronLeft, School } from "lucide-react";
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

export default async function KelasRombelPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const { tahunAjaranId } = await props.searchParams;

  const activeTA = await prisma.tahunAjaran.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
  const effectiveTAId = tahunAjaranId ?? activeTA?.id;

  const [tahunAjaranList, rombels] = await Promise.all([
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
          orderBy: [{ class: { name: "asc" } }, { name: "asc" }],
        })
      : Promise.resolve([]),
  ]);

  // Look up wali kelas tidak tersedia (field homeroom_teacher_id belum ada di Class)

  const totalKelas = new Set(rombels.map((r) => r.class_id)).size;
  const totalSiswa = rombels.reduce((acc, r) => acc + r.student_count, 0);

  const queryString = new URLSearchParams({
    ...(effectiveTAId ? { tahunAjaranId: effectiveTAId } : {}),
  }).toString();
  const exportBase = `/api/admin/manajemen-akademik/laporan/kelas-rombel?${queryString}`;

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
          <h1 className="text-2xl font-semibold">A4 — Kelas & Rombongan Belajar</h1>
          <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
            Prioritas Sedang
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Daftar rombel per tahun ajaran dengan kapasitas, jumlah siswa, dan wali kelas.
        </p>
      </div>

      <LaporanFilters
        basePath="/admin/manajemen-akademik/laporan/kelas-rombel"
        tahunAjaranOptions={tahunAjaranList.map((t) => ({
          value: t.id,
          label: t.label + (t.isActive ? " (Aktif)" : ""),
        }))}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Kelas</CardDescription>
            <CardTitle className="text-3xl">{totalKelas}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Rombel</CardDescription>
            <CardTitle className="text-3xl">{rombels.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Siswa</CardDescription>
            <CardTitle className="text-3xl">{totalSiswa}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Daftar Kelas & Rombel</CardTitle>
            <CardDescription>
              {rombels.length} rombel terdaftar
            </CardDescription>
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
                  <th className="px-3 py-2 text-left font-medium">Siswa/Kap</th>
                  <th className="px-3 py-2 text-left font-medium">Wali Kelas</th>
                </tr>
              </thead>
              <tbody>
                {rombels.map((r, idx) => (
                  <tr key={String(r.id)} className="border-b hover:bg-muted/20">
                    <td className="px-3 py-2">{idx + 1}</td>
                    <td className="px-3 py-2 font-medium">
                      <span className="flex items-center gap-2">
                        <School className="h-3.5 w-3.5 text-muted-foreground" />
                        {r.name}
                      </span>
                    </td>
                    <td className="px-3 py-2">{r.class.name}</td>
                    <td className="px-3 py-2">{r.program?.name ?? "-"}</td>
                    <td className="px-3 py-2">
                      {r.student_count} / {r.capacity ?? "-"}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">-</td>
                  </tr>
                ))}
                {rombels.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                      Tidak ada data rombel untuk tahun ajaran ini.
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
