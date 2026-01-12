export default function ManajemenAkademikIndex() {
  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Manajemen Akademik</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Dashboard modul Manajemen Akademik — ringkasan tahun ajaran, kelas, dan kurikulum.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border p-4">Tahun Ajaran</div>
          <div className="rounded-lg border p-4">Kurikulum & Mapel</div>
          <div className="rounded-lg border p-4">Kelas & Rombel</div>
        </div>
      </div>
    </div>
  );
}
