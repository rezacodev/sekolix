import Link from "next/link";
import { ChevronLeft, ArrowRight, FileText, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RaporLaporanPage() {
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
          <h1 className="text-2xl font-semibold">C4 — Rapor</h1>
          <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
            Prioritas Tinggi
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Cetak rapor per semester untuk siswa atau rombel tertentu. Generate PDF berdasarkan data
          nilai akhir yang sudah dihitung.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="transition-all hover:border-primary/50 hover:shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ListChecks className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                Daftar Rapor
              </Badge>
            </div>
            <CardTitle className="mt-3 text-base">Cetak Rapor per Rombel</CardTitle>
            <CardDescription>
              Pilih tahun ajaran, semester, dan rombel. Generate PDF rapor untuk seluruh siswa di
              rombel tersebut.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/manajemen-akademik/nilai-rapor">
                Buka halaman rapor
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-all hover:border-primary/50 hover:shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                API
              </Badge>
            </div>
            <CardTitle className="mt-3 text-base">Generate PDF via API</CardTitle>
            <CardDescription>
              Endpoint langsung untuk generate rapor PDF per rombel. Cocok untuk integrasi atau
              download satu klik.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <code className="block rounded bg-muted px-3 py-2 text-xs">
              GET /api/admin/manajemen-akademik/rapor/generate?rombelId=...&semesterId=...
            </code>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Catatan Implementasi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Implementasi rapor sudah tersedia di{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              app/api/admin/manajemen-akademik/rapor/generate/route.ts
            </code>{" "}
            menggunakan <strong>pdf-lib</strong>.
          </p>
          <p>
            Halaman interaktif untuk melihat daftar nilai per rombel ada di{" "}
            <Link
              href="/admin/manajemen-akademik/nilai-rapor"
              className="text-primary underline-offset-4 hover:underline"
            >
              Manajemen Akademik → Nilai & Rapor
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
