import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { serializeLetterStatus } from "@/lib/office/server";
import { ApproveLetterButton, OutgoingLetterForm } from "../_components/OfficeForms";

export default async function OutgoingLettersPage() {
  const access = await requirePermission("read", "tata-usaha");
  if (!access) redirect("/unauthorized");
  const [templates, staff, letters] = await Promise.all([
    db.letterTemplate.findMany({ where: { is_active: true }, orderBy: { name: "asc" } }),
    db.staff.findMany({ where: { deleted_at: null, isActive: true }, orderBy: { name: "asc" }, take: 300 }),
    db.outgoingLetter.findMany({ include: { template: true, signer: { select: { name: true } }, approvals: true }, orderBy: { letter_date: "desc" }, take: 300 }),
  ]);
  return (
    <div className="space-y-6">
      <div><p className="text-sm text-muted-foreground">Tata Usaha</p><h1 className="text-2xl font-bold">Agenda Surat Keluar</h1></div>
      <OutgoingLetterForm templates={templates.map((item) => ({ id: item.id, label: item.name }))} staff={staff.map((item) => ({ id: item.id, label: item.name }))} />
      <div className="overflow-hidden rounded-lg border bg-white"><table className="w-full text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-3 py-2">Nomor</th><th className="px-3 py-2">Tanggal</th><th className="px-3 py-2">Penerima</th><th className="px-3 py-2">Perihal</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">QR Payload</th><th className="px-3 py-2"></th></tr></thead><tbody>
        {letters.map((item) => <tr key={item.id} className="border-t"><td className="px-3 py-2 font-mono text-xs">{item.letter_number}</td><td className="px-3 py-2">{item.letter_date.toLocaleDateString("id-ID")}</td><td className="px-3 py-2">{item.recipient}</td><td className="px-3 py-2 font-medium">{item.subject}</td><td className="px-3 py-2">{serializeLetterStatus(item.status)}</td><td className="px-3 py-2 break-all font-mono text-xs">{item.qr_code}</td><td className="px-3 py-2">{item.status === "WAITING_APPROVAL" ? <div className="flex gap-2"><ApproveLetterButton letterId={item.id} status="APPROVED" /><ApproveLetterButton letterId={item.id} status="CANCELLED" /></div> : null}</td></tr>)}
        {letters.length === 0 && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={7}>Belum ada surat keluar.</td></tr>}
      </tbody></table></div>
    </div>
  );
}

