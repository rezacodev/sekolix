import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export const revalidate = 0;

async function createProgram(formData: FormData) {
  "use server";
  const name = (formData.get("name") as string | null)?.trim();
  const code = (formData.get("code") as string | null)?.trim() || null;
  const description = (formData.get("description") as string | null)?.trim() || null;

  if (!name) {
    throw new Error("Nama program wajib diisi.");
  }

  await db.program.create({
    data: {
      name,
      code,
      description,
      isActive: true,
    },
  });

  revalidatePath("/admin/penerimaan-siswa/programs");
}

async function toggleProgramState(formData: FormData) {
  "use server";
  const programId = (formData.get("programId") as string | null)?.trim();
  const action = (formData.get("action") as string | null) ?? "";
  if (!programId) {
    throw new Error("Program tidak ditemukan.");
  }

  await db.program.update({
    where: { id: programId },
    data: { isActive: action === "activate" },
  });

  revalidatePath("/admin/penerimaan-siswa/programs");
}

export default async function AdmissionsProgramPage() {
  const programs = await db.program.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8 p-8">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Penerimaan Siswa</p>
        <h1 className="text-3xl font-semibold text-foreground">Program Penerimaan</h1>
        <p className="text-sm text-muted-foreground">Tambah dan aktifkan program yang bisa dipilih siswa saat mendaftar.</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-3xl border border-card bg-card p-6 shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Daftar Program</h2>
            <span className="text-xs text-muted-foreground">{programs.length} total</span>
          </div>
          <div className="mt-6 space-y-4">
            {programs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada program yang terdaftar.</p>
            ) : (
              programs.map((program) => (
                <div key={program.id} className="rounded-2xl border border-card bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold text-foreground">{program.name}</p>
                      <p className="text-xs text-muted-foreground">{program.code ?? "Tanpa kode"}</p>
                    </div>
                    <form action={toggleProgramState} className="text-right">
                      <input type="hidden" name="programId" value={program.id} />
                      <input type="hidden" name="action" value={program.isActive ? "deactivate" : "activate"} />
                      <button
                        type="submit"
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                          program.isActive
                            ? "border border-success text-success"
                            : "border border-card text-muted-foreground"
                        }`}
                      >
                        {program.isActive ? "Aktif" : "Aktifkan"}
                      </button>
                    </form>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{program.description ?? "Belum ada deskripsi."}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-card bg-card p-6 shadow">
          <h2 className="text-lg font-semibold text-foreground">Tambah Program Baru</h2>
          <form action={createProgram} className="mt-6 space-y-4">
            <label className="block text-sm font-semibold text-foreground">
              Nama Program
              <input
                name="name"
                required
                className="mt-2 w-full rounded-lg border border-card bg-card px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none"
              />
            </label>
            <label className="block text-sm font-semibold text-foreground">
              Kode (opsional)
              <input
                name="code"
                className="mt-2 w-full rounded-lg border border-card bg-card px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none"
              />
            </label>
            <label className="block text-sm font-semibold text-foreground">
              Deskripsi (opsional)
              <textarea
                name="description"
                rows={3}
                className="mt-2 w-full rounded-lg border border-card bg-card px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none"
              />
            </label>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Tambahkan Program
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
