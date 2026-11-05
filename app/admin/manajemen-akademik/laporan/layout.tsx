"use client";

import { useEffect } from "react";
import type React from "react";
import { useBreadcrumb } from "@/contexts/admin";
import { usePathname } from "next/navigation";

export default function LaporanLayout({ children }: { children: React.ReactNode }) {
  const breadcrumb = useBreadcrumb();
  const setBreadcrumbs = breadcrumb?.setBreadcrumbs;
  const pathname = usePathname();

  useEffect(() => {
    if (!setBreadcrumbs) return;

    // Set breadcrumbs for all laporan pages
    if (pathname.startsWith("/admin/manajemen-akademik/laporan")) {
      const segments = pathname.split("/").filter(Boolean);
      const reportSlug = segments[4]; // e.g. "data-siswa", "jadwal"

      const crumbs: Array<{ label: string; href?: string }> = [
        { label: "Manajemen Akademik", href: "/admin/manajemen-akademik" },
        { label: "Laporan", href: "/admin/manajemen-akademik/laporan" },
      ];

      if (reportSlug && reportSlug !== "") {
        const label = REPORT_LABELS[reportSlug] || reportSlug;
        crumbs.push({ label });
      }

      setBreadcrumbs(crumbs);
    }
  }, [setBreadcrumbs, pathname]);

  return <div>{children}</div>;
}

const REPORT_LABELS: Record<string, string> = {
  "data-siswa": "Data Siswa Aktif",
  "data-guru": "Data Guru (GTK)",
  "jadwal": "Jadwal Pelajaran",
  "nilai-siswa": "Nilai Per Siswa",
  "rapor": "Rapor",
  "dashboard-eksekutif": "Dashboard Eksekutif",
  "kelas-rombel": "Kelas & Rombel",
  "beban-mengajar": "Beban Mengajar Guru",
  "nilai-kelas": "Nilai Per Kelas",
  "ketuntasan-kkm": "Ketuntasan Belajar (KKM)",
  "ranking": "Ranking Siswa",
  "kurikulum-mapel": "Kurikulum & Mata Pelajaran",
  "ruang-jam": "Ruang & Jam Pelajaran",
  "distribusi-siswa": "Distribusi Siswa per Kelas",
  "nilai-mapel": "Nilai Per Mata Pelajaran",
  "analitik": "Laporan Analitik",
  "tahunan": "Laporan Tahunan",
  "akreditasi": "Laporan Akreditasi",
};
