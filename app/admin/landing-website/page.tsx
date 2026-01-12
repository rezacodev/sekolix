import React from "react";

export default function Page() {
  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Website Sekolah</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Dashboard modul Website Sekolah — ringkasan konten dan pengaturan.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border p-4">Konten & Artikel</div>
          <div className="rounded-lg border p-4">Galeri & Media</div>
          <div className="rounded-lg border p-4">Pengaturan Tema & Landing</div>
        </div>
      </div>
    </div>
  );
}
