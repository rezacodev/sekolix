import Link from "next/link";
import {
  Users,
  GraduationCap,
  CalendarDays,
  FileText,
  BarChart3,
  LayoutDashboard,
  School,
  Briefcase,
  ClipboardList,
  CheckCircle2,
  Trophy,
  BookOpen,
  Building2,
  PieChart,
  TrendingUp,
  Award,
  Calendar,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Priority = "tinggi" | "sedang" | "rendah";

interface ReportEntry {
  kode: string;
  judul: string;
  deskripsi: string;
  href: string;
  icon: LucideIcon;
  /** Implementation status */
  status: "available" | "soon";
}

interface ReportGroup {
  prioritas: Priority;
  label: string;
  deskripsi: string;
  badgeClass: string;
  reports: ReportEntry[];
}

const REPORT_GROUPS: ReportGroup[] = [
  {
    prioritas: "tinggi",
    label: "Prioritas Tinggi (MVP)",
    deskripsi: "Laporan inti untuk kebutuhan operasional harian. Wajib tersedia di rilis pertama.",
    badgeClass: "bg-red-100 text-red-700 border-red-200",
    reports: [
      {
        kode: "A1",
        judul: "Data Siswa Aktif",
        deskripsi: "Daftar siswa aktif dengan filter tahun ajaran, rombel, dan status. Export Excel/PDF.",
        href: "/admin/manajemen-akademik/laporan/data-siswa",
        icon: Users,
        status: "available",
      },
      {
        kode: "A2",
        judul: "Data Guru (GTK)",
        deskripsi: "Daftar guru & tenaga kependidikan dengan rasio guru:siswa. Export Excel/PDF.",
        href: "/admin/manajemen-akademik/laporan/data-guru",
        icon: GraduationCap,
        status: "available",
      },
      {
        kode: "B1",
        judul: "Jadwal Pelajaran",
        deskripsi: "Jadwal mingguan per rombel, deteksi konflik jadwal. Export Excel/PDF.",
        href: "/admin/manajemen-akademik/laporan/jadwal",
        icon: CalendarDays,
        status: "available",
      },
      {
        kode: "C1",
        judul: "Nilai Per Siswa",
        deskripsi: "Transkrip nilai per siswa lengkap dengan grafik perkembangan. Export PDF.",
        href: "/admin/manajemen-akademik/laporan/nilai-siswa",
        icon: FileText,
        status: "available",
      },
      {
        kode: "C4",
        judul: "Rapor",
        deskripsi: "Cetak rapor per semester untuk satu siswa atau satu rombel. Export PDF.",
        href: "/admin/manajemen-akademik/laporan/rapor",
        icon: Award,
        status: "available",
      },
      {
        kode: "E1",
        judul: "Dashboard Eksekutif",
        deskripsi: "Ringkasan KPI, statistik, dan tren untuk kepala sekolah. Tampilan real-time.",
        href: "/admin/manajemen-akademik/laporan/dashboard-eksekutif",
        icon: LayoutDashboard,
        status: "available",
      },
    ],
  },
  {
    prioritas: "sedang",
    label: "Prioritas Sedang",
    deskripsi: "Laporan untuk analisis mendalam setelah MVP rilis.",
    badgeClass: "bg-yellow-100 text-yellow-700 border-yellow-200",
    reports: [
      {
        kode: "A4",
        judul: "Kelas & Rombongan Belajar",
        deskripsi: "Daftar rombel per tahun ajaran dengan detail wali kelas dan kapasitas.",
        href: "/admin/manajemen-akademik/laporan/kelas-rombel",
        icon: School,
        status: "available",
      },
      {
        kode: "B2",
        judul: "Beban Mengajar Guru",
        deskripsi: "Rekap jumlah jam mengajar per guru, lengkap dengan distribusi mapel.",
        href: "/admin/manajemen-akademik/laporan/beban-mengajar",
        icon: Briefcase,
        status: "available",
      },
      {
        kode: "C2",
        judul: "Nilai Per Kelas/Rombel",
        deskripsi: "Rekap nilai agregat per rombel, dengan rata-rata dan distribusi predikat.",
        href: "/admin/manajemen-akademik/laporan/nilai-kelas",
        icon: ClipboardList,
        status: "available",
      },
      {
        kode: "C5",
        judul: "Ketuntasan Belajar (KKM)",
        deskripsi: "Persentase siswa yang mencapai KKM per mapel.",
        href: "/admin/manajemen-akademik/laporan/ketuntasan-kkm",
        icon: CheckCircle2,
        status: "available",
      },
      {
        kode: "C6",
        judul: "Ranking Siswa",
        deskripsi: "Peringkat siswa berdasarkan rata-rata nilai, per rombel atau tingkat.",
        href: "/admin/manajemen-akademik/laporan/ranking",
        icon: Trophy,
        status: "available",
      },
    ],
  },
  {
    prioritas: "rendah",
    label: "Prioritas Rendah",
    deskripsi: "Laporan pelengkap untuk kebutuhan spesifik dan akreditasi.",
    badgeClass: "bg-green-100 text-green-700 border-green-200",
    reports: [
      {
        kode: "A3",
        judul: "Kurikulum & Mata Pelajaran",
        deskripsi: "Daftar kurikulum dan struktur mata pelajaran per tingkat.",
        href: "/admin/manajemen-akademik/laporan/kurikulum-mapel",
        icon: BookOpen,
        status: "available",
      },
      {
        kode: "A5",
        judul: "Ruang & Jam Pelajaran",
        deskripsi: "Daftar ruang kelas dan slot jam pelajaran yang tersedia.",
        href: "/admin/manajemen-akademik/laporan/ruang-jam",
        icon: Building2,
        status: "available",
      },
      {
        kode: "B3",
        judul: "Distribusi Siswa per Kelas",
        deskripsi: "Sebaran jumlah siswa per rombel dan per jenis kelamin.",
        href: "/admin/manajemen-akademik/laporan/distribusi-siswa",
        icon: PieChart,
        status: "available",
      },
      {
        kode: "C3",
        judul: "Nilai Per Mata Pelajaran",
        deskripsi: "Rekap nilai agregat per mata pelajaran lintas rombel.",
        href: "/admin/manajemen-akademik/laporan/nilai-mapel",
        icon: BarChart3,
        status: "available",
      },
      {
        kode: "D",
        judul: "Laporan Analitik",
        deskripsi: "Tren nilai, perbandingan antar tahun, efektivitas mengajar.",
        href: "/admin/manajemen-akademik/laporan/analitik",
        icon: TrendingUp,
        status: "available",
      },
      {
        kode: "E2",
        judul: "Laporan Tahunan Akademik",
        deskripsi: "Rekap komprehensif satu tahun ajaran: siswa, nilai, kehadiran, mutasi.",
        href: "/admin/manajemen-akademik/laporan/tahunan",
        icon: Calendar,
        status: "available",
      },
      {
        kode: "E3",
        judul: "Laporan Akreditasi",
        deskripsi: "Indikator dan data dukung untuk kebutuhan akreditasi sekolah.",
        href: "/admin/manajemen-akademik/laporan/akreditasi",
        icon: ShieldCheck,
        status: "available",
      },
    ],
  },
];

export default function LaporanIndexPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Pusat Laporan Akademik</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pilih laporan yang ingin dilihat atau diunduh. Laporan dikelompokkan berdasarkan prioritas
          pengembangan.
        </p>
      </div>

      {REPORT_GROUPS.map((group) => (
        <section key={group.prioritas} className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">{group.label}</h2>
            <Badge variant="outline" className={group.badgeClass}>
              {group.reports.length} laporan
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{group.deskripsi}</p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.reports.map((report) => (
              <ReportCard key={report.kode} report={report} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ReportCard({ report }: { report: ReportEntry }) {
  const Icon = report.icon;
  const content = (
    <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <Badge variant="outline" className="text-xs font-mono">
            {report.kode}
          </Badge>
        </div>
        <CardTitle className="mt-3 text-base">{report.judul}</CardTitle>
        <CardDescription className="text-sm">{report.deskripsi}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {report.status === "available" ? (
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
            Buka laporan →
          </span>
        ) : (
          <Badge variant="secondary" className="text-xs">
            Segera hadir
          </Badge>
        )}
      </CardContent>
    </Card>
  );

  if (report.status === "available") {
    return <Link href={report.href}>{content}</Link>;
  }
  return content;
}
