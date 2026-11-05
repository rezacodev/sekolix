"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SETTINGS_LINKS = [
  { href: "/admin/pengaturan/identitas-sekolah", title: "Identitas Sekolah", description: "Profil, logo, kontak, dan identitas publik sekolah." },
  { href: "/admin/pengaturan/notifikasi", title: "Notifikasi", description: "SMTP email dan pengaturan notifikasi dalam aplikasi." },
  { href: "/admin/pengaturan/integrasi-api", title: "Integrasi & API", description: "API key dan webhook untuk integrasi eksternal." },
  { href: "/admin/pengaturan/backup-restore", title: "Backup & Restore", description: "Export dan restore data sekolah." },
  { href: "/admin/pengguna", title: "Manajemen Pengguna", description: "Akun, role utama, dan status user." },
  { href: "/admin/pengaturan/permissions", title: "Izin Akses Role", description: "Permission matrix untuk role operasional dinamis." },
  { href: "/admin/pengaturan/audit-log", title: "Audit Log", description: "Activity log dan audit trail perubahan data sensitif." },
  { href: "/admin/pengaturan/approval", title: "Approval Workflow", description: "Alur persetujuan dasar untuk aksi penting." },
];

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground">Konfigurasi sistem, keamanan, dan tata kelola aplikasi.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {SETTINGS_LINKS.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="h-full transition hover:border-primary/50 hover:shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm font-medium text-primary">Buka pengaturan</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
