import Link from "next/link";
import { ChevronLeft, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LaporanFilters } from "../_components/LaporanFilters";
import { ExportButtons } from "../_components/ExportButtons";

interface SearchParams {
  tahunAjaranId?: string;
  rombelId?: string;
  day?: string;
}

const DAYS = [
  { value: "MONDAY", label: "Senin" },
  { value: "TUESDAY", label: "Selasa" },
  { value: "WEDNESDAY", label: "Rabu" },
  { value: "THURSDAY", label: "Kamis" },
  { value: "FRIDAY", label: "Jumat" },
  { value: "SATURDAY", label: "Sabtu" },
];

export const dynamic = "force-dynamic";

function formatTime(d: Date | null): string {
  if (!d) return "";
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

export default async function JadwalPelajaranPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const { tahunAjaranId, rombelId, day } = await props.searchParams;

  const activeTahunAjaran = await prisma.tahunAjaran.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
  const effectiveTahunAjaranId = tahunAjaranId ?? activeTahunAjaran?.id;

  const [tahunAjaranList, rombelList, schedules] = await Promise.all([
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
    prisma.classSchedule.findMany({
      where: {
        deleted_at: null,
        ...(day
          ? {
              day: day as
                | "MONDAY"
                | "TUESDAY"
                | "WEDNESDAY"
                | "THURSDAY"
                | "FRIDAY"
                | "SATURDAY"
                | "SUNDAY",
            }
          : {}),
        ...(rombelId
          ? { rombel_id: BigInt(rombelId), rombel: { tahunAjaranId: effectiveTahunAjaranId ?? "" } }
          : effectiveTahunAjaranId
            ? {
                OR: [
                  { rombel: { tahunAjaranId: effectiveTahunAjaranId } },
                  { rombel_id: null },
                ],
              }
            : {}),
      },
          include: {
            class: { select: { name: true } },
            rombel: { select: { name: true } },
            teacherSubject: {
              include: {
                teacher: { select: { id: true, name: true, nip: true } },
                subject: { select: { name: true } },
              },
            },
          },
      orderBy: [{ day: "asc" }, { period: "asc" }, { start_time: "asc" }],
      take: 1000,
    }),
  ]);

  // Conflict detection
  const seenKeys = new Map<string, number>();
  const conflictKeys = new Set<string>();
  for (const s of schedules) {
    const staffId = s.teacherSubject?.teacher?.id ?? "unknown";
    const key = `${staffId}|${s.day}|${s.period ?? ""}`;
    const count = (seenKeys.get(key) ?? 0) + 1;
    seenKeys.set(key, count);
    if (count > 1) conflictKeys.add(key);
  }

  // Group by day
  const groupedByDay = DAYS.map((d) => ({
    day: d.value,
    label: d.label,
    items: schedules.filter((s) => s.day === d.value),
  }));

  const totalSlots = schedules.length;
  const uniqueTeachers = new Set(schedules.map((s) => s.teacherSubject?.teacher?.id)).size;
  const uniqueRombels = new Set(schedules.map((s) => s.rombel_id).filter(Boolean)).size;

  const queryString = new URLSearchParams({
    ...(effectiveTahunAjaranId ? { tahunAjaranId: effectiveTahunAjaranId } : {}),
    ...(rombelId ? { rombelId } : {}),
    ...(day ? { day } : {}),
  }).toString();

  const exportBase = `/api/admin/manajemen-akademik/laporan/jadwal?${queryString}`;

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
          <h1 className="text-2xl font-semibold">B1 — Jadwal Pelajaran</h1>
          <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
            Prioritas Tinggi
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Jadwal mingguan per rombel dengan deteksi konflik otomatis.
        </p>
      </div>

      {conflictKeys.size > 0 && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-yellow-900">
              <AlertTriangle className="h-4 w-4" />
              {conflictKeys.size} potensi konflik jadwal terdeteksi
            </CardTitle>
            <CardDescription className="text-yellow-800">
              Guru yang sama memiliki lebih dari satu jadwal pada hari & jam yang sama. Baris yang
              konflik ditandai di tabel.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <LaporanFilters
        basePath="/admin/manajemen-akademik/laporan/jadwal"
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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Slot</CardDescription>
            <CardTitle className="text-3xl">{totalSlots}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rombel</CardDescription>
            <CardTitle className="text-3xl">{uniqueRombels}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Guru Terlibat</CardDescription>
            <CardTitle className="text-3xl">{uniqueTeachers}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Konflik</CardDescription>
            <CardTitle className={`text-3xl ${conflictKeys.size > 0 ? "text-yellow-700" : ""}`}>
              {conflictKeys.size}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Daftar Jadwal</CardTitle>
            <CardDescription>
              Klik tombol Export untuk unduh Excel (dengan kolom konflik).
            </CardDescription>
          </div>
          <ExportButtons
            excelUrl={`${exportBase}&format=excel`}
            pdfUrl={`${exportBase}&format=pdf`}
          />
        </CardHeader>
        <CardContent className="space-y-6">
          {groupedByDay.map((group) => (
            <div key={group.day}>
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground">{group.label}</h3>
              {group.items.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Tidak ada jadwal</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40">
                        <th className="px-3 py-2 text-left font-medium">Jam</th>
                        <th className="px-3 py-2 text-left font-medium">Waktu</th>
                        <th className="px-3 py-2 text-left font-medium">Rombel</th>
                        <th className="px-3 py-2 text-left font-medium">Mata Pelajaran</th>
                        <th className="px-3 py-2 text-left font-medium">Guru</th>
                        <th className="px-3 py-2 text-left font-medium">Ruangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.items.map((s) => {
                        const staffId = s.teacherSubject?.teacher?.id ?? "unknown";
                        const hasConflict = conflictKeys.has(
                          `${staffId}|${s.day}|${s.period ?? ""}`
                        );
                        return (
                          <tr
                            key={s.id.toString()}
                            className={`border-b last:border-b-0 ${
                              hasConflict ? "bg-yellow-50" : "hover:bg-muted/20"
                            }`}
                          >
                            <td className="px-3 py-2 font-medium">{s.period ?? "-"}</td>
                            <td className="px-3 py-2 text-xs">
                              {formatTime(s.start_time)} - {formatTime(s.end_time)}
                            </td>
                            <td className="px-3 py-2">{s.rombel?.name ?? "-"}</td>
                            <td className="px-3 py-2">{s.teacherSubject?.subject?.name ?? "-"}</td>
                            <td className="px-3 py-2">
                              <span className="flex items-center gap-2">
                                {s.teacherSubject?.teacher?.name ?? "-"}
                                {hasConflict && (
                                  <AlertTriangle className="h-3.5 w-3.5 text-yellow-700" />
                                )}
                              </span>
                            </td>
                            <td className="px-3 py-2">{s.room ?? "-"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
