import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";

export default async function OfficeReportPage() {
  const access = await requirePermission("read", "tata-usaha");
  if (!access) redirect("/unauthorized");
  const [incoming, outgoing, pendingDispositions, pendingApprovals, templates, archives] = await Promise.all([
    db.incomingLetter.count(),
    db.outgoingLetter.count(),
    db.letterDisposition.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    db.letterApproval.count({ where: { status: "PENDING" } }),
    db.letterTemplate.count({ where: { is_active: true } }),
    db.archiveRecord.count(),
  ]);
  return <div className="space-y-6"><div><p className="text-sm text-muted-foreground">Tata Usaha</p><h1 className="text-2xl font-bold">Laporan Administrasi TU</h1></div><div className="grid gap-4 md:grid-cols-3"><Metric label="Surat Masuk" value={incoming} /><Metric label="Surat Keluar" value={outgoing} /><Metric label="Disposisi Aktif" value={pendingDispositions} /><Metric label="Approval Pending" value={pendingApprovals} /><Metric label="Template Aktif" value={templates} /><Metric label="Arsip" value={archives} /></div></div>;
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-lg border bg-white p-4"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></div>;
}

