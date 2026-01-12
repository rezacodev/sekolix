/**
 * useBreadcrumb Hook (Admin)
 *
 * Custom hook for managing breadcrumb navigation in admin dashboard
 */

"use client";

import { useBreadcrumb as useContextBreadcrumb } from "@/contexts/admin";
import { useCallback } from "react";
import { BreadcrumbItem } from "@/types";

export function useBreadcrumb() {
  const context = useContextBreadcrumb();

  if (!context) {
    throw new Error("useBreadcrumb must be used within a BreadcrumbProvider");
  }

  const { breadcrumbs, setBreadcrumbs } = context;

  const addBreadcrumb = useCallback(
    (item: BreadcrumbItem) => {
      setBreadcrumbs([...breadcrumbs, item]);
    },
    [breadcrumbs, setBreadcrumbs]
  );

  const removeBreadcrumb = useCallback(
    (index: number) => {
      setBreadcrumbs(breadcrumbs.filter((_, i) => i !== index));
    },
    [breadcrumbs, setBreadcrumbs]
  );

  const clearBreadcrumbs = useCallback(() => {
    setBreadcrumbs([]);
  }, [setBreadcrumbs]);

  return {
    breadcrumbs,
    setBreadcrumbs,
    addBreadcrumb,
    removeBreadcrumb,
    clearBreadcrumbs
  };
}
