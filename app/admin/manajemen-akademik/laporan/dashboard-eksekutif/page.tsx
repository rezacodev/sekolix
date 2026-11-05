import Link from "next/link";
import {
  ChevronLeft,
  Users,
  GraduationCap,
  School,
  TrendingUp,
  UserCheck,
  BookOpen,
  Calendar,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  SiswaPerTahunChart,
  GenderDistributionChart,
  TopStudentsChart,
} from "./_components/Charts";

export const dynamic = "force-dynamic";

export default async function DashboardEksekutifPage() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Parallel queries
  const [
    activeTahunAjaran,
    totalStudentsActive,
    totalGtk,
    totalRombel,
    genderBreakdown,
    studentCountByYear,
    topStudents,
    rataRataPerMapel,
    recentAbsensi,
    totalPengumuman,
  ] = await Promise.all([
    prisma.tahunAjaran.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      select: { id: true, label: true },
    }),
    prisma.pesertaDidik.count({ where: { status: "accepted" } }),
    prisma.staff.count({ where: { isActive: true, isVisible: true } }),
    prisma.rombel.count({ where: { deleted_at: null } }),
    prisma.pesertaDidik.groupBy({
      by: ["gender"],
      where: { status: "accepted" },
      _count: { _all: true },
    }),
    // Group by entryYearId (tahun ajaran masuk siswa)
    prisma.tahunAjaran.findMany({
      where: { deleted_at: null },
      orderBy: { startDate: "asc" },
      select: {
        id: true,
        label: true,
        _count: { select: { pesertaDidik: true } },
      },
    }),
    // Top 10 siswa by average grade
    prisma.pesertaDidik
      .findMany({
        where: { status: "accepted", grades: { some: {} } },
        take: 20,
        include: {
          grades: {
            where: { deleted_at: null },
            select: {
              score: true,
              assessment: {
                select: { max_score: true, weight: true },
              },
            },
          },
          rombels: { where: { deleted_at: null }, select: { name: true } },
        },
      })
      .then((students) =>
        students
          .map((s) => {
            let weightedSum = 0;
            let weightSum = 0;
            for (const g of s.grades) {
              const max = Number(g.assessment.max_score ?? 100);
              const score = Number(g.score);
              const norm = max > 0 ? (score / max) * 100 : score;
              weightedSum += norm * (g.assessment.weight || 1);
              weightSum += g.assessment.weight || 1;
            }
            const avg = weightSum > 0 ? weightedSum / weightSum : 0;
            return {
              id: s.id,
              nama: s.fullName,
              rombel: s.rombels[0]?.name ?? "-",
              rataRata: Math.round(avg * 100) / 100,
            };
          })
          .sort((a, b) => b.rataRata - a.rataRata)
          .slice(0, 10)
      ),
    // Rata-rata per mata pelajaran (top 8)
    prisma.assessment
      .findMany({
        where: { deleted_at: null },
        include: {
          subject: { select: { name: true } },
          grades: { where: { deleted_at: null }, select: { score: true } },
        },
      })
      .then((assessments) => {
        const bySubject = new Map<
          string,
          { name: string; total: number; count: number }
        >();
        for (const a of assessments) {
          const sid = String(a.subject_id);
          const existing = bySubject.get(sid) ?? { name: a.subject.name, total: 0, count: 0 };
          for (const g of a.grades) {
            const max = Number(a.max_score ?? 100);
            const norm = max > 0 ? (Number(g.score) / max) * 100 : Number(g.score);
            existing.total += norm;
            existing.count += 1;
          }
          bySubject.set(sid, existing);
        }
        return Array.from(bySubject.values())
          .map((v) => ({
            name: v.name,
            rataRata: v.count > 0 ? Math.round((v.total / v.count) * 100) / 100 : 0,
          }))
          .sort((a, b) => b.rataRata - a.rataRata)
          .slice(0, 8);
      }),
    // Recent attendance stats
    prisma.attendance.findMany({
      where: { created_at: { gte: thirtyDaysAgo } },
      select: { status: true },
    }),
    prisma.news.count({ where: { isPublished: true } }),
  ]);

  const lakiLaki = genderBreakdown.find((g) => g.gender === "L")?._count._all ?? 0;
  const perempuan = genderBreakdown.find((g) => g.gender === "P")?._count._all ?? 0;

  // Attendance summary (last 30 days)
  const attendanceTotal = recentAbsensi.length;
  const attendanceHadir = recentAbsensi.filter((a) => a.status === "HADIR").length;
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
          <h1 className="text-2xl font-semibold">E1 — Dashboard Eksekutif</h1>
          <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
            Prioritas Tinggi
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Ringkasan eksekutif real-time untuk kepala sekolah. Data agregat lintas modul akademik.
        </p>
      </div>

      {/* KPI Cards Row 1 */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KPICard
          icon={<Users className="h-5 w-5" />}
          label="Siswa Aktif"
          value={totalStudentsActive}
          accent="bg-blue-50 text-blue-700"
          sublabel={`TA ${activeTahunAjaran?.label ?? "—"}`}
        />
        <KPICard
          icon={<GraduationCap className="h-5 w-5" />}
          label="GTK"
          value={totalGtk}
          accent="bg-emerald-50 text-emerald-700"
          sublabel="Guru & Tenaga Kependidikan"
        />
        <KPICard
          icon={<School className="h-5 w-5" />}
          label="Rombel Aktif"
          value={totalRombel}
          accent="bg-violet-50 text-violet-700"
          sublabel="Kelas & rombongan belajar"
        />
        <KPICard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Kehadiran 30h"
          value={`${attendanceRate}%`}
          accent="bg-amber-50 text-amber-700"
          sublabel={`${attendanceHadir}/${attendanceTotal} records`}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribusi Jenis Kelamin</CardTitle>
            <CardDescription>Siswa aktif terdaftar</CardDescription>
          </CardHeader>
          <CardContent>
            <GenderDistributionChart
              data={[
                { name: "Laki-laki", value: lakiLaki },
                { name: "Perempuan", value: perempuan },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pertumbuhan Siswa per Tahun Ajaran</CardTitle>
            <CardDescription>Akumulasi siswa masuk per tahun ajaran</CardDescription>
          </CardHeader>
          <CardContent>
            <SiswaPerTahunChart
              data={studentCountByYear.map((t) => ({
                label: t.label,
                count: t._count.pesertaDidik,
              }))}
            />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top 10 Siswa — Rata-rata Nilai</CardTitle>
            <CardDescription>Siswa dengan rata-rata nilai tertinggi</CardDescription>
          </CardHeader>
          <CardContent>
            <TopStudentsChart data={topStudents} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rata-rata Nilai per Mata Pelajaran</CardTitle>
            <CardDescription>Top 8 mata pelajaran berdasarkan rata-rata nilai</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {rataRataPerMapel.map((m, idx) => (
                <li key={m.name} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {idx + 1}
                    </span>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{m.name}</span>
                  </div>
                  <Badge variant="outline" className="font-mono">
                    {m.rataRata.toFixed(2)}
                  </Badge>
                </li>
              ))}
              {rataRataPerMapel.length === 0 && (
                <li className="text-center text-sm text-muted-foreground">
                  Belum ada data nilai
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Footer info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4" />
            Ringkasan Sistem
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div>
            <p className="text-muted-foreground">Pengumuman aktif</p>
            <p className="text-lg font-semibold">{totalPengumuman}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Rasio GTK:Siswa</p>
            <p className="text-lg font-semibold">
              1 : {totalGtk > 0 ? Math.round(totalStudentsActive / totalGtk) : 0}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Kapasitas rata-rata/rombel</p>
            <p className="text-lg font-semibold">
              {totalRombel > 0 ? Math.round(totalStudentsActive / totalRombel) : 0} siswa
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Update terakhir</p>
            <p className="text-lg font-semibold">
              {new Date().toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KPICard({
  icon,
  label,
  value,
  accent,
  sublabel,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent: string;
  sublabel?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
            {sublabel && <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>}
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
