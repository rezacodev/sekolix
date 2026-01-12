"use client";

import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Pengaturan</h1>
      <p className="mt-2 text-sm text-muted-foreground">Halaman pengaturan umum (placeholder).</p>
      <div className="mt-4 space-y-2">
        <Link
          href="/admin/settings/identitas-sekolah"
          className="block text-sm text-primary hover:underline"
        >
          Identitas Sekolah
        </Link>
        <Link
          href="/admin/settings/notifikasi"
          className="block text-sm text-primary hover:underline"
        >
          Notifikasi
        </Link>
        <Link
          href="/admin/settings/integrasi-api"
          className="block text-sm text-primary hover:underline"
        >
          Integrasi & API
        </Link>
        <Link
          href="/admin/settings/backup-restore"
          className="block text-sm text-primary hover:underline"
        >
          Backup & Restore
        </Link>
        <Link href="/admin/users" className="block text-sm text-primary hover:underline">
          Manajemen Pengguna
        </Link>
      </div>
    </div>
  );
}
