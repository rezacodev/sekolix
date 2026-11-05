import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { ensureDefaultIntegrationProfiles } from "@/lib/data-integration/persistence";
import { CommitImportButton, ImportPreviewForm, RollbackImportButton } from "../_components/IntegrationActions";

export default async function DataIntegrationImportPage() {
  const access = await requirePermission("read", "integrasi-data");
  if (!access) redirect("/unauthorized");
  await ensureDefaultIntegrationProfiles();

  const [profiles, batches] = await Promise.all([
    db.dataIntegrationProfile.findMany({ where: { is_active: true }, orderBy: [{ target_system: "asc" }, { school_level: "asc" }] }),
    db.importBatch.findMany({
      include: { profile: true, rows: { orderBy: { row_number: "asc" }, take: 5 } },
      orderBy: { created_at: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Integrasi Data</p>
        <h1 className="text-2xl font-bold">Import Preview</h1>
      </div>
      <ImportPreviewForm profiles={profiles.map((profile) => ({ id: profile.id, code: profile.code, name: profile.name }))} />
      <section className="rounded-lg border bg-white p-4">
        <h2 className="font-semibold">Riwayat Import</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2">Batch</th>
                <th className="py-2">Profil</th>
                <th className="py-2">Entitas</th>
                <th className="py-2">Status</th>
                <th className="py-2">Baris</th>
                <th className="py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => (
                <tr key={batch.id} className="border-b align-top last:border-0">
                  <td className="py-2 font-mono text-xs">{batch.id.slice(0, 10)}</td>
                  <td className="py-2">{batch.profile.name}</td>
                  <td className="py-2">{batch.entity}</td>
                  <td className="py-2">{batch.status}</td>
                  <td className="py-2">{batch.valid_rows}/{batch.total_rows} valid · {batch.error_rows} error</td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-2">
                      {batch.status === "VALIDATED" || batch.status === "FAILED" ? <CommitImportButton id={batch.id} /> : null}
                      {batch.status === "IMPORTED" || batch.status === "FAILED" ? <RollbackImportButton id={batch.id} /> : null}
                    </div>
                  </td>
                </tr>
              ))}
              {batches.length === 0 ? (
                <tr><td className="py-6 text-center text-muted-foreground" colSpan={6}>Belum ada batch import.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
