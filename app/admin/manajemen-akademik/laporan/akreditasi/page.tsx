import Link from "next/link";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function LaporanAkreditasiPage() {
  const [
    studentCount,
    gtkCount,
    guruSertifikasi,
    rombelCount,
    pnsCount,
    kelasAktif,
    kurikulumCount,
    ruangCount,
    kelasIdeal,
    ruangIdeal,
  ] = await Promise.all([
    prisma.pesertaDidik.count({ where: { status: "accepted" } }),
    prisma.staff.count({ where: { isActive: true, isVisible: true, role: "TEACHER" } }),
    prisma.staff.count({
      where: {
        isActive: true,
        isVisible: true,
        role: "TEACHER",
        educatorCertification: { not: "null" as unknown as object },
      },
    }),
    prisma.rombel.count({ where: { deleted_at: null } }),
    prisma.staff.count({ where: { isActive: true, statusKepegawaian: "PNS" } }),
    prisma.rombel.count({
      where: { deleted_at: null, student_count: { gt: 0 } },
    }),
    prisma.curriculum.count({ where: { deleted_at: null } }),
    prisma.room.count({ where: { deleted_at: null } }),
    prisma.rombel.findFirst({
      orderBy: { capacity: "desc" },
      select: { capacity: true },
    }),
    prisma.room.findFirst({
      orderBy: { capacity: "desc" },
      select: { capacity: true },
    }),
  ]);

  const guruTetap = gtkCount; // Guru aktif
  const sertifikasiPct =
    guruTetap > 0 ? Math.round((guruSertifikasi / guruTetap) * 100) : 0;
  const pnsPct = gtkCount > 0 ? Math.round((pnsCount / gtkCount) * 100) : 0;
  const ruangIdealCap = ruangIdeal?.capacity ?? 0;
  const kelasIdealCap = kelasIdeal?.capacity ?? 0;

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
          <h1 className="text-2xl font-semibold">E3 — Laporan Akreditasi</h1>
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
            Prioritas Rendah
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Indikator dan data dukung untuk kebutuhan akreditasi sekolah.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <IndicatorCard
          title="Siswa Aktif"
          value={studentCount}
          description="Total siswa aktif terdaftar"
        />
        <IndicatorCard
          title="Guru"
          value={gtkCount}
          description={`${sertifikasiPct}% memiliki sertifikasi pendidik`}
        />
        <IndicatorCard
          title="Rombel Aktif"
          value={kelasAktif}
          description={`dari ${rombelCount} total rombel`}
        />
        <IndicatorCard
          title="Kurikulum Aktif"
          value={kurikulumCount}
          description="Jumlah kurikulum berjalan"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Standar Sarana-Prasarana</CardTitle>
          <CardDescription>Data dukung akreditasi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <IndicatorRow
            label="Jumlah Ruang Kelas"
            current={ruangCount}
            target={kelasAktif}
            unit="ruangan"
          />
          <IndicatorRow
            label="Kapasitas Ruang Terbesar"
            current={ruangIdealCap}
            target={kelasIdealCap}
            unit="siswa"
          />
          <IndicatorRow
            label="Rasio Guru:Siswa"
            current={gtkCount}
            target={studentCount}
            unit="(target 1:20 untuk akreditasi A)"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Standar Pendidik & Tenaga Kependidikan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <IndicatorRow
            label="Guru Tersertifikasi"
            current={guruSertifikasi}
            target={gtkCount}
            unit={`(${sertifikasiPct}%)`}
          />
          <IndicatorRow
            label="Guru PNS"
            current={pnsCount}
            target={gtkCount}
            unit={`(${pnsPct}%)`}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Catatan
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p className="text-sm text-muted-foreground">
            Data pada halaman ini bersifat indikatif untuk kebutuhan akreditasi. Untuk dokumen
            resmi, hubungi admin untuk generate laporan PDF lengkap sesuai format yang
            dipersyaratkan BAN-S/M.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function IndicatorCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string | number;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
        {description && (
          <CardDescription className="pt-1 text-xs">{description}</CardDescription>
        )}
      </CardHeader>
    </Card>
  );
}

function IndicatorRow({
  label,
  current,
  target,
  unit,
}: {
  label: string;
  current: number;
  target: number;
  unit?: string;
}) {
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-mono">
          {current} / {target} {unit}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full ${pct >= 90 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : "bg-red-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
