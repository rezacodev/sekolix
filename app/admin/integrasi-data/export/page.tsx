import { redirect } from "next/navigation";
import { FileDown, FileSpreadsheet } from "lucide-react";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { ensureDefaultIntegrationProfiles } from "@/lib/data-integration/persistence";
import { INTEGRATION_ENTITIES } from "@/lib/data-integration/server";

const ENTITY_LABELS: Record<string, string> = {
  students: "Peserta Didik",
  staff: "GTK",
  rombels: "Rombel",
  subjects: "Mata Pelajaran",
  grades: "Nilai",
};

export default async function DataIntegrationExportPage() {
  const access = await requirePermission("read", "integrasi-data");
  if (!access) redirect("/unauthorized");
  await ensureDefaultIntegrationProfiles();

  const [profiles, exportBatches] = await Promise.all([
    db.dataIntegrationProfile.findMany({ where: { is_active: true }, orderBy: [{ target_system: "asc" }, { school_level: "asc" }] }),
    db.exportBatch.findMany({ include: { profile: true }, orderBy: { created_at: "desc" }, take: 20 }),
  ]);
  const profile = profiles[0];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Integrasi Data</p>
        <h1 className="text-2xl font-bold">Export & Template</h1>
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {INTEGRATION_ENTITIES.map((entity) => (
          <div key={entity} className="rounded-lg border bg-white p-4">
            <FileSpreadsheet className="mb-4 h-5 w-5 text-blue-700" />
            <h2 className="font-semibold">{ENTITY_LABELS[entity]}</h2>
            <div className="mt-4 flex flex-col gap-2">
              <a className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:underline" href={`/api/admin/integrasi-data/templates?entity=${entity}`}>
                <FileSpreadsheet className="h-4 w-4" /> Template
              </a>
              <a className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:underline" href={`/api/admin/integrasi-data/exports?entity=${entity}&profileId=${profile?.id ?? ""}&format=xlsx`}>
                <FileDown className="h-4 w-4" /> Export XLSX
              </a>
            </div>
          </div>
        ))}
      </section>
      <section className="rounded-lg border bg-white p-4">
        <h2 className="font-semibold">Riwayat Export</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2">File</th>
                <th className="py-2">Profil</th>
                <th className="py-2">Entitas</th>
                <th className="py-2">Format</th>
                <th className="py-2">Baris</th>
              </tr>
            </thead>
            <tbody>
              {exportBatches.map((batch) => (
                <tr key={batch.id} className="border-b last:border-0">
                  <td className="py-2">{batch.file_name}</td>
                  <td className="py-2">{batch.profile.name}</td>
                  <td className="py-2">{batch.entity}</td>
                  <td className="py-2">{batch.format}</td>
                  <td className="py-2">{batch.row_count}</td>
                </tr>
              ))}
              {exportBatches.length === 0 ? (
                <tr><td className="py-6 text-center text-muted-foreground" colSpan={5}>Belum ada riwayat export.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
