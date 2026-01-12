"use client";

import { useEffect } from "react";
import type React from "react";
import { useBreadcrumb } from "@/contexts/admin";

export default function WebsiteLandingLayout({ children }: { children: React.ReactNode }) {
  const breadcrumb = useBreadcrumb();
  const setBreadcrumbs = breadcrumb?.setBreadcrumbs;

  useEffect(() => {
    if (!setBreadcrumbs) return;

    setBreadcrumbs([{ label: "Website Sekolah", href: "/admin/landing-website" }]);
  }, [setBreadcrumbs]);

  return <div>{children}</div>;
}
