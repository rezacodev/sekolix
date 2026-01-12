"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { DoorOpen, Clock } from "lucide-react";

const tabs = [
  {
    label: "Ruang / Kelas / Lab",
    href: "/admin/manajemen-akademik/ruang-jam-pelajaran/ruang",
    icon: DoorOpen
  },
  {
    label: "Jam Pelajaran",
    href: "/admin/manajemen-akademik/ruang-jam-pelajaran/jam-pelajaran",
    icon: Clock
  }
];

export default function RuangJamPelajaranLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <AdminPageHeader
          title="Ruang & Jam Pelajaran"
          description="Kelola data ruang kelas/lab dan pengaturan jam pelajaran"
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
