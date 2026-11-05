import Link from "next/link";
import { ChevronLeft, BookOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportButtons } from "../_components/ExportButtons";

export const dynamic = "force-dynamic";

export default async function KurikulumMapelPage() {
  const subjects = await prisma.subject.findMany({
    where: { deleted_at: null },
    include: {
      curriculums: {
        where: { deleted_at: null },
        include: {
          curriculum: { select: { name: true } },
        },
      },
      _count: { select: { teacherSubjects: true } },
    },
    orderBy: [{ name: "asc" }],
  });

  const byCurriculum = new Map<string, typeof subjects>();
  for (const s of subjects) {
    for (const sc of s.curriculums) {
      const key = sc.curriculum.name;
      if (!byCurriculum.has(key)) byCurriculum.set(key, []);
      byCurriculum.get(key)!.push(s);
    }
  }
  // Subjects with no curriculum get a "Tanpa Kurikulum" group
  const orphans = subjects.filter((s) => s.curriculums.length === 0);
  if (orphans.length > 0) byCurriculum.set("Tanpa Kurikulum", orphans);

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
          <h1 className="text-2xl font-semibold">A3 — Kurikulum & Mata Pelajaran</h1>
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
            Prioritas Rendah
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Daftar kurikulum aktif dan struktur mata pelajaran per tingkat.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Daftar Mata Pelajaran</CardTitle>
            <CardDescription>
              {subjects.length} mata pelajaran dalam {byCurriculum.size} kurikulum
            </CardDescription>
          </div>
          <ExportButtons
            excelUrl="/api/admin/manajemen-akademik/laporan/kurikulum-mapel?format=excel"
            pdfUrl="/api/admin/manajemen-akademik/laporan/kurikulum-mapel?format=pdf"
          />
        </CardHeader>
        <CardContent className="space-y-6">
          {Array.from(byCurriculum.entries()).map(([curriculumName, items]) => (
            <div key={curriculumName}>
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground">{curriculumName}</h3>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                {items.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.code && `${s.code} • `}
                        {s.is_practice ? "Praktik" : "Teori"} •{" "}
                        {s._count.teacherSubjects} guru
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
