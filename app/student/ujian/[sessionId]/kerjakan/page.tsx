"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
  AlertTriangle,
  Loader,
  Eye,
  EyeOff,
  Zap,
} from "lucide-react";
import { LivescoreLeaderboard } from "@/components/student/LivescoreLeaderboard";

interface Question {
  id: string;
  number: number;
  type: "PG" | "PGJ" | "BS" | "ISIAN";
  content: string;
  options?: { id: string; text: string }[];
  stimulus?: string;
  answered: boolean;
  marked: boolean;
  userAnswer?: string | string[];
}

interface ExamState {
  currentQuestion: number;
  answers: Record<string, any>;
  marked: Set<string>;
  timeRemaining: number;
  totalTime: number;
  autoSaving: boolean;
  saveStatus: "saved" | "saving" | "error";
}

export default function KerjakanPage({ params }: { params: { sessionId: string } }) {
  const router = useRouter();
  const sessionId = params.sessionId;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [state, setState] = useState<ExamState>({
    currentQuestion: 0,
    answers: {},
    marked: new Set(),
    timeRemaining: 7200, // 120 minutes
    totalTime: 7200,
    autoSaving: false,
    saveStatus: "saved",
  });
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [tabSwitches, setTabSwitches] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const visibilityRef = useRef<any>(null);

  // Mock questions - replace dengan API call
  useEffect(() => {
    const mockQuestions: Question[] = [
      {
        id: "1",
        number: 1,
        type: "PG",
        content: "Hasil dari 2 + 2 = ?",
        options: [
          { id: "a", text: "3" },
          { id: "b", text: "4" },
          { id: "c", text: "5" },
          { id: "d", text: "6" },
        ],
        answered: false,
        marked: false,
      },
      {
        id: "2",
        number: 2,
        type: "PG",
        content: "Hasil dari 3 × 4 = ?",
        options: [
          { id: "a", text: "7" },
          { id: "b", text: "10" },
          { id: "c", text: "12" },
          { id: "d", text: "15" },
        ],
        answered: false,
        marked: false,
      },
      {
        id: "3",
        number: 3,
        type: "ISIAN",
        content: "Berapa nilai dari √16?",
        answered: false,
        marked: false,
      },
      {
        id: "4",
        number: 4,
        type: "BS",
        content: "Benar atau Salah: 5² = 25?",
        answered: false,
        marked: false,
      },
    ];
    setQuestions(mockQuestions);
  }, []);

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setState((prev) => ({
        ...prev,
        timeRemaining: Math.max(0, prev.timeRemaining - 1),
      }));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Auto-save answers
  useEffect(() => {
    autoSaveRef.current = setInterval(() => {
      setState((prev) => ({ ...prev, saveStatus: "saving" }));
      // Simulate save
      setTimeout(() => {
        setState((prev) => ({ ...prev, saveStatus: "saved" }));
      }, 500);
    }, 10000);

    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, []);

  // Tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches((prev) => prev + 1);
        // Lock exam jika lebih dari 3x
        if (tabSwitches >= 2) {
          alert("Ujian Anda dikunci karena keluar dari halaman ujian terlalu sering!");
          router.push("/student/ujian");
        }
      }
    };

    visibilityRef.current = handleVisibilityChange;
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [tabSwitches, router]);

  // Fullscreen enforcement
  useEffect(() => {
    const requestFullscreen = async () => {
      try {
        if (!showFullscreen) {
          await document.documentElement.requestFullscreen();
          setShowFullscreen(true);
        }
      } catch (err) {
        console.log("Fullscreen not supported");
      }
    };

    requestFullscreen();
  }, []);

  const currentQ = questions[state.currentQuestion];
  const progress = Math.round(((state.currentQuestion + 1) / questions.length) * 100);
  const minutes = Math.floor(state.timeRemaining / 60);
  const seconds = state.timeRemaining % 60;
  const timeWarning = state.timeRemaining < 300;

  const handleAnswer = (answer: any) => {
    const newState = { ...state };
    newState.answers[currentQ.id] = answer;

    const updatedQuestions = questions.map((q) =>
      q.id === currentQ.id ? { ...q, answered: !!answer } : q
    );

    setQuestions(updatedQuestions);
    setState(newState);
  };

  const toggleMark = () => {
    const newMarked = new Set(state.marked);
    if (newMarked.has(currentQ.id)) {
      newMarked.delete(currentQ.id);
    } else {
      newMarked.add(currentQ.id);
    }
    setState((prev) => ({ ...prev, marked: newMarked }));
  };

  const handleNavigate = (direction: "prev" | "next") => {
    if (direction === "prev" && state.currentQuestion > 0) {
      setState((prev) => ({ ...prev, currentQuestion: prev.currentQuestion - 1 }));
    } else if (direction === "next" && state.currentQuestion < questions.length - 1) {
      setState((prev) => ({ ...prev, currentQuestion: prev.currentQuestion + 1 }));
    }
  };

  const handleJumpToQuestion = (index: number) => {
    setState((prev) => ({ ...prev, currentQuestion: index }));
  };

  const handleSubmit = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menyelesaikan ujian ini?")) return;

    // Submit answers
    router.push(`/student/ujian/${sessionId}/hasil`);
  };

  if (!currentQ) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-gray-900 dark:text-white">PTS Matematika</h1>
          <p className="text-xs text-gray-500">{state.currentQuestion + 1} dari {questions.length}</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Save Status */}
          <div className="text-xs">
            {state.saveStatus === "saving" && (
              <span className="text-yellow-600 dark:text-yellow-400">Menyimpan...</span>
            )}
            {state.saveStatus === "saved" && (
              <span className="text-green-600 dark:text-green-400">✓ Tersimpan</span>
            )}
          </div>

          {/* Timer */}
          <div
            className={`px-4 py-2 rounded-lg font-mono font-bold ${
              timeWarning
                ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
            }`}
          >
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>

          {/* Submit Button */}
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
            <Send className="w-4 h-4 mr-2" />
            Selesai
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar - Question Palette */}
        <div className="hidden md:flex md:w-32 lg:w-40 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col p-4 max-h-[calc(100vh-80px)] overflow-y-auto">
          <h3 className="font-semibold text-sm mb-3 text-gray-900 dark:text-white">
            Nomor Soal
          </h3>
          <div className="grid grid-cols-4 lg:grid-cols-4 gap-2">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => handleJumpToQuestion(idx)}
                className={`aspect-square rounded font-semibold text-xs flex items-center justify-center transition ${
                  state.currentQuestion === idx
                    ? "ring-2 ring-blue-500 bg-blue-500 text-white"
                    : state.marked.has(q.id)
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200"
                    : q.answered
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {q.number}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gray-100 dark:bg-gray-700"></div>
              <span className="text-gray-600 dark:text-gray-400">Belum</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-900"></div>
              <span className="text-gray-600 dark:text-gray-400">Dijawab</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-yellow-100 dark:bg-yellow-900"></div>
              <span className="text-gray-600 dark:text-gray-400">Ditandai</span>
            </div>
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 p-6 max-h-[calc(100vh-80px)] overflow-y-auto">
          <Card className="mb-6">
            <CardContent className="pt-6 space-y-4">
              {/* Question Header */}
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Soal No. {currentQ.number}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={toggleMark}
                      className={`p-2 rounded-lg transition ${
                        state.marked.has(currentQ.id)
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                      title="Tandai untuk ditinjau"
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Question Type Badge */}
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded text-xs font-medium">
                  {currentQ.type}
                </span>
              </div>

              {/* Question Content */}
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                  {currentQ.content}
                </p>
              </div>

              {/* Answer Options */}
              <div className="space-y-2 mt-6">
                {currentQ.type === "PG" && currentQ.options && (
                  <div className="space-y-2">
                    {currentQ.options.map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition ${
                          state.answers[currentQ.id] === opt.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                      >
                        <input
                          type="radio"
                          name={currentQ.id}
                          value={opt.id}
                          checked={state.answers[currentQ.id] === opt.id}
                          onChange={() => handleAnswer(opt.id)}
                          className="w-4 h-4"
                        />
                        <span className="text-gray-900 dark:text-white">{opt.text}</span>
                      </label>
                    ))}
                  </div>
                )}

                {currentQ.type === "BS" && (
                  <div className="space-y-2">
                    {[
                      { id: "b", text: "Benar" },
                      { id: "s", text: "Salah" },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition ${
                          state.answers[currentQ.id] === opt.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name={currentQ.id}
                          value={opt.id}
                          checked={state.answers[currentQ.id] === opt.id}
                          onChange={() => handleAnswer(opt.id)}
                          className="w-4 h-4"
                        />
                        <span className="text-gray-900 dark:text-white">{opt.text}</span>
                      </label>
                    ))}
                  </div>
                )}

                {currentQ.type === "ISIAN" && (
                  <input
                    type="text"
                    placeholder="Ketik jawaban Anda..."
                    value={state.answers[currentQ.id] || ""}
                    onChange={(e) => handleAnswer(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex gap-4 justify-between items-center">
            <Button
              variant="outline"
              onClick={() => handleNavigate("prev")}
              disabled={state.currentQuestion === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Sebelumnya
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Soal {state.currentQuestion + 1} dari {questions.length}
              </p>
              <div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            <Button
              onClick={() => handleNavigate("next")}
              disabled={state.currentQuestion === questions.length - 1}
              className="gap-2"
            >
              Berikutnya
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Time Warning */}
      {timeWarning && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          <span>Waktu Anda akan segera habis!</span>
        </div>
      )}
    </div>
  );
}
