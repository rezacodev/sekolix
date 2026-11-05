import Link from "next/link";
import { ChevronLeft, Briefcase } from "lucide-react";
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

export default async function BebanMengajarPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const { tahunAjaranId } = await props.searchParams;

  const activeTA = await prisma.tahunAjaran.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
  const effectiveTAId = tahunAjaranId ?? activeTA?.id;

  const [tahunAjaranList, schedules] = await Promise.all([
    prisma.tahunAjaran.findMany({
      where: { deleted_at: null },
      orderBy: { startDate: "desc" },
      select: { id: true, label: true, isActive: true },
    }),
    effectiveTAId
      ? prisma.classSchedule.findMany({
          where: {
            deleted_at: null,
            OR: [
              { rombel: { tahunAjaranId: effectiveTAId } },
              { rombel_id: null },
            ],
          },
          include: {
            teacherSubject: {
              include: {
                teacher: { select: { id: true, name: true, nip: true } },
                subject: { select: { name: true } },
              },
            },
          },
        })
      : Promise.resolve([]),
  ]);

  // Aggregate
  const byTeacher = new Map<
    string,
    { nama: string; nip: string; mapels: Set<string>; rombelIds: Set<bigint>; total: number }
  >();
  for (const s of schedules) {
    const t = s.teacherSubject?.teacher;
    if (!t) continue;
    const entry =
      byTeacher.get(t.id) ??
      { nama: t.name, nip: t.nip ?? "", mapels: new Set(), rombelIds: new Set(), total: 0 };
    if (s.teacherSubject?.subject?.name) entry.mapels.add(s.teacherSubject.subject.name);
    if (s.rombel_id) entry.rombelIds.add(s.rombel_id);
    entry.total += 1;
    byTeacher.set(t.id, entry);
  }

  const rows = Array.from(byTeacher.values())
    .map((v) => ({
      nama: v.nama,
      nip: v.nip,
      mapelCount: v.mapels.size,
      rombelCount: v.rombelIds.size,
      totalSlot: v.total,
      mapelList: Array.from(v.mapels).join(", "),
    }))
    .sort((a, b) => b.totalSlot - a.totalSlot);

  const totalGuru = rows.length;
  const rataSlot = totalGuru > 0 ? Math.round(rows.reduce((acc, r) => acc + r.totalSlot, 0) / totalGuru) : 0;

  const queryString = new URLSearchParams({
    ...(effectiveTAId ? { tahunAjaranId: effectiveTAId } : {}),
  }).toString();
  const exportBase = `/api/admin/manajemen-akademik/laporan/beban-mengajar?${queryString}`;

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
          <h1 className="text-2xl font-semibold">B2 — Beban Mengajar Guru</h1>
          <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
            Prioritas Sedang
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Rekap jumlah slot mengajar per guru per minggu.
        </p>
      </div>

      <LaporanFilters
        basePath="/admin/manajemen-akademik/laporan/beban-mengajar"
        tahunAjaranOptions={tahunAjaranList.map((t) => ({
          value: t.id,
          label: t.label + (t.isActive ? " (Aktif)" : ""),
        }))}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Guru Mengajar</CardDescription>
            <CardTitle className="text-3xl">{totalGuru}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rata-rata Slot/Minggu</CardDescription>
            <CardTitle className="text-3xl">{rataSlot}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Slot</CardDescription>
            <CardTitle className="text-3xl">{schedules.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Beban Mengajar per Guru</CardTitle>
            <CardDescription>Diurutkan dari beban tertinggi</CardDescription>
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
                  <th className="px-3 py-2 text-left font-medium">Nama</th>
                  <th className="px-3 py-2 text-left font-medium">NIP</th>
                  <th className="px-3 py-2 text-right font-medium">Slot</th>
                  <th className="px-3 py-2 text-right font-medium">Mapel</th>
                  <th className="px-3 py-2 text-right font-medium">Rombel</th>
                  <th className="px-3 py-2 text-left font-medium">Daftar Mapel</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={r.nip + idx} className="border-b hover:bg-muted/20">
                    <td className="px-3 py-2">{idx + 1}</td>
                    <td className="px-3 py-2 font-medium">
                      <span className="flex items-center gap-2">
                        <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                        {r.nama}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{r.nip || "-"}</td>
                    <td className="px-3 py-2 text-right font-mono">{r.totalSlot}</td>
                    <td className="px-3 py-2 text-right">{r.mapelCount}</td>
                    <td className="px-3 py-2 text-right">{r.rombelCount}</td>
                    <td className="px-3 py-2 text-xs">{r.mapelList}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">
                      Belum ada jadwal mengajar untuk tahun ajaran ini.
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
