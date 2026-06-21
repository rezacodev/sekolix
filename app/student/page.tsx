"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  FileText,
  BookOpen,
  BarChart3,
  Megaphone,
  Clock,
  AlertCircle,
  CheckCircle2,
  Link as LinkIcon
} from "lucide-react";

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (session && session.user.role !== "MURID") {
      router.push("/unauthorized");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Selamat datang, {session?.user?.name}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Ini adalah portal siswa Sekolix. Kelola kelas, ujian, nilai, dan rapor kamu di sini.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kelas Aktif</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-gray-500">Mapel yang sedang dipelajari</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tugas Pending</CardTitle>
            <FileText className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-gray-500">Mendekati deadline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ujian Mendatang</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-gray-500">Dalam 7 hari</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Nilai</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85</div>
            <p className="text-xs text-gray-500">Semester ini</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jadwal Hari Ini */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Jadwal Hari Ini</CardTitle>
            <CardDescription>Pelajaran yang akan datang</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { jam: "07.00", mapel: "Matematika", guru: "Budi Santoso", ruang: "Ruang 101" },
              { jam: "08.30", mapel: "Bahasa Indonesia", guru: "Siti Nurhaliza", ruang: "Ruang 102" },
              { jam: "10.00", mapel: "Fisika", guru: "Ahmad Rizki", ruang: "Lab 1" }
            ].map((schedule, idx) => (
              <div key={idx} className="flex items-start gap-4 pb-4 border-b last:pb-0 last:border-b-0">
                <div className="flex-shrink-0">
                  <Clock className="h-5 w-5 text-blue-500 mt-1" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">{schedule.mapel}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {schedule.jam} • {schedule.guru} • {schedule.ruang}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pengumuman */}
        <Card>
          <CardHeader>
            <CardTitle>Pengumuman Penting</CardTitle>
            <CardDescription>Update terbaru</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { type: "warning", text: "Ujian PTS dimulai minggu depan" },
              { type: "info", text: "Libur nasional 5-7 Juni" },
              { type: "success", text: "Nilai UH Matematika sudah keluar" }
            ].map((notif, idx) => (
              <div key={idx} className="flex gap-3 pb-3 border-b last:pb-0 last:border-b-0">
                {notif.type === "warning" && <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />}
                {notif.type === "info" && <Megaphone className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />}
                {notif.type === "success" && <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />}
                <p className="text-sm text-gray-700 dark:text-gray-300">{notif.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Tugas Pending & Ujian Mendatang */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tugas Deadline */}
        <Card>
          <CardHeader>
            <CardTitle>Tugas Mendekati Deadline</CardTitle>
            <CardDescription>Segera dikumpulkan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { mapel: "Matematika", tugas: "PR Bab 5", deadline: "Besok", hari: "1" },
              { mapel: "Bahasa Indonesia", tugas: "Analisis Puisi", deadline: "3 hari", hari: "3" }
            ].map((task, idx) => (
              <div key={idx} className="flex items-start gap-4 pb-4 border-b last:pb-0 last:border-b-0">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
                  <span className="text-xs font-bold text-red-600 dark:text-red-300">{task.hari}h</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{task.mapel}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{task.tugas}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => { }}>
                  Kumpulkan
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Ujian Mendatang */}
        <Card>
          <CardHeader>
            <CardTitle>Ujian CBT Mendatang</CardTitle>
            <CardDescription>Sesi ujian yang dijadwalkan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { nama: "PTS Matematika", tanggal: "2 Juni 2026", durasi: "120 menit" },
              { nama: "PTS Fisika", tanggal: "3 Juni 2026", durasi: "90 menit" }
            ].map((exam, idx) => (
              <div key={idx} className="flex items-start gap-4 pb-4 border-b last:pb-0 last:border-b-0">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-green-600 dark:text-green-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{exam.nama}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{exam.tanggal} • {exam.durasi}</p>
                </div>
                <Button size="sm" onClick={() => router.push("/student/ujian")}>
                  Detail
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Akses Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { icon: BookOpen, label: "Materi", href: "/student/kelas" },
              { icon: FileText, label: "Tugas", href: "/student/kelas" },
              { icon: Calendar, label: "Ujian", href: "/student/ujian" },
              { icon: BarChart3, label: "Nilai", href: "/student/nilai" },
              { icon: FileText, label: "Rapor", href: "/student/rapor" }
            ].map((link, idx) => {
              const Icon = link.icon;
              return (
                <Button
                  key={idx}
                  variant="outline"
                  className="h-auto flex flex-col gap-2 p-4"
                  onClick={() => router.push(link.href)}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs font-medium">{link.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
