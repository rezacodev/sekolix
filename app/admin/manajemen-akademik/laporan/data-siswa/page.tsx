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
  gender?: string;
  status?: string;
}

export const dynamic = "force-dynamic";

export default async function DataSiswaAktifPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  const { tahunAjaranId, rombelId, gender, status } = searchParams;

  const activeTahunAjaran = await prisma.tahunAjaran.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
  const effectiveTahunAjaranId = tahunAjaranId ?? activeTahunAjaran?.id;

  const [tahunAjaranList, rombelList, siswaList] = await Promise.all([
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
    prisma.pesertaDidik.findMany({
      where: {
        status: (status ?? "accepted") as "pending" | "review" | "accepted" | "rejected",
        ...(gender ? { gender } : {}),
        ...(rombelId
          ? { rombels: { some: { id: BigInt(rombelId), deleted_at: null } } }
          : {}),
      },
      include: {
        program: { select: { name: true } },
        rombels: {
          where: { deleted_at: null },
          select: {
            name: true,
            class: { select: { name: true } },
            program: { select: { name: true } },
            tahunAjaran: { select: { label: true } },
          },
        },
      },
      orderBy: [{ fullName: "asc" }],
      take: 500,
    }),
  ]);

  const queryString = new URLSearchParams({
    ...(effectiveTahunAjaranId ? { tahunAjaranId: effectiveTahunAjaranId } : {}),
    ...(rombelId ? { rombelId } : {}),
    ...(gender ? { gender } : {}),
    ...(status ? { status } : {}),
  }).toString();

  const exportBase = `/api/admin/manajemen-akademik/laporan/data-siswa?${queryString}`;

  // Summary stats
  const totalSiswa = siswaList.length;
  const lakiLaki = siswaList.filter((s) => s.gender === "L").length;
  const perempuan = siswaList.filter((s) => s.gender === "P").length;

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
          <h1 className="text-2xl font-semibold">A1 — Data Siswa Aktif</h1>
          <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
            Prioritas Tinggi
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Daftar siswa aktif dengan filter tahun ajaran, rombel, jenis kelamin, dan status pendaftaran.
        </p>
      </div>

      <LaporanFilters
        basePath="/admin/manajemen-akademik/laporan/data-siswa"
        tahunAjaranOptions={tahunAjaranList.map((t) => ({
          value: t.id,
          label: t.label + (t.isActive ? " (Aktif)" : ""),
        }))}
        rombelOptions={rombelList.map((r) => ({
          value: String(r.id),
          label: r.name,
        }))}
        showRombel
        showGender
        showStatus
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Siswa</CardDescription>
            <CardTitle className="text-3xl">{totalSiswa}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Laki-laki</CardDescription>
            <CardTitle className="text-3xl">{lakiLaki}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Perempuan</CardDescription>
            <CardTitle className="text-3xl">{perempuan}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Daftar Siswa</CardTitle>
            <CardDescription>
              {totalSiswa === 500
                ? "Menampilkan 500 siswa pertama. Gunakan filter untuk mempersempit data."
                : `Menampilkan ${totalSiswa} siswa.`}
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
                  <th className="px-3 py-2 text-left font-medium">NISN</th>
                  <th className="px-3 py-2 text-left font-medium">Nama Lengkap</th>
                  <th className="px-3 py-2 text-left font-medium">L/P</th>
                  <th className="px-3 py-2 text-left font-medium">Rombel</th>
                  <th className="px-3 py-2 text-left font-medium">Program</th>
                </tr>
              </thead>
              <tbody>
                {siswaList.map((s, idx) => (
                  <tr key={s.id} className="border-b hover:bg-muted/20">
                    <td className="px-3 py-2">{idx + 1}</td>
                    <td className="px-3 py-2 font-mono text-xs">{s.nisn ?? "-"}</td>
                    <td className="px-3 py-2 font-medium">{s.fullName}</td>
                    <td className="px-3 py-2">{s.gender ?? "-"}</td>
                    <td className="px-3 py-2">{s.rombels[0]?.name ?? "-"}</td>
                    <td className="px-3 py-2">
                      {s.rombels[0]?.program?.name ?? s.program?.name ?? "-"}
                    </td>
                  </tr>
                ))}
                {siswaList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                      Tidak ada data siswa untuk filter ini.
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
