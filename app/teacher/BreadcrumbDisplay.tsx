"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { useBreadcrumb } from "./BreadcrumbContext";

export function BreadcrumbDisplay() {
  const { breadcrumbs } = useBreadcrumb();

  if (breadcrumbs.length === 0) {
    return (
      <nav className="flex items-center gap-2 text-sm">
        <Home className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Dashboard</span>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-2 text-sm">
      <Link href="/teacher" className="flex items-center gap-2 hover:text-foreground transition-colors">
        <Home className="h-4 w-4 text-muted-foreground" />
      </Link>
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;
        return (
          <div key={index} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-medium" : "text-muted-foreground"}>
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
