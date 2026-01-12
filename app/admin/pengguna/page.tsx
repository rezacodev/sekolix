"use client";

import Link from "next/link";

export default function UsersPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Manajemen Pengguna</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Halaman placeholder untuk manajemen pengguna.
      </p>
      <div className="mt-4">
        <Link href="/admin/settings" className="text-sm text-primary hover:underline">
          Kembali ke Pengaturan
        </Link>
      </div>
    </div>
  );
}
