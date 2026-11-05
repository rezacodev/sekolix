import Link from "next/link";
import { ChevronLeft, Trophy, Medal } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LaporanFilters } from "../_components/LaporanFilters";
import { ExportButtons } from "../_components/ExportButtons";

interface SearchParams {
  tahunAjaranId?: string;
  rombelId?: string;
  topN?: string;
}

export const dynamic = "force-dynamic";

const TOP_N_DEFAULT = 50;

function getRankBadge(rank: number) {
  if (rank === 1) return <Medal className="h-4 w-4 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />;
  if (rank === 3) return <Medal className="h-4 w-4 text-amber-700" />;
  return <span className="text-sm font-mono">{rank}</span>;
}

export default async function RankingSiswaPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const { tahunAjaranId, rombelId, topN: topNParam } = await props.searchParams;
  const topN = topNParam ? Math.max(1, parseInt(topNParam, 10) || TOP_N_DEFAULT) : TOP_N_DEFAULT;

  const activeTA = await prisma.tahunAjaran.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
  const effectiveTAId = tahunAjaranId ?? activeTA?.id;

  const [tahunAjaranList, rombelList, students] = await Promise.all([
    prisma.tahunAjaran.findMany({
      where: { deleted_at: null },
      orderBy: { startDate: "desc" },
      select: { id: true, label: true, isActive: true },
    }),
    effectiveTAId
      ? prisma.rombel.findMany({
          where: { deleted_at: null, tahunAjaranId: effectiveTAId },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
    prisma.pesertaDidik.findMany({
      where: {
        status: "accepted",
        grades: { some: {} },
        ...(rombelId ? { rombels: { some: { id: BigInt(rombelId), deleted_at: null } } } : {}),
      },
      include: {
        grades: {
          where: { deleted_at: null },
          select: {
            score: true,
            assessment: { select: { max_score: true, weight: true } },
          },
        },
        rombels: { where: { deleted_at: null }, select: { name: true } },
      },
    }),
  ]);

  // Compute & rank
  const ranked = students
    .map((s) => {
      let w = 0;
      let ws = 0;
      for (const g of s.grades) {
        const max = Number(g.assessment.max_score ?? 100);
        const norm = max > 0 ? (Number(g.score) / max) * 100 : Number(g.score);
        w += norm * (g.assessment.weight || 1);
        ws += g.assessment.weight || 1;
      }
      return {
        id: s.id,
        nisn: s.nisn ?? "",
        nama: s.fullName,
        rombel: s.rombels[0]?.name ?? "-",
        rataRata: ws > 0 ? w / ws : 0,
      };
    })
    .sort((a, b) => b.rataRata - a.rataRata)
    .slice(0, topN);

  const queryString = new URLSearchParams({
    ...(effectiveTAId ? { tahunAjaranId: effectiveTAId } : {}),
    ...(rombelId ? { rombelId } : {}),
    topN: String(topN),
  }).toString();
  const exportBase = `/api/admin/manajemen-akademik/laporan/ranking?${queryString}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/manajemen-akademik/laporan">
            <ChevronLeft className="h-4 w-4" />
            Kembali
          </Link>
        </Button>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">C6 — Ranking Siswa</h1>
          <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
            Prioritas Sedang
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Peringkat siswa berdasarkan rata-rata nilai tertimbang. Top {topN} ditampilkan.
        </p>
      </div>

      <LaporanFilters
        basePath="/admin/manajemen-akademik/laporan/ranking"
        tahunAjaranOptions={tahunAjaranList.map((t) => ({
          value: t.id,
          label: t.label + (t.isActive ? " (Aktif)" : ""),
        }))}
        rombelOptions={rombelList.map((r) => ({
          value: String(r.id),
          label: r.name,
        }))}
        showRombel
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Top {topN} Siswa
            </CardTitle>
            <CardDescription>
              {rombelId ? "Berdasarkan rombel" : "Seluruh siswa aktif"} —{" "}
              {ranked.length} siswa
            </CardDescription>
          </div>
          <ExportButtons
            excelUrl={`${exportBase}&format=excel`}
            pdfUrl={`${exportBase}&format=pdf`}
          />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-3 py-2 text-left font-medium w-12">#</th>
                  <th className="px-3 py-2 text-left font-medium">Nama</th>
                  <th className="px-3 py-2 text-left font-medium">NISN</th>
                  <th className="px-3 py-2 text-left font-medium">Rombel</th>
                  <th className="px-3 py-2 text-right font-medium">Rata-rata</th>
                  <th className="px-3 py-2 text-center font-medium">Predikat</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((r, idx) => {
                  const predikat =
                    r.rataRata >= 90 ? "A" : r.rataRata >= 80 ? "B" : r.rataRata >= 70 ? "C" : r.rataRata >= 60 ? "D" : "E";
                  return (
                    <tr
                      key={r.id}
                      className={`border-b hover:bg-muted/20 ${
                        idx < 3 ? "bg-amber-50/30" : ""
                      }`}
                    >
                      <td className="px-3 py-2">
                        <span className="flex h-6 w-6 items-center justify-center">
                          {getRankBadge(idx + 1)}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-medium">{r.nama}</td>
                      <td className="px-3 py-2 font-mono text-xs">{r.nisn || "-"}</td>
                      <td className="px-3 py-2">{r.rombel}</td>
                      <td className="px-3 py-2 text-right font-mono">
                        {r.rataRata.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Badge variant={predikat === "A" ? "default" : "secondary"}>
                          {predikat}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
                {ranked.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                      Belum ada data nilai untuk ditampilkan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
