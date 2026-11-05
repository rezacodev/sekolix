import Link from "next/link";
import { ChevronLeft, BarChart3 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportButtons } from "../_components/ExportButtons";

export const dynamic = "force-dynamic";

export default async function NilaiMapelPage() {
  const assessments = await prisma.assessment.findMany({
    where: { deleted_at: null },
    include: {
      subject: { select: { name: true, code: true } },
      grades: { where: { deleted_at: null }, select: { score: true } },
    },
  });

  const bySubject = new Map<string, { name: string; code: string; total: number; count: number }>();
  for (const a of assessments) {
    const sid = String(a.subject_id);
    const entry = bySubject.get(sid) ?? { name: a.subject.name, code: a.subject.code ?? "", total: 0, count: 0 };
    const max = Number(a.max_score ?? 100);
    for (const g of a.grades) {
      const norm = max > 0 ? (Number(g.score) / max) * 100 : Number(g.score);
      entry.total += norm;
      entry.count += 1;
    }
    bySubject.set(sid, entry);
  }

  const rows = Array.from(bySubject.values())
    .map((v) => ({
      name: v.name,
      code: v.code,
      count: v.count,
      rataRata: v.count > 0 ? Math.round((v.total / v.count) * 100) / 100 : 0,
    }))
    .sort((a, b) => b.rataRata - a.rataRata);

  const maxRata = rows.length > 0 ? Math.max(...rows.map((r) => r.rataRata)) : 0;

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
          <h1 className="text-2xl font-semibold">C3 — Nilai Per Mata Pelajaran</h1>
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
            Prioritas Rendah
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Rata-rata nilai agregat per mata pelajaran (lintas rombel).
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Rata-rata per Mata Pelajaran
            </CardTitle>
            <CardDescription>{rows.length} mata pelajaran</CardDescription>
          </div>
          <ExportButtons
            excelUrl="/api/admin/manajemen-akademik/laporan/nilai-mapel?format=excel"
            pdfUrl="/api/admin/manajemen-akademik/laporan/nilai-mapel?format=pdf"
          />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {rows.map((r, idx) => (
              <div
                key={r.code + r.name}
                className="flex items-center gap-4 rounded-lg border p-3 hover:bg-muted/20"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.code && `Kode: ${r.code} • `}
                    {r.count} data nilai
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${maxRata > 0 ? (r.rataRata / maxRata) * 100 : 0}%` }}
                    />
                  </div>
                  <Badge variant="outline" className="w-14 justify-center font-mono">
                    {r.rataRata.toFixed(2)}
                  </Badge>
                </div>
              </div>
            ))}
            {rows.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Belum ada data nilai.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
