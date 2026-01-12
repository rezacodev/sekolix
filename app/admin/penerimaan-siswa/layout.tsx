"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";
import type React from "react";
import { useBreadcrumb } from "@/contexts/admin";

const tabs = [
  { label: "Pendaftaran Baru", href: "/admin/penerimaan-siswa/pendaftaran-baru" },
  { label: "Pembayaran", href: "/admin/penerimaan-siswa/pembayaran" },
  { label: "Siswa Diterima", href: "/admin/penerimaan-siswa/siswa-diterima" },
  { label: "Pengaturan", href: "/admin/penerimaan-siswa/settings" },
  { label: "Program", href: "/admin/penerimaan-siswa/programs" },
  { label: "Tahun Ajaran", href: "/admin/penerimaan-siswa/tahun-ajaran" }
];

export default function AdmissionLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const breadcrumb = useBreadcrumb();
  const setBreadcrumbs = breadcrumb?.setBreadcrumbs;

  const currentTab = useMemo(() => {
    const matches = tabs
      .filter(t => pathname.startsWith(t.href))
      .sort((a, b) => b.href.length - a.href.length);
    return matches[0] ?? null;
  }, [pathname]);

  useEffect(() => {
    if (!setBreadcrumbs) return;

    const crumbs: Array<{ label: string; href?: string }> = [
      { label: "Penerimaan Siswa", href: "/admin/penerimaan-siswa" }
    ];

    if (currentTab) {
      crumbs.push({ label: currentTab.label });
    }

    setBreadcrumbs(crumbs);
  }, [currentTab, setBreadcrumbs]);

  return <div className="space-y-6">{children}</div>;
}
