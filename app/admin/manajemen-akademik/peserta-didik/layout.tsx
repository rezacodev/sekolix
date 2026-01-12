"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type React from "react";
import { useBreadcrumb } from "@/contexts/admin";

export default function DataSiswaAktifLayout({ children }: { children: React.ReactNode }) {
  const breadcrumb = useBreadcrumb();
  const setBreadcrumbs = breadcrumb?.setBreadcrumbs;
  const pathname = usePathname();

  useEffect(() => {
    if (!setBreadcrumbs) return;

    const isNew = pathname.endsWith("/new");
    const isList = pathname === "/admin/manajemen-akademik/peserta-didik";
    const isEdit = !isNew && !isList;

    const crumbs: Array<{ label: string; href?: string }> = [
      { label: "Manajemen Akademik", href: "/admin/manajemen-akademik" },
      { label: "Peserta Didik", href: "/admin/manajemen-akademik/peserta-didik" }
    ];

    if (isNew) crumbs.push({ label: "Tambah Peserta Didik" });
    else if (isEdit) crumbs.push({ label: "Edit Peserta Didik" });

    setBreadcrumbs(crumbs);
  }, [setBreadcrumbs, pathname]);

  return <div>{children}</div>;
}
