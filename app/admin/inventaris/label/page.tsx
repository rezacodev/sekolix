import { redirect } from "next/navigation";
import { QrCode } from "lucide-react";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/governance/server";

export default async function InventoryLabelPage({ searchParams }: { searchParams: Promise<{ asset?: string }> }) {
  const access = await requirePermission("read", "inventaris");
  if (!access) redirect("/unauthorized");

  const params = await searchParams;
  const assets = await db.asset.findMany({
    where: params.asset ? { asset_code: params.asset } : {},
    include: { category: true, location: true, room: true },
    orderBy: { asset_code: "asc" },
    take: 120,
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Inventaris/Sarpras</p>
        <h1 className="text-2xl font-bold">Label QR Aset</h1>
      </div>

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        {assets.map((asset) => (
          <div key={asset.id} className="rounded-lg border bg-white p-4">
            <div className="flex aspect-square items-center justify-center rounded-md border border-dashed bg-slate-50">
              <div className="text-center">
                <QrCode className="mx-auto h-14 w-14 text-teal-700" />
                <p className="mt-2 break-all font-mono text-xs">{asset.qr_code ?? asset.asset_code}</p>
              </div>
            </div>
            <p className="mt-3 font-semibold">{asset.asset_code}</p>
            <p className="text-sm">{asset.name}</p>
            <p className="text-xs text-slate-500">{asset.category?.name ?? "-"} - {asset.location?.name ?? asset.room?.name ?? "-"}</p>
          </div>
        ))}
        {assets.length === 0 && <p className="text-sm text-slate-500">Belum ada aset untuk dicetak label.</p>}
      </section>
    </div>
  );
}

