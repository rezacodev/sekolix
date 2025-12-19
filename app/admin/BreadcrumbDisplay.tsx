'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { useBreadcrumb } from '@/contexts/admin';

export function BreadcrumbDisplay() {
  const breadcrumb = useBreadcrumb();

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground min-h-6">
      {!breadcrumb || breadcrumb.breadcrumbs.length === 0 ? (
        <div className="flex items-center gap-2">
          <Link href="/admin" className="hover:text-foreground transition-colors">
            <Home className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <>
          <Link href="/admin" className="hover:text-foreground transition-colors">
            <Home className="h-4 w-4" />
          </Link>
          {breadcrumb.breadcrumbs.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4" />
              {item.href && index < breadcrumb.breadcrumbs.length - 1 ? (
                <Link href={item.href} className="hover:text-foreground transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className={index === breadcrumb.breadcrumbs.length - 1 ? "text-foreground font-medium" : ""}>
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
