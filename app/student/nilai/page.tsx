"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentNilaiPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nilai</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Rekap nilai kamu per mapel
        </p>
      </div>

      {/* Filter */}
      <div className="flex gap-4">
        <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700">
          <option>Semester Ganjil 2025/2026</option>
          <option>Semester Genap 2025/2026</option>
        </select>
      </div>

      {/* Nilai Table */}
      <Card>
        <CardHeader>
          <CardTitle>Rekap Nilai Semester Ini</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-4 font-semibold">Mapel</th>
                  <th className="text-center py-2 px-4 font-semibold">Tugas</th>
                  <th className="text-center py-2 px-4 font-semibold">UTS</th>
                  <th className="text-center py-2 px-4 font-semibold">UAS</th>
                  <th className="text-center py-2 px-4 font-semibold">Rata-rata</th>
                  <th className="text-center py-2 px-4 font-semibold">Predikat</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { mapel: "Matematika", tugas: 85, uts: 80, uas: 88, rata: 84.3, predikat: "B" },
                  { mapel: "Fisika", tugas: 82, uts: 78, uas: 85, rata: 81.7, predikat: "B" },
                  { mapel: "Kimia", tugas: 88, uts: 85, uas: 90, rata: 87.7, predikat: "A" },
                  { mapel: "Biologi", tugas: 86, uts: 82, uas: 84, rata: 84, predikat: "B" }
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-3 px-4">{row.mapel}</td>
                    <td className="text-center py-3 px-4">{row.tugas}</td>
                    <td className="text-center py-3 px-4">{row.uts}</td>
                    <td className="text-center py-3 px-4">{row.uas}</td>
                    <td className="text-center py-3 px-4 font-semibold">{row.rata}</td>
                    <td className="text-center py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        row.predikat === "A" 
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                      }`}>
                        {row.predikat}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
