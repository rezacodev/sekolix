import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LaporanFilters } from "../_components/LaporanFilters";
import { ExportButtons } from "../_components/ExportButtons";

interface SearchParams {
  role?: string;
  statusKepegawaian?: string;
  gender?: string;
}

export const dynamic = "force-dynamic";

export default async function DataGuruPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const { role, statusKepegawaian, gender } = await props.searchParams;

  const [staffList, teacherCount, studentCount] = await Promise.all([
    prisma.staff.findMany({
      where: {
        isActive: true,
        isVisible: true,
        ...(role ? { role: role as "TEACHER" | "STAFF" | "OTHER" } : {}),
        ...(statusKepegawaian ? { statusKepegawaian } : {}),
        ...(gender ? { gender } : {}),
      },
      include: {
        teacherSubjects: {
          where: { deleted_at: null },
          include: { subject: { select: { name: true } } },
        },
      },
      orderBy: [{ role: "asc" }, { name: "asc" }],
      take: 500,
    }),
    prisma.staff.count({ where: { isActive: true, isVisible: true, role: "TEACHER" } }),
    prisma.pesertaDidik.count({ where: { status: "accepted" } }),
  ]);

  const totalGtk = staffList.length;
  const pnsCount = staffList.filter((s) => s.statusKepegawaian === "PNS").length;
  const nonPnsCount = staffList.filter((s) => s.statusKepegawaian === "Non-PNS").length;
  const ratio = teacherCount > 0 ? Math.round(studentCount / teacherCount) : 0;

  const queryString = new URLSearchParams({
    ...(role ? { role } : {}),
    ...(statusKepegawaian ? { statusKepegawaian } : {}),
    ...(gender ? { gender } : {}),
  }).toString();

  const exportBase = `/api/admin/manajemen-akademik/laporan/data-guru?${queryString}`;

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
          <h1 className="text-2xl font-semibold">A2 — Data Guru (GTK)</h1>
          <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
            Prioritas Tinggi
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Daftar guru dan tenaga kependidikan dengan rasio guru:siswa.
        </p>
      </div>

      <LaporanFilters
        basePath="/admin/manajemen-akademik/laporan/data-guru"
        currentValues={{ role, statusKepegawaian, gender }}
        showGender
        showRole
        showStatusKepegawaian
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total GTK</CardDescription>
            <CardTitle className="text-3xl">{totalGtk}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Guru</CardDescription>
            <CardTitle className="text-3xl">{teacherCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>PNS / Non-PNS</CardDescription>
            <CardTitle className="text-2xl">
              {pnsCount} / {nonPnsCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rasio Guru:Siswa</CardDescription>
            <CardTitle className="text-3xl">1 : {ratio}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Daftar GTK</CardTitle>
            <CardDescription>
              {totalGtk === 500
                ? "Menampilkan 500 GTK pertama. Gunakan filter untuk mempersempit."
                : `Menampilkan ${totalGtk} GTK.`}
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
                  <th className="px-3 py-2 text-left font-medium">No</th>
                  <th className="px-3 py-2 text-left font-medium">NIP</th>
                  <th className="px-3 py-2 text-left font-medium">Nama</th>
                  <th className="px-3 py-2 text-left font-medium">Role</th>
                  <th className="px-3 py-2 text-left font-medium">Jabatan</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                  <th className="px-3 py-2 text-left font-medium">Mata Pelajaran</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((s, idx) => (
                  <tr key={s.id} className="border-b hover:bg-muted/20">
                    <td className="px-3 py-2">{idx + 1}</td>
                    <td className="px-3 py-2 font-mono text-xs">{s.nip ?? "-"}</td>
                    <td className="px-3 py-2 font-medium">{s.name}</td>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className="text-xs">
                        {s.role}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">{s.position ?? "-"}</td>
                    <td className="px-3 py-2">{s.statusKepegawaian ?? "-"}</td>
                    <td className="px-3 py-2">
                      {s.teacherSubjects.map((ts) => ts.subject.name).join(", ") || "-"}
                    </td>
                  </tr>
                ))}
                {staffList.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">
                      Tidak ada data GTK untuk filter ini.
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
