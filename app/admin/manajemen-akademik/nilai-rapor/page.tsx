"use client";

import { useEffect } from "react";
import { useBreadcrumb } from "@/hooks/useBreadcrumb";

export default function NilaiRaporPage() {
  const breadcrumbContext = useBreadcrumb();
  const { setBreadcrumbs } = breadcrumbContext || {};

  useEffect(() => {
    if (setBreadcrumbs) {
      setBreadcrumbs([
        { label: "Manajemen Akademik", href: "/admin/manajemen-akademik" },
        { label: "Nilai & Rapor", href: "/admin/manajemen-akademik/nilai-rapor" }
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-3xl font-bold">Nilai & Rapor</h1>
        <p className="text-muted-foreground">
          Fitur ini sedang dalam pengembangan. Penilaian akan dikelola melalui hak akses guru terlebih dahulu.
        </p>
        <div className="mt-8 p-6 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Halaman ini akan berisi:
          </p>
          <ul className="mt-3 space-y-2 text-left text-sm">
            <li>• Manajemen penilaian siswa</li>
            <li>• Generate rapor</li>
            <li>• Cetak rapor</li>
            <li>• Laporan nilai</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
