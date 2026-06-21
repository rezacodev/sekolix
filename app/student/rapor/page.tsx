"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";

export default function StudentRaporPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Rapor</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Laporan prestasi akademik siswa
        </p>
      </div>

      {/* Available Raporps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { periode: "Semester Ganjil 2025/2026", tanggal: "15 Desember 2025", status: "Sudah Keluar" },
          { periode: "Semester Genap 2024/2025", tanggal: "10 Juni 2025", status: "Sudah Keluar" }
        ].map((rapor, idx) => (
          <Card key={idx}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {rapor.periode}
              </CardTitle>
              <CardDescription>{rapor.tanggal}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full text-sm font-medium">
                  {rapor.status}
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Lihat
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            💡 Rapor adalah dokumen resmi yang memuat prestasi akademik kamu setiap semester. 
            Rapor akan tersedia setelah akhir semester dan persetujuan kepala sekolah.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
