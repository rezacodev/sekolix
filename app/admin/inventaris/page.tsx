import Link from "next/link";
import { redirect } from "next/navigation";
import { ArchiveRestore, Boxes, ClipboardCheck, MapPin, QrCode, ReceiptText, Send, Wrench, AlertTriangle } from "lucide-react";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";
import { formatRupiah } from "@/lib/inventory/server";

export default async function InventoryDashboardPage() {
  const access = await requirePermission("read", "inventaris");
  if (!access) redirect("/unauthorized");

  const [assets, activeAssets, borrowedAssets, maintenanceAssets, damagedAssets, lostAssets, assetValues] = await Promise.all([
    db.asset.count(),
    db.asset.count({ where: { status: "ACTIVE" } }),
    db.asset.count({ where: { status: "BORROWED" } }),
    db.asset.count({ where: { status: "MAINTENANCE" } }),
    db.asset.count({ where: { condition: { in: ["DAMAGED", "BROKEN"] } } }),
    db.asset.count({ where: { status: "LOST" } }),
    db.asset.findMany({ select: { purchase_price: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Operasional</p>
        <h1 className="text-2xl font-bold">Inventaris/Sarpras</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-7">
        <Metric icon={Boxes} label="Aset" value={assets} />
        <Metric icon={ClipboardCheck} label="Aktif" value={activeAssets} />
        <Metric icon={Send} label="Dipinjam" value={borrowedAssets} />
        <Metric icon={Wrench} label="Pemeliharaan" value={maintenanceAssets} />
        <Metric icon={AlertTriangle} label="Rusak" value={damagedAssets} />
        <Metric icon={ArchiveRestore} label="Hilang" value={lostAssets} />
        <Metric icon={ReceiptText} label="Nilai Aset" value={formatRupiah(assetValues.reduce((sum, item) => sum + (item.purchase_price?.toNumber() ?? 0), 0))} />
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <QuickLink href="/admin/inventaris/aset" title="Aset" description="Kategori dan data aset sekolah." icon={Boxes} />
        <QuickLink href="/admin/inventaris/lokasi" title="Lokasi" description="Lokasi aset yang terhubung data ruang." icon={MapPin} />
        <QuickLink href="/admin/inventaris/kondisi" title="Kondisi" description="Pemeriksaan dan riwayat kondisi aset." icon={ClipboardCheck} />
        <QuickLink href="/admin/inventaris/mutasi" title="Mutasi" description="Perpindahan aset antar lokasi." icon={ArchiveRestore} />
        <QuickLink href="/admin/inventaris/peminjaman" title="Peminjaman" description="Peminjaman barang dan ruang terkait." icon={Send} />
        <QuickLink href="/admin/inventaris/pemeliharaan" title="Pemeliharaan" description="Jadwal perawatan sarpras." icon={Wrench} />
        <QuickLink href="/admin/inventaris/label" title="Label QR" description="Payload label inventaris per aset." icon={QrCode} />
        <QuickLink href="/admin/inventaris/laporan" title="Laporan" description="Aset rusak, hilang, dan perlu perawatan." icon={ReceiptText} />
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Boxes; label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <Icon className="mb-3 h-5 w-5 text-teal-700" />
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

function QuickLink({ href, title, description, icon: Icon }: { href: string; title: string; description: string; icon: typeof Boxes }) {
  return (
    <Link href={href} className="rounded-lg border bg-white p-4 transition hover:border-teal-300 hover:bg-teal-50/50">
      <Icon className="mb-4 h-5 w-5 text-teal-700" />
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}

