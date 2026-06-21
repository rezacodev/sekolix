"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  BarChart3,
  Trophy,
  TrendingUp,
  Bookmark,
} from "lucide-react";

interface ExamResult {
  sessionId: string;
  name: string;
  subject: string;
  finalScore: number;
  kkm: number;
  status: "tuntas" | "belum_tuntas";
  correctAnswers: number;
  wrongAnswers: number;
  emptyAnswers: number;
  totalQuestions: number;
  duration: number;
  timeSpent: number;
  ranking?: number;
  totalParticipants?: number;
}

export default function HasilPage({ params }: { params: { sessionId: string } }) {
  const router = useRouter();
  const sessionId = params.sessionId;

  // Mock data - replace dengan API call
  const result: ExamResult = {
    sessionId: sessionId,
    name: "PTS Matematika",
    subject: "Matematika",
    finalScore: 82,
    kkm: 70,
    status: "tuntas",
    correctAnswers: 33,
    wrongAnswers: 5,
    emptyAnswers: 2,
    totalQuestions: 40,
    duration: 120,
    timeSpent: 95,
    ranking: 5,
    totalParticipants: 32,
  };

  const percentage = Math.round((result.correctAnswers / result.totalQuestions) * 100);
  const scorePercentage = Math.round((result.finalScore / 100) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hasil Ujian</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{result.name}</p>
      </div>

      {/* Score Card */}
      <Card
        className={`border-2 ${
          result.status === "tuntas"
            ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950"
            : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950"
        }`}
      >
        <CardContent className="pt-8">
          <div className="text-center space-y-6">
            {/* Score Display */}
            <div>
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8 bg-white dark:bg-gray-800 border-blue-500">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">{result.finalScore}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">dari 100</div>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-center gap-2">
              {result.status === "tuntas" ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                    TUNTAS ✓
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  <span className="text-xl font-bold text-red-600 dark:text-red-400">
                    BELUM TUNTAS
                  </span>
                </>
              )}
            </div>

            {/* KKM Info */}
            <div className="text-sm">
              <p className="text-gray-700 dark:text-gray-300">
                KKM: <span className="font-semibold">{result.kkm}</span> |{" "}
                <span className={result.finalScore >= result.kkm ? "text-green-600" : "text-red-600"}>
                  {result.finalScore >= result.kkm ? "Melampaui KKM" : "Kurang dari KKM"}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Benar</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{result.correctAnswers}</div>
            <p className="text-xs text-gray-500">{percentage}% soal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salah</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{result.wrongAnswers}</div>
            <p className="text-xs text-gray-500">jawaban</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kosong</CardTitle>
            <HelpCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{result.emptyAnswers}</div>
            <p className="text-xs text-gray-500">jawaban</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waktu Tempuh</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{result.timeSpent}</div>
            <p className="text-xs text-gray-500">dari {result.duration} menit</p>
          </CardContent>
        </Card>

        {result.ranking && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ranking</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">#{result.ranking}</div>
              <p className="text-xs text-gray-500">dari {result.totalParticipants}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Score Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Breakdown Jawaban</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                label: "Jawaban Benar",
                value: result.correctAnswers,
                total: result.totalQuestions,
                color: "bg-green-500",
              },
              {
                label: "Jawaban Salah",
                value: result.wrongAnswers,
                total: result.totalQuestions,
                color: "bg-red-500",
              },
              {
                label: "Tidak Dijawab",
                value: result.emptyAnswers,
                total: result.totalQuestions,
                color: "bg-yellow-500",
              },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {item.label}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.value} / {item.total}
                  </span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color}`}
                    style={{ width: `${(item.value / item.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              💡 Ujian Anda sudah dikirim. Guru akan melakukan koreksi untuk soal uraian (jika ada).
              Hasil akhir akan tersedia dalam waktu 1-2 hari kerja.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tips Perbaikan</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p>✓ Pelajari kembali materi yang belum dikuasai</p>
            <p>✓ Latih soal-soal serupa untuk persiapan ujian berikutnya</p>
            <p>✓ Diskusikan dengan guru untuk pembahasan soal yang sulit</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center pt-4">
        <Button
          variant="outline"
          onClick={() => router.push(`/student/ujian/${sessionId}/review`)}
        >
          <Bookmark className="w-4 h-4 mr-2" />
          Review Jawaban
        </Button>
        <Button onClick={() => router.push("/student/ujian")}>
          Kembali ke Daftar Ujian
        </Button>
      </div>
    </div>
  );
}
