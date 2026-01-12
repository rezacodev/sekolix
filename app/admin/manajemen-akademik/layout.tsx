"use client";

import { useEffect } from "react";
import type React from "react";
import { useBreadcrumb } from "@/contexts/admin";
import { usePathname } from "next/navigation";

export default function AkademikLayout({ children }: { children: React.ReactNode }) {
  const breadcrumb = useBreadcrumb();
  const setBreadcrumbs = breadcrumb?.setBreadcrumbs;
  const pathname = usePathname();

  useEffect(() => {
    if (!setBreadcrumbs) return;

    // Only set module-level breadcrumb when we're on the module root
    // so child layouts (tabs/pages) can set more specific breadcrumbs
    if (pathname === "/admin/manajemen-akademik") {
      setBreadcrumbs([{ label: "Manajemen Akademik", href: "/admin/manajemen-akademik" }]);
    }
  }, [setBreadcrumbs, pathname]);

  return <div>{children}</div>;
}
