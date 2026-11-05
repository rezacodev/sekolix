import Link from "next/link";
import { ChevronLeft, Building2, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportButtons } from "../_components/ExportButtons";

export const dynamic = "force-dynamic";

const DAY_LABEL: Record<string, string> = {
  MONDAY: "Senin",
  TUESDAY: "Selasa",
  WEDNESDAY: "Rabu",
  THURSDAY: "Kamis",
  FRIDAY: "Jumat",
  SATURDAY: "Sabtu",
};

export default async function RuangJamPage() {
  const [rooms, lessonTimes] = await Promise.all([
    prisma.room.findMany({
      where: { deleted_at: null },
      orderBy: [{ building: "asc" }, { name: "asc" }],
    }),
    prisma.lessonTime.findMany({
      where: { is_active: true },
      orderBy: [{ day: "asc" }, { session: "asc" }],
    }),
  ]);

  const lessonsByDay = new Map<string, typeof lessonTimes>();
  for (const l of lessonTimes) {
    if (!lessonsByDay.has(l.day)) lessonsByDay.set(l.day, []);
    lessonsByDay.get(l.day)!.push(l);
  }

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
          <h1 className="text-2xl font-semibold">A5 — Ruang & Jam Pelajaran</h1>
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
            Prioritas Rendah
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Daftar ruang kelas dan slot jam pelajaran aktif.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Daftar Ruang
              </CardTitle>
              <CardDescription>{rooms.length} ruang terdaftar</CardDescription>
            </div>
            <ExportButtons
              excelUrl="/api/admin/manajemen-akademik/laporan/ruang-jam?format=excel"
              pdfUrl="/api/admin/manajemen-akademik/laporan/ruang-jam?format=pdf"
            />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {rooms.map((r) => (
                <div key={String(r.id)} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{r.name}</p>
                    {r.code && <Badge variant="outline">{r.code}</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {r.building ? `${r.building} • ` : ""}
                    {r.floor ? `Lantai ${r.floor} • ` : ""}
                    Kapasitas: {r.capacity ?? "-"}
                  </p>
                </div>
              ))}
              {rooms.length === 0 && (
                <p className="col-span-2 py-6 text-center text-sm text-muted-foreground">
                  Belum ada data ruang.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Slot Jam Pelajaran
            </CardTitle>
            <CardDescription>Jam aktif per hari</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from(lessonsByDay.entries()).map(([day, items]) => (
              <div key={day}>
                <p className="mb-2 text-sm font-semibold">{DAY_LABEL[day] ?? day}</p>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                  {items.map((l) => (
                    <div
                      key={String(l.id)}
                      className={`rounded p-2 text-xs ${
                        l.is_break ? "bg-amber-50 text-amber-900" : "bg-muted"
                      }`}
                    >
                      <p className="font-mono">
                        {l.start_time} - {l.end_time}
                      </p>
                      <p className="text-[10px]">
                        {l.is_break ? l.break_label ?? "Istirahat" : `Jam ke-${l.session}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
