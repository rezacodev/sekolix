"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Calendar, Image, Newspaper } from "lucide-react";
import { useBreadcrumb } from "@/contexts/admin";
import { useEffect } from "react";

const statsConfig = [
  { key: "users" as const, title: "Total Pengguna", icon: Users, color: "text-primary" },
  { key: "articles" as const, title: "Artikel Dipublikasikan", icon: FileText, color: "text-accent" },
  { key: "news" as const, title: "Berita Dipublikasikan", icon: Newspaper, color: "text-accent" },
  { key: "events" as const, title: "Acara Dipublikasikan", icon: Calendar, color: "text-muted" },
  { key: "galleries" as const, title: "Item Galeri", icon: Image, color: "text-accent" },
];

type Stats = {
  users: number;
  articles: number;
  news: number;
  events: number;
  galleries: number;
};

export function DashboardClient({ userName, stats }: { userName: string; stats: Stats }) {
  const breadcrumb = useBreadcrumb();
  const setBreadcrumbs = breadcrumb?.setBreadcrumbs;

  useEffect(() => {
    if (setBreadcrumbs) {
      setBreadcrumbs([{ label: "Dasbor" }]);
    }
  }, [setBreadcrumbs]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dasbor</h1>
          <p className="text-muted-foreground mt-1">
            Selamat datang kembali, {userName}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statsConfig.map((stat) => {
            const Icon = stat.icon;
            const bgMap: Record<string, string> = {
              "text-primary": "bg-primary/20",
              "text-accent": "bg-accent/20",
              "text-muted": "bg-muted/20",
              "text-success": "bg-success/20",
            };
            const iconMap: Record<string, string> = {
              "text-primary": "h-5 w-5 text-primary-foreground",
              "text-accent": "h-5 w-5 text-accent-foreground",
              "text-muted": "h-5 w-5 text-muted-foreground",
              "text-success": "h-5 w-5 text-success-foreground",
            };
            const bgClass = bgMap[stat.color] || "bg-muted/20";
            const iconClass = iconMap[stat.color] || "h-5 w-5 text-muted-foreground";

            return (
              <Card key={stat.key} className="transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className={`rounded-full p-2 border border-sidebar-border ${bgClass}`}>
                    <Icon className={iconClass} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats[stat.key]}</div>
                  <p className="text-xs text-muted-foreground mt-1">Total</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tips Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Gunakan menu Pengguna untuk kelola admin/editor.</li>
              <li>Konten landing page dikelola via artikel/berita/acara/galeri.</li>
              <li>Konfigurasi tema dapat diatur via Pengaturan.</li>
            </ul>
          </CardContent>
        </Card>
    </div>
  );
}
