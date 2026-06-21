"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Info, CheckCircle2, BookOpen } from "lucide-react";

export default function StudentPengumumanPage() {
  const announcements = [
    {
      type: "urgent",
      icon: AlertCircle,
      title: "PTS Dimulai Minggu Depan",
      desc: "Persiapkan diri kamu untuk PTS yang akan dimulai pada tanggal 2 Juni 2026",
      date: "20 Mei 2026",
      color: "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950"
    },
    {
      type: "info",
      icon: Info,
      title: "Libur Nasional",
      desc: "Sekolah libur pada tanggal 5-7 Juni 2026 untuk memperingati hari libur nasional",
      date: "18 Mei 2026",
      color: "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950"
    },
    {
      type: "success",
      icon: CheckCircle2,
      title: "Nilai UH Matematika Sudah Keluar",
      desc: "Nilai ujian harian matematika sudah dipublikasikan. Silakan cek di menu nilai",
      date: "15 Mei 2026",
      color: "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950"
    },
    {
      type: "info",
      icon: BookOpen,
      title: "Materi Baru: Bab 6 Fisika",
      desc: "Guru telah mengunggah materi pembelajaran baru untuk kelas fisika",
      date: "10 Mei 2026",
      color: "border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950"
    },
    {
      type: "success",
      icon: CheckCircle2,
      title: "Pengabaran Hasil PAS",
      desc: "Hasil Penilaian Akhir Semester sudah tersedia. Download rapor di menu rapor",
      date: "5 Mei 2026",
      color: "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pengumuman</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Informasi penting dari sekolah dan guru
        </p>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium">
          Semua
        </button>
        <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium">
          Penting
        </button>
        <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium">
          Informasi
        </button>
      </div>

      {/* Announcements */}
      <div className="space-y-4">
        {announcements.map((announcement, idx) => {
          const Icon = announcement.icon;
          return (
            <Card key={idx} className={`border-2 ${announcement.color}`}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Icon className="w-6 h-6 text-gray-700 dark:text-gray-300 mt-1" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                      {announcement.title}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {announcement.desc}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {announcement.date}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Load More */}
      <div className="text-center">
        <button className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800">
          Muat Pengumuman Lebih Lama
        </button>
      </div>
    </div>
  );
}
