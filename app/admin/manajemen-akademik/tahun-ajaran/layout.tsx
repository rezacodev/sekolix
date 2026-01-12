"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";
import type React from "react";
import { CalendarDays, Calendar } from "lucide-react";
import { useBreadcrumb } from "@/contexts/admin";

const tabs = [
  { label: "Tahun Ajaran", href: "/admin/manajemen-akademik/tahun-ajaran", icon: CalendarDays },
  {
    label: "Kalender Akademik",
    href: "/admin/manajemen-akademik/tahun-ajaran/kalender-akademik",
    icon: Calendar
  }
];

const cn = (...classes: Array<string | undefined | boolean>) => classes.filter(Boolean).join(" ");

export default function TahunAjaranLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const breadcrumb = useBreadcrumb();
  const setBreadcrumbs = breadcrumb?.setBreadcrumbs;

  const currentTab = useMemo(() => {
    const matches = tabs
      .filter(tab => pathname.startsWith(tab.href))
      .sort((a, b) => b.href.length - a.href.length);
    return matches[0] ?? tabs[0];
  }, [pathname]);

  useEffect(() => {
    if (!setBreadcrumbs) return;

    const crumbs = [{ label: "Manajemen Akademik", href: "/admin/manajemen-akademik" }];
    if (currentTab) {
      crumbs.push({ label: currentTab.label, href: currentTab.href });
    }

    setBreadcrumbs(crumbs);
  }, [currentTab, setBreadcrumbs]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tahun Ajaran</h1>
        <p className="text-muted-foreground">Kelola tahun ajaran dan kalender akademik.</p>
      </div>

      <div className="border-b border-border">
        <nav className="flex gap-4" aria-label="Tabs">
          {tabs.map(tab => {
            const Icon = tab.icon as React.ComponentType<React.SVGProps<SVGSVGElement>>;
            const isActive = currentTab?.href === tab.href;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div>{children}</div>
    </div>
  );
}
