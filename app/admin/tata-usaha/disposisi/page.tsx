import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { serializeDispositionStatus } from "@/lib/office/server";
import { DispositionForm } from "../_components/OfficeForms";

export default async function DispositionPage() {
  const access = await requirePermission("read", "tata-usaha");
  if (!access) redirect("/unauthorized");
  const [incoming, outgoing, staff, dispositions] = await Promise.all([
    db.incomingLetter.findMany({ orderBy: { received_at: "desc" }, take: 200 }),
    db.outgoingLetter.findMany({ orderBy: { letter_date: "desc" }, take: 200 }),
    db.staff.findMany({ where: { deleted_at: null, isActive: true }, orderBy: { name: "asc" }, take: 300 }),
    db.letterDisposition.findMany({ include: { incomingLetter: true, outgoingLetter: true, assignee: { select: { name: true } }, creator: { select: { name: true } } }, orderBy: [{ status: "asc" }, { createdAt: "desc" }], take: 200 }),
  ]);
  return <div className="space-y-6"><div><p className="text-sm text-muted-foreground">Tata Usaha</p><h1 className="text-2xl font-bold">Disposisi Surat</h1></div><DispositionForm incoming={incoming.map((item) => ({ id: item.id, label: `${item.agenda_number} - ${item.subject}` }))} outgoing={outgoing.map((item) => ({ id: item.id, label: `${item.letter_number} - ${item.subject}` }))} staff={staff.map((item) => ({ id: item.id, label: item.name }))} /><div className="overflow-hidden rounded-lg border bg-white"><table className="w-full text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-3 py-2">Surat</th><th className="px-3 py-2">Tujuan</th><th className="px-3 py-2">Instruksi</th><th className="px-3 py-2">Tempo</th><th className="px-3 py-2">Status</th></tr></thead><tbody>{dispositions.map((item) => <tr key={item.id} className="border-t"><td className="px-3 py-2">{item.incomingLetter?.agenda_number ?? item.outgoingLetter?.letter_number ?? "-"}</td><td className="px-3 py-2 font-medium">{item.assignee.name}</td><td className="px-3 py-2">{item.instruction}</td><td className="px-3 py-2">{item.due_date?.toLocaleDateString("id-ID") ?? "-"}</td><td className="px-3 py-2">{serializeDispositionStatus(item.status)}</td></tr>)}{dispositions.length === 0 && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={5}>Belum ada disposisi.</td></tr>}</tbody></table></div></div>;
}

