"use client";

import { useBreadcrumb } from "@/contexts/admin";
import { useEffect } from "react";
import GalleryActions from "./GalleryActions";

export function GalleryClient() {
  const breadcrumb = useBreadcrumb();
  const setBreadcrumbs = breadcrumb?.setBreadcrumbs;

  useEffect(() => {
    if (setBreadcrumbs) {
      setBreadcrumbs([{ label: "Gallery" }]);
    }
  }, [setBreadcrumbs]);

  return (
    <div className="p-6">
      <GalleryActions />
    </div>
  );
}
