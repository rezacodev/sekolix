import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { ArchiveForm } from "../_components/OfficeForms";

export default async function ArchivePage() {
  const access = await requirePermission("read", "tata-usaha");
  if (!access) redirect("/unauthorized");
  const [incoming, outgoing, generated, archives] = await Promise.all([
    db.incomingLetter.findMany({ orderBy: { received_at: "desc" }, take: 200 }),
    db.outgoingLetter.findMany({ orderBy: { letter_date: "desc" }, take: 200 }),
    db.generatedLetter.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    db.archiveRecord.findMany({ include: { creator: { select: { name: true } } }, orderBy: { archived_at: "desc" }, take: 300 }),
  ]);
  return <div className="space-y-6"><div><p className="text-sm text-muted-foreground">Tata Usaha</p><h1 className="text-2xl font-bold">Arsip Digital</h1></div><ArchiveForm incoming={incoming.map((item) => ({ id: item.id, label: `${item.agenda_number} - ${item.subject}` }))} outgoing={outgoing.map((item) => ({ id: item.id, label: `${item.letter_number} - ${item.subject}` }))} generated={generated.map((item) => ({ id: item.id, label: `${item.validation_code} - ${item.subject_name}` }))} /><div className="grid gap-3 md:grid-cols-3">{archives.map((item) => <div key={item.id} className="rounded-lg border bg-white p-4"><p className="font-mono text-xs text-slate-500">{item.code}</p><p className="font-semibold">{item.title}</p><p className="text-xs text-slate-500">{item.category} - {item.visibility}</p><p className="mt-2 text-sm">{item.file_url ? <a href={item.file_url} target="_blank" rel="noreferrer" className="text-indigo-700">Buka file</a> : "Tanpa file"}</p></div>)}</div></div>;
}

