"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  FileText,
  BarChart3,
  TrendingUp,
  Award,
  ChevronDown,
} from "lucide-react";

interface ExamSession {
  id: string;
  name: string;
  package: string;
  subject: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalQuestions: number;
  status: "belum" | "sedang" | "selesai" | "tidak_hadir";
  score?: number;
  correctAnswers?: number;
  wrongAnswers?: number;
  emptyAnswers?: number;
  timeSpent?: number;
}

export default function StudentUjianPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"upcoming" | "history">("upcoming");

  const upcomingExams: ExamSession[] = [
    {
      id: "1",
      name: "PTS Matematika",
      package: "Paket Reguler",
      subject: "Matematika",
      startTime: "2026-06-02T07:00:00Z",
      endTime: "2026-06-02T09:00:00Z",
      duration: 120,
      totalQuestions: 40,
      status: "belum",
    },
    {
      id: "2",
      name: "PTS Fisika",
      package: "Paket Reguler",
      subject: "Fisika",
      startTime: "2026-06-03T08:00:00Z",
      endTime: "2026-06-03T09:30:00Z",
      duration: 90,
      totalQuestions: 35,
      status: "belum",
    },
  ];

  const historyExams: ExamSession[] = [
    {
      id: "3",
      name: "UH Bab 1 Aljabar",
      package: "Paket Khusus",
      subject: "Matematika",
      startTime: "2026-05-20T10:00:00Z",
      endTime: "2026-05-20T11:30:00Z",
      duration: 90,
      totalQuestions: 30,
      status: "selesai",
      score: 82,
      correctAnswers: 25,
      wrongAnswers: 4,
      emptyAnswers: 1,
      timeSpent: 75,
    },
    {
      id: "4",
      name: "UH Bab 2 Geometri",
      package: "Paket Khusus",
      subject: "Matematika",
      startTime: "2026-05-25T10:00:00Z",
      endTime: "2026-05-25T11:30:00Z",
      duration: 90,
      totalQuestions: 30,
      status: "selesai",
      score: 78,
      correctAnswers: 23,
      wrongAnswers: 6,
      emptyAnswers: 1,
      timeSpent: 85,
    },
    {
      id: "5",
      name: "Kuis Cepat Vektor",
      package: "Paket Cepat",
      subject: "Matematika",
      startTime: "2026-05-22T13:00:00Z",
      endTime: "2026-05-22T13:30:00Z",
      duration: 30,
      totalQuestions: 15,
      status: "selesai",
      score: 88,
      correctAnswers: 14,
      wrongAnswers: 1,
      emptyAnswers: 0,
      timeSpent: 28,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "belum":
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
      case "sedang":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
      case "selesai":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "tidak_hadir":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      default:
        return "";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "belum":
        return "Belum Mulai";
      case "sedang":
        return "Sedang Berlangsung";
      case "selesai":
        return "Selesai";
      case "tidak_hadir":
        return "Tidak Hadir";
      default:
        return "";
    }
  };

  const handleStartExam = (sessionId: string) => {
    router.push(`/student/ujian/${sessionId}/konfirmasi`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ujian CBT/CAT</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Daftar ujian yang sudah ditugaskan untuk kamu
        </p>
      </div>

      {/* Stats Overview */}
      {historyExams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ujian Selesai</CardTitle>
              <Award className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{historyExams.length}</div>
              <p className="text-xs text-gray-500">Total ujian</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rata-rata Nilai</CardTitle>
              <BarChart3 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(historyExams.reduce((sum, e) => sum + (e.score || 0), 0) / historyExams.length).toFixed(1)}
              </div>
              <p className="text-xs text-gray-500">Dari {historyExams.length} ujian</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tertinggi</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.max(...historyExams.map(e => e.score || 0))}
              </div>
              <p className="text-xs text-gray-500">Nilai maksimal</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ujian Mendatang</CardTitle>
              <Calendar className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingExams.length}</div>
              <p className="text-xs text-gray-500">Menunggu</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`px-4 py-2 font-medium transition ${
            activeTab === "upcoming"
              ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
          }`}
        >
          Mendatang ({upcomingExams.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 font-medium transition ${
            activeTab === "history"
              ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
          }`}
        >
          Riwayat ({historyExams.length})
        </button>
      </div>

      {/* Exam List */}
      <div className="space-y-4">
        {activeTab === "upcoming" &&
          upcomingExams.map((exam) => (
            <Card key={exam.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        {exam.name}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(exam.status)}`}>
                        {getStatusLabel(exam.status)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{exam.package}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(exam.startTime).toLocaleDateString("id-ID", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                        {" "}
                        {new Date(exam.startTime).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {exam.duration} menit
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {exam.totalQuestions} soal
                      </div>
                    </div>
                  </div>

                  <Button onClick={() => handleStartExam(exam.id)}>
                    Mulai Ujian
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

        {activeTab === "history" &&
          historyExams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-md transition">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  <div className="md:col-span-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{exam.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{exam.subject}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(exam.startTime).toLocaleDateString("id-ID")}
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {exam.score}
                    </div>
                    <p className="text-xs text-gray-500">Nilai</p>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Benar:</span>
                      <span className="font-medium text-green-600">{exam.correctAnswers}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Salah:</span>
                      <span className="font-medium text-red-600">{exam.wrongAnswers}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Kosong:</span>
                      <span className="font-medium text-gray-600">{exam.emptyAnswers}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/student/ujian/${exam.id}/hasil`)}
                    >
                      Detail
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/student/ujian/${exam.id}/review`)}
                    >
                      Review
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

        {activeTab === "upcoming" && upcomingExams.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              <p>Tidak ada ujian yang akan datang</p>
            </CardContent>
          </Card>
        )}

        {activeTab === "history" && historyExams.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              <p>Belum ada riwayat ujian</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
