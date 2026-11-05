import Link from "next/link";
import { ChevronLeft, Calendar } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function LaporanTahunanPage() {
  const activeYear = await prisma.tahunAjaran.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, label: true, startDate: true, endDate: true },
  });

  const [
    studentCount,
    gtkCount,
    rombelCount,
    mapelCount,
    gradeCount,
    attendanceTotal,
    attendanceHadir,
    mutationCount,
    newsCount,
  ] = await Promise.all([
    prisma.pesertaDidik.count({ where: { status: "accepted" } }),
    prisma.staff.count({ where: { isActive: true, isVisible: true } }),
    prisma.rombel.count({ where: { deleted_at: null } }),
    prisma.subject.count({ where: { deleted_at: null } }),
    prisma.grade.count({ where: { deleted_at: null } }),
    prisma.attendance.count(),
    prisma.attendance.count({ where: { status: "HADIR" } }),
    prisma.transfer.count(),
    prisma.news.count({ where: { isPublished: true } }),
  ]);

  const attendanceRate =
    attendanceTotal > 0 ? Math.round((attendanceHadir / attendanceTotal) * 100) : 0;

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
          <h1 className="text-2xl font-semibold">E2 — Laporan Tahunan Akademik</h1>
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
            Prioritas Rendah
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Rekap komprehensif satu tahun ajaran: siswa, GTK, nilai, kehadiran, mutasi.
        </p>
      </div>

      {activeYear && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Tahun Ajaran Aktif: {activeYear.label}
            </CardTitle>
            <CardDescription>
              {activeYear.startDate && activeYear.endDate && (
                <>
                  {new Date(activeYear.startDate).toLocaleDateString("id-ID")} —{" "}
                  {new Date(activeYear.endDate).toLocaleDateString("id-ID")}
                </>
              )}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Siswa Aktif" value={studentCount} />
        <StatCard label="GTK" value={gtkCount} />
        <StatCard label="Rombel" value={rombelCount} />
        <StatCard label="Mata Pelajaran" value={mapelCount} />
        <StatCard label="Total Penilaian" value={gradeCount} />
        <StatCard label="Mutasi Siswa" value={mutationCount} />
        <StatCard label="Pengumuman" value={newsCount} />
        <StatCard
          label="Tingkat Kehadiran"
          value={`${attendanceRate}%`}
          accent={attendanceRate >= 80 ? "text-emerald-700" : attendanceRate >= 60 ? "text-amber-700" : "text-red-700"}
        />
        <StatCard label="Hadir / Total" value={`${attendanceHadir}/${attendanceTotal}`} />
        <StatCard
          label="Rasio GTK:Siswa"
          value={gtkCount > 0 ? `1:${Math.round(studentCount / gtkCount)}` : "-"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Akhir Tahun</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <ul className="space-y-2 text-sm">
            <li>
              Total <strong>{studentCount}</strong> siswa aktif terdaftar pada{" "}
              <strong>{rombelCount}</strong> rombel.
            </li>
            <li>
              <strong>{gtkCount}</strong> tenaga pendidik dan kependidikan mengelola pembelajaran.
            </li>
            <li>
              Tercatat <strong>{gradeCount}</strong> data penilaian sepanjang tahun ajaran.
            </li>
            <li>
              Tingkat kehadiran siswa rata-rata <strong>{attendanceRate}%</strong>{" "}
              ({attendanceHadir} hadir dari {attendanceTotal} records).
            </li>
            <li>
              <strong>{mutationCount}</strong> mutasi siswa (masuk/pindah/keluar) terjadi.
            </li>
            <li>
              <strong>{newsCount}</strong> pengumuman dipublikasikan.
            </li>
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            Untuk ekspor PDF/Excel lengkap, lihat laporan individu (A1, A2, B1, C1, dst.) di
            menu Pusat Laporan.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className={`text-2xl ${accent ?? ""}`}>{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}
