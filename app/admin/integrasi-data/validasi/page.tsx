import { redirect } from "next/navigation";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { RunValidationButton } from "../_components/IntegrationActions";

export default async function DataIntegrationValidationPage() {
  const access = await requirePermission("read", "integrasi-data");
  if (!access) redirect("/unauthorized");

  const [issues, openIssues, errorIssues, warningIssues] = await Promise.all([
    db.dataValidationIssue.findMany({ where: { status: "OPEN" }, orderBy: [{ severity: "desc" }, { created_at: "desc" }], take: 100 }),
    db.dataValidationIssue.count({ where: { status: "OPEN" } }),
    db.dataValidationIssue.count({ where: { status: "OPEN", severity: "ERROR" } }),
    db.dataValidationIssue.count({ where: { status: "OPEN", severity: "WARNING" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Integrasi Data</p>
          <h1 className="text-2xl font-bold">Validasi Data</h1>
        </div>
        <RunValidationButton />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Metric icon={ShieldCheck} label="Issue Terbuka" value={openIssues} />
        <Metric icon={AlertTriangle} label="Error" value={errorIssues} />
        <Metric icon={AlertTriangle} label="Warning" value={warningIssues} />
      </div>
      <section className="rounded-lg border bg-white p-4">
        <h2 className="font-semibold">Data Tidak Lengkap & Duplikat</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2">Severity</th>
                <th className="py-2">Entitas</th>
                <th className="py-2">Field</th>
                <th className="py-2">Record</th>
                <th className="py-2">Pesan</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr key={issue.id} className="border-b last:border-0">
                  <td className="py-2">{issue.severity}</td>
                  <td className="py-2">{issue.entity}</td>
                  <td className="py-2">{issue.field}</td>
                  <td className="py-2 font-mono text-xs">{issue.record_id ?? "-"}</td>
                  <td className="py-2">{issue.message}</td>
                </tr>
              ))}
              {issues.length === 0 ? (
                <tr><td className="py-6 text-center text-muted-foreground" colSpan={5}>Belum ada issue terbuka. Jalankan validasi untuk memindai data.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof ShieldCheck; label: string; value: number }) {
  return <div className="rounded-lg border bg-white p-4"><Icon className="mb-3 h-5 w-5 text-blue-700" /><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></div>;
}
