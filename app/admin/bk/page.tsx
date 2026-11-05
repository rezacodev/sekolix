import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, Award, ClipboardList, FileText, Send, Users } from "lucide-react";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";

export default async function BkDashboardPage() {
  const access = await requirePermission("read", "bk");
  if (!access) redirect("/unauthorized");

  const [activeCases, criticalCases, disciplineRecords, achievements, referrals, summons] = await Promise.all([
    db.studentCounselingCase.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    db.studentCounselingCase.count({ where: { priority: "CRITICAL", status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    db.disciplineRecord.count(),
    db.studentAchievement.count(),
    db.counselingReferral.count({ where: { status: "PENDING" } }),
    db.parentSummonLetter.count({ where: { status: "SENT" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Operasional Kesiswaan</p>
        <h1 className="text-2xl font-bold">BK, Kedisiplinan, dan Prestasi</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Metric icon={ClipboardList} label="Kasus aktif" value={activeCases} />
        <Metric icon={AlertTriangle} label="Prioritas kritis" value={criticalCases} />
        <Metric icon={FileText} label="Catatan disiplin" value={disciplineRecords} />
        <Metric icon={Award} label="Prestasi" value={achievements} />
        <Metric icon={Send} label="Rujukan pending" value={referrals} />
        <Metric icon={Users} label="Panggilan aktif" value={summons} />
      </div>

      <section className="grid gap-4 md:grid-cols-5">
        <QuickLink href="/admin/bk/kasus" title="Kasus BK" description="Catatan kasus, sesi konseling, dan tindak lanjut." icon={ClipboardList} />
        <QuickLink href="/admin/bk/kedisiplinan" title="Kedisiplinan" description="Master pelanggaran dan poin disiplin siswa." icon={AlertTriangle} />
        <QuickLink href="/admin/bk/prestasi" title="Prestasi" description="Prestasi akademik, non-akademik, dan karakter." icon={Award} />
        <QuickLink href="/admin/bk/rujukan" title="Rujukan & Surat" description="Workflow rujukan dan panggilan orang tua." icon={Send} />
        <QuickLink href="/admin/bk/laporan" title="Laporan" description="Ringkasan perkembangan dan siswa perlu perhatian." icon={FileText} />
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof ClipboardList; label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <Icon className="mb-3 h-5 w-5 text-emerald-700" />
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function QuickLink({ href, title, description, icon: Icon }: { href: string; title: string; description: string; icon: typeof ClipboardList }) {
  return (
    <Link href={href} className="rounded-lg border bg-white p-4 transition hover:border-emerald-300 hover:bg-emerald-50/40">
      <Icon className="mb-4 h-5 w-5 text-emerald-700" />
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}
