"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { BookOpen, FileText } from "lucide-react";

const tabs = [
  {
    label: "Kurikulum",
    href: "/admin/manajemen-akademik/kurikulum-mapel/kurikulum",
    icon: BookOpen
  },
  {
    label: "Mata Pelajaran",
    href: "/admin/manajemen-akademik/kurikulum-mapel/mata-pelajaran",
    icon: FileText
  }
];

export default function KurikulumMapelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <AdminPageHeader
          title="Kurikulum & Mata Pelajaran"
          description="Kelola kurikulum dan mata pelajaran untuk sistem pendidikan"
        />
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex gap-4" aria-label="Tabs">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = pathname.startsWith(tab.href);

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
                <Icon className="h-4 w-4 text-current" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Page Content */}
      {children}
    </div>
  );
}
