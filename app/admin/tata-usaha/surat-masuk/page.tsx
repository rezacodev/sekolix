import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { serializeLetterStatus } from "@/lib/office/server";
import { IncomingLetterForm } from "../_components/OfficeForms";

export default async function IncomingLettersPage() {
  const access = await requirePermission("read", "tata-usaha");
  if (!access) redirect("/unauthorized");
  const letters = await db.incomingLetter.findMany({ include: { receiver: { select: { name: true } }, dispositions: true }, orderBy: { received_at: "desc" }, take: 300 });
  return (
    <div className="space-y-6">
      <div><p className="text-sm text-muted-foreground">Tata Usaha</p><h1 className="text-2xl font-bold">Agenda Surat Masuk</h1></div>
      <IncomingLetterForm />
      <div className="overflow-hidden rounded-lg border bg-white"><table className="w-full text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-3 py-2">Agenda</th><th className="px-3 py-2">Tanggal</th><th className="px-3 py-2">Pengirim</th><th className="px-3 py-2">Perihal</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Disposisi</th></tr></thead><tbody>
        {letters.map((item) => <tr key={item.id} className="border-t"><td className="px-3 py-2 font-mono text-xs">{item.agenda_number}</td><td className="px-3 py-2">{item.received_at.toLocaleDateString("id-ID")}</td><td className="px-3 py-2">{item.sender}</td><td className="px-3 py-2 font-medium">{item.file_url ? <a href={item.file_url} target="_blank" rel="noreferrer" className="text-indigo-700">{item.subject}</a> : item.subject}</td><td className="px-3 py-2">{serializeLetterStatus(item.status)}</td><td className="px-3 py-2">{item.dispositions.length}</td></tr>)}
        {letters.length === 0 && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={6}>Belum ada surat masuk.</td></tr>}
      </tbody></table></div>
    </div>
  );
}

