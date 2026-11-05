import Link from "next/link";
import { redirect } from "next/navigation";
import { Archive, FileOutput, FileText, Inbox, ReceiptText, Send, Split } from "lucide-react";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";

export default async function OfficeDashboardPage() {
  const access = await requirePermission("read", "tata-usaha");
  if (!access) redirect("/unauthorized");

  const [incoming, outgoing, templates, generated, dispositions, archives] = await Promise.all([
    db.incomingLetter.count(),
    db.outgoingLetter.count(),
    db.letterTemplate.count({ where: { is_active: true } }),
    db.generatedLetter.count(),
    db.letterDisposition.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    db.archiveRecord.count(),
  ]);

  return (
    <div className="space-y-6">
      <div><p className="text-sm text-muted-foreground">Operasional</p><h1 className="text-2xl font-bold">Surat Menyurat & Administrasi TU</h1></div>
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Metric icon={Inbox} label="Surat Masuk" value={incoming} />
        <Metric icon={Send} label="Surat Keluar" value={outgoing} />
        <Metric icon={FileText} label="Template" value={templates} />
        <Metric icon={FileOutput} label="Generate" value={generated} />
        <Metric icon={Split} label="Disposisi Aktif" value={dispositions} />
        <Metric icon={Archive} label="Arsip" value={archives} />
      </div>
      <section className="grid gap-4 md:grid-cols-4">
        <QuickLink href="/admin/tata-usaha/surat-masuk" title="Surat Masuk" description="Agenda dan file surat masuk." icon={Inbox} />
        <QuickLink href="/admin/tata-usaha/surat-keluar" title="Surat Keluar" description="Nomor otomatis, approval, QR validasi." icon={Send} />
        <QuickLink href="/admin/tata-usaha/template" title="Template" description="Template surat siswa/pegawai." icon={FileText} />
        <QuickLink href="/admin/tata-usaha/generate" title="Generate Surat" description="Generate surat dan PDF dari template." icon={FileOutput} />
        <QuickLink href="/admin/tata-usaha/disposisi" title="Disposisi" description="Instruksi tindak lanjut surat." icon={Split} />
        <QuickLink href="/admin/tata-usaha/arsip" title="Arsip Digital" description="Arsip dan pencarian dokumen." icon={Archive} />
        <QuickLink href="/admin/tata-usaha/laporan" title="Laporan" description="Ringkasan agenda dan status surat." icon={ReceiptText} />
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Inbox; label: string; value: number }) {
  return <div className="rounded-lg border bg-white p-4"><Icon className="mb-3 h-5 w-5 text-indigo-700" /><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></div>;
}

function QuickLink({ href, title, description, icon: Icon }: { href: string; title: string; description: string; icon: typeof Inbox }) {
  return <Link href={href} className="rounded-lg border bg-white p-4 transition hover:border-indigo-300 hover:bg-indigo-50/50"><Icon className="mb-4 h-5 w-5 text-indigo-700" /><h2 className="font-semibold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></Link>;
}

