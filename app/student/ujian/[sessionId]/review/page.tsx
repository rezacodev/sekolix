"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, Volume2 } from "lucide-react";

interface Question {
  number: number;
  type: string;
  content: string;
  userAnswer?: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  score: number;
  maxScore: number;
}

export default function ReviewPage({ params }: { params: { sessionId: string } }) {
  const router = useRouter();
  const sessionId = params.sessionId;
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(0);

  // Mock data - replace dengan API call
  const questions: Question[] = [
    {
      number: 1,
      type: "PG",
      content: "Hasil dari 2 + 2 = ?",
      userAnswer: "4",
      correctAnswer: "4",
      isCorrect: true,
      explanation: "2 + 2 sama dengan 4. Jawaban Anda benar.",
      score: 2.5,
      maxScore: 2.5,
    },
    {
      number: 2,
      type: "PG",
      content: "Hasil dari 3 × 4 = ?",
      userAnswer: "10",
      correctAnswer: "12",
      isCorrect: false,
      explanation:
        "3 × 4 = 12. Anda menjawab 10, yang merupakan jawaban yang tidak benar. Ingat bahwa perkalian adalah penjumlahan berulang: 4 + 4 + 4 = 12.",
      score: 0,
      maxScore: 2.5,
    },
    {
      number: 3,
      type: "ISIAN",
      content: "Berapa nilai dari √16?",
      userAnswer: "4",
      correctAnswer: "4",
      isCorrect: true,
      explanation: "Akar kuadrat dari 16 adalah 4, karena 4 × 4 = 16. Jawaban Anda benar.",
      score: 2.5,
      maxScore: 2.5,
    },
    {
      number: 4,
      type: "BS",
      content: "Benar atau Salah: 5² = 25?",
      userAnswer: "Benar",
      correctAnswer: "Benar",
      isCorrect: true,
      explanation: "5² = 5 × 5 = 25, pernyataan ini benar. Jawaban Anda benar.",
      score: 2.5,
      maxScore: 2.5,
    },
  ];

  const correctCount = questions.filter((q) => q.isCorrect).length;
  const totalScore = questions.reduce((sum, q) => sum + q.score, 0);
  const maxTotalScore = questions.reduce((sum, q) => sum + q.maxScore, 0);

  const toggleExpand = (idx: number) => {
    setExpandedQuestion(expandedQuestion === idx ? null : idx);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Review Jawaban</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">PTS Matematika</p>
      </div>

      {/* Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {correctCount}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Jawaban Benar</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {questions.length - correctCount}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Jawaban Salah</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {totalScore.toFixed(1)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Skor ({maxTotalScore.toFixed(1)})
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950">
        <CardContent className="pt-6 text-sm text-amber-900 dark:text-amber-200">
          <p>
            💡 Review jawaban membantu Anda memahami soal-soal yang masih kurang dikuasai. Gunakan
            informasi ini untuk belajar lebih baik ke depannya.
          </p>
        </CardContent>
      </Card>

      {/* Questions Review */}
      <div className="space-y-3">
        {questions.map((q, idx) => (
          <Card
            key={idx}
            className={`cursor-pointer transition ${
              expandedQuestion === idx
                ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950"
                : ""
            }`}
          >
            <div
              onClick={() => toggleExpand(idx)}
              className="p-4 flex items-start justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  {q.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  )}

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Soal No. {q.number} ({q.type})
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{q.content}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right min-w-[60px]">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {q.score.toFixed(1)}/{q.maxScore.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">poin</div>
                </div>

                {expandedQuestion === idx ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>

            {/* Expanded Content */}
            {expandedQuestion === idx && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
                {/* Your Answer */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">
                    Jawaban Anda:
                  </h4>
                  <p
                    className={`text-sm font-medium ${
                      q.isCorrect
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {q.userAnswer}
                  </p>
                </div>

                {/* Correct Answer (if wrong) */}
                {!q.isCorrect && (
                  <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">
                      Jawaban yang Benar:
                    </h4>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      {q.correctAnswer}
                    </p>
                  </div>
                )}

                {/* Explanation */}
                <div>
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">
                    📚 Penjelasan:
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {q.explanation}
                  </p>
                </div>

                {/* Score Info */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Skor perolehan:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {q.score.toFixed(1)} / {q.maxScore.toFixed(1)}
                  </span>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center pt-4">
        <Button variant="outline" onClick={() => router.push(`/student/ujian/${sessionId}/hasil`)}>
          Kembali ke Hasil
        </Button>
        <Button onClick={() => router.push("/student/ujian")}>
          Kembali ke Daftar Ujian
        </Button>
      </div>
    </div>
  );
}
