"use client";

import { useBreadcrumb } from "@/contexts/admin";
import { useEffect } from "react";
import PagesList from "./PagesList";

export function PagesClient() {
  const breadcrumb = useBreadcrumb();
  const setBreadcrumbs = breadcrumb?.setBreadcrumbs;

  useEffect(() => {
    if (setBreadcrumbs) {
      setBreadcrumbs([{ label: "Halaman Profil" }]);
    }
  }, [setBreadcrumbs]);

  return (
    <div className="p-6">
      <PagesList />
    </div>
  );
}
