import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, DatabaseZap, FileDown, FileSpreadsheet, History, ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { ensureDefaultIntegrationProfiles } from "@/lib/data-integration/persistence";
import { SeedIntegrationButton } from "./_components/IntegrationActions";

export default async function DataIntegrationDashboardPage() {
  const access = await requirePermission("read", "integrasi-data");
  if (!access) redirect("/unauthorized");
  await ensureDefaultIntegrationProfiles();

  const [profiles, mappings, importBatches, exportBatches, openIssues, errorIssues] = await Promise.all([
    db.dataIntegrationProfile.count({ where: { is_active: true } }),
    db.dataFieldMapping.count(),
    db.importBatch.count(),
    db.exportBatch.count(),
    db.dataValidationIssue.count({ where: { status: "OPEN" } }),
    db.dataValidationIssue.count({ where: { status: "OPEN", severity: "ERROR" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Integrasi</p>
          <h1 className="text-2xl font-bold">Integrasi Data Pendidikan Indonesia</h1>
        </div>
        <SeedIntegrationButton />
      </div>
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Metric icon={DatabaseZap} label="Preset" value={profiles} />
        <Metric icon={FileSpreadsheet} label="Mapping" value={mappings} />
        <Metric icon={History} label="Import" value={importBatches} />
        <Metric icon={FileDown} label="Export" value={exportBatches} />
        <Metric icon={ShieldCheck} label="Issue Terbuka" value={openIssues} />
        <Metric icon={AlertTriangle} label="Error" value={errorIssues} />
      </div>
      <section className="grid gap-4 md:grid-cols-4">
        <QuickLink href="/admin/integrasi-data/profil" title="Profil & Mapping" description="Preset Dapodik, EMIS, e-Rapor friendly." icon={DatabaseZap} />
        <QuickLink href="/admin/integrasi-data/import" title="Import Preview" description="Validasi baris sebelum disimpan." icon={FileSpreadsheet} />
        <QuickLink href="/admin/integrasi-data/export" title="Export Data" description="Siswa, GTK, rombel, mapel, dan nilai." icon={FileDown} />
        <QuickLink href="/admin/integrasi-data/validasi" title="Validasi Data" description="Data tidak lengkap dan duplikat." icon={ShieldCheck} />
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof DatabaseZap; label: string; value: number }) {
  return <div className="rounded-lg border bg-white p-4"><Icon className="mb-3 h-5 w-5 text-blue-700" /><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></div>;
}

function QuickLink({ href, title, description, icon: Icon }: { href: string; title: string; description: string; icon: typeof DatabaseZap }) {
  return <Link href={href} className="rounded-lg border bg-white p-4 transition hover:border-blue-300 hover:bg-blue-50/50"><Icon className="mb-4 h-5 w-5 text-blue-700" /><h2 className="font-semibold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></Link>;
}
