'use client';

import { useEffect } from 'react';
import { useBreadcrumb } from '@/contexts/admin';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function ClientBreadcrumb({ breadcrumbs }: { breadcrumbs: BreadcrumbItem[] }) {
  const { setBreadcrumbs } = useBreadcrumb() || {};

  useEffect(() => {
    if (setBreadcrumbs) {
      setBreadcrumbs(breadcrumbs);
    }
  }, [breadcrumbs, setBreadcrumbs]);

  return null;
}
