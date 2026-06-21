"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
} from "lucide-react";

interface ExamConfirmation {
  id: string;
  name: string;
  subject: string;
  duration: number;
  totalQuestions: number;
  kkm: number;
  requiresToken: boolean;
  negativeScore: boolean;
  allowReview: boolean;
  instructions: string[];
  warnings: string[];
}

export default function KonfirmasiPage({ params }: { params: { sessionId: string } }) {
  const router = useRouter();
  const sessionId = params.sessionId;
  const [token, setToken] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock data - replace dengan API call
  const exam: ExamConfirmation = {
    id: sessionId,
    name: "PTS Matematika",
    subject: "Matematika",
    duration: 120,
    totalQuestions: 40,
    kkm: 70,
    requiresToken: false,
    negativeScore: true,
    allowReview: true,
    instructions: [
      "Bacalah setiap soal dengan teliti sebelum menjawab",
      "Anda dapat mengubah jawaban sebelum waktu habis",
      "Tandai soal yang ingin ditinjau kembali untuk review kemudian",
      "Jawaban akan disimpan otomatis setiap kali Anda menjawab",
      "Jangan keluar dari browser atau menutup tab selama ujian berlangsung",
      "Sistem akan otomatis submit jika waktu habis",
    ],
    warnings: [
      "Poin negatif diterapkan untuk jawaban yang salah (-0.5 poin per soal)",
      "Anda hanya dapat mengikuti ujian ini maksimal 2 kali",
      "Keluar dari fullscreen akan dicatat sebagai peringatan",
      "Tab switch lebih dari 3 kali akan menyebabkan ujian di-lock",
    ],
  };

  const handleStartExam = async () => {
    if (!agreed) {
      alert("Anda harus setuju dengan ketentuan untuk melanjutkan");
      return;
    }

    setLoading(true);
    // Simulate API call to create attempt
    await new Promise((resolve) => setTimeout(resolve, 1000));

    router.push(`/student/ujian/${sessionId}/kerjakan`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{exam.name}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Persiapan dan Konfirmasi Ujian</p>
      </div>

      {/* Exam Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="w-8 h-8 mx-auto text-blue-500 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Durasi</p>
              <p className="text-2xl font-bold">{exam.duration}</p>
              <p className="text-xs text-gray-500">Menit</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <FileText className="w-8 h-8 mx-auto text-green-500 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Jumlah Soal</p>
              <p className="text-2xl font-bold">{exam.totalQuestions}</p>
              <p className="text-xs text-gray-500">Soal</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle2 className="w-8 h-8 mx-auto text-purple-500 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">KKM</p>
              <p className="text-2xl font-bold">{exam.kkm}</p>
              <p className="text-xs text-gray-500">Nilai</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 mx-auto text-orange-500 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Poin Negatif</p>
              <p className="text-2xl font-bold">Ya</p>
              <p className="text-xs text-gray-500">Aktif</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Instructions */}
        <div className="lg:col-span-2 space-y-4">
          {/* General Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📋 Petunjuk Umum</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {exam.instructions.map((instruction, idx) => (
                  <li key={idx} className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{instruction}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Warnings */}
          {exam.warnings.length > 0 && (
            <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-yellow-900 dark:text-yellow-200">
                  <AlertTriangle className="w-5 h-5" />
                  ⚠️ Peringatan Penting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {exam.warnings.map((warning, idx) => (
                    <li key={idx} className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-yellow-900 dark:text-yellow-200">{warning}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Token & Agreement */}
        <div className="space-y-4">
          {/* Token Input (if required) */}
          {exam.requiresToken && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🔑 Kode Akses</CardTitle>
                <CardDescription>Masukkan kode akses yang diberikan oleh guru</CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  type="password"
                  placeholder="Masukkan kode akses..."
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
              </CardContent>
            </Card>
          )}

          {/* Agreement */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">✓ Persetujuan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-5 h-5 rounded mt-1"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Saya telah membaca dan memahami semua petunjuk, serta setuju mematuhi semua ketentuan yang berlaku selama ujian.
                </span>
              </label>

              <Button
                onClick={handleStartExam}
                disabled={!agreed || loading}
                className="w-full"
                size="lg"
              >
                {loading ? "Mempersiapkan..." : "Mulai Ujian"}
              </Button>

              <Button
                variant="outline"
                onClick={() => router.back()}
                className="w-full"
                disabled={loading}
              >
                Kembali
              </Button>
            </CardContent>
          </Card>

          {/* Info Box */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Pastikan koneksi internet Anda stabil sebelum memulai ujian.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
