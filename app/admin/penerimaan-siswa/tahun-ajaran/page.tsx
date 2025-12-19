import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export const revalidate = 0;

async function createAcademicYear(formData: FormData) {
  "use server";
  const label = (formData.get("label") as string | null)?.trim();
  const startDateInput = (formData.get("startDate") as string | null)?.trim() || null;
  const endDateInput = (formData.get("endDate") as string | null)?.trim() || null;

  if (!label) {
    throw new Error("Label tahun ajaran wajib diisi.");
  }

  const startDate = startDateInput ? new Date(startDateInput) : null;
  const endDate = endDateInput ? new Date(endDateInput) : null;

  if (startDate && Number.isNaN(startDate.getTime())) {
    throw new Error("Tanggal mulai tidak valid.");
  }

  if (endDate && Number.isNaN(endDate.getTime())) {
    throw new Error("Tanggal selesai tidak valid.");
  }

  await db.tahunAjaran.create({
    data: {
      label,
      startDate,
      endDate,
      isActive: false,
    },
  });

  revalidatePath("/admin/penerimaan-siswa/tahun-ajaran");
}

async function activateAcademicYear(formData: FormData) {
  "use server";
  const yearId = (formData.get("yearId") as string | null)?.trim();
  if (!yearId) {
    throw new Error("Tahun ajaran tidak ditemukan.");
  }

  await db.$transaction([
    db.tahunAjaran.updateMany({
      where: {},
      data: { isActive: false },
    }),
    db.tahunAjaran.update({
      where: { id: yearId },
      data: { isActive: true },
    }),
  ]);

  revalidatePath("/apply");
  revalidatePath("/admin/penerimaan-siswa/tahun-ajaran");
}

export default async function AcademicYearsPage() {
  const years = await db.tahunAjaran.findMany({
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="space-y-8 p-8">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Penerimaan Siswa</p>
        <h1 className="text-3xl font-semibold text-foreground">Tahun Ajaran</h1>
        <p className="text-sm text-muted-foreground">Kelola tahun ajaran aktif untuk landing page dan formulir.</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-3xl border border-card bg-card p-6 shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Daftar Tahun Ajaran</h2>
            <span className="text-xs text-muted-foreground">{years.length} entri</span>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm text-foreground">
              <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-2">Label</th>
                  <th className="px-4 py-2">Rentang</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {years.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-xs text-muted-foreground">
                      Belum ada tahun ajaran.
                    </td>
                  </tr>
                ) : (
                  years.map((year) => (
                    <tr key={year.id} className="text-foreground">
                      <td className="px-4 py-3 font-semibold text-foreground">{year.label}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {year.startDate ? new Date(year.startDate).toLocaleDateString("id-ID", { dateStyle: "medium" }) : "-"}
                        {year.endDate ? ` — ${new Date(year.endDate).toLocaleDateString("id-ID", { dateStyle: "medium" })}` : ""}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            year.isActive ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {year.isActive ? "Aktif" : "Tidak aktif"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {!year.isActive && (
                          <form action={activateAcademicYear} className="text-sm font-semibold text-success">
                            <input type="hidden" name="yearId" value={year.id} />
                            <button type="submit">Jadikan aktif</button>
                          </form>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl border border-card bg-card p-6 shadow">
          <h2 className="text-lg font-semibold text-foreground">Tambahkan Tahun Ajaran</h2>
          <form action={createAcademicYear} className="mt-6 space-y-4">
            <label className="block text-sm font-semibold text-foreground">
              Label
              <input
                name="label"
                required
                className="mt-2 w-full rounded-lg border border-card bg-card px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none"
              />
            </label>
            <label className="block text-sm font-semibold text-foreground">
              Tanggal Mulai
              <input
                name="startDate"
                type="date"
                className="mt-2 w-full rounded-lg border border-card bg-card px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none"
              />
            </label>
            <label className="block text-sm font-semibold text-foreground">
              Tanggal Selesai
              <input
                name="endDate"
                type="date"
                className="mt-2 w-full rounded-lg border border-card bg-card px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none"
              />
            </label>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/80"
            >
              Simpan Tahun Ajaran
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
