"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, TrendingUp } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  answeredQuestions: number;
  totalQuestions: number;
  isCurrentUser?: boolean;
}

export function LivescoreLeaderboard({
  sessionId,
  totalQuestions,
}: {
  sessionId: string;
  totalQuestions: number;
}) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    // Mock data - replace dengan API call real
    const mockLeaderboard: LeaderboardEntry[] = [
      {
        rank: 1,
        name: "Budi Santoso",
        score: 95,
        answeredQuestions: 40,
        totalQuestions: 40,
        isCurrentUser: false,
      },
      {
        rank: 2,
        name: "Siti Nurhaliza",
        score: 92,
        answeredQuestions: 39,
        totalQuestions: 40,
        isCurrentUser: false,
      },
      {
        rank: 3,
        name: "Anda",
        score: 85,
        answeredQuestions: 34,
        totalQuestions: 40,
        isCurrentUser: true,
      },
      {
        rank: 4,
        name: "Ahmad Wijaya",
        score: 78,
        answeredQuestions: 31,
        totalQuestions: 40,
        isCurrentUser: false,
      },
      {
        rank: 5,
        name: "Dewi Suryani",
        score: 72,
        answeredQuestions: 28,
        totalQuestions: 40,
        isCurrentUser: false,
      },
    ];

    setLeaderboard(mockLeaderboard);
    setLoading(false);

    // Polling every 15 seconds
    const interval = setInterval(() => {
      // Mock update - replace dengan API call real
      setLeaderboard((prev) =>
        prev.map((entry) => ({
          ...entry,
          score: entry.score + Math.floor(Math.random() * 3),
          answeredQuestions: Math.min(entry.answeredQuestions + 1, totalQuestions),
        }))
      );
    }, 15000);

    return () => clearInterval(interval);
  }, [sessionId, totalQuestions]);

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 border-amber-200 dark:border-amber-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          Live Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-4 text-gray-500">Loading...</div>
          ) : (
            leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={`p-3 rounded-lg flex items-center justify-between transition ${
                  entry.isCurrentUser
                    ? "bg-blue-100 dark:bg-blue-900 border-2 border-blue-300 dark:border-blue-700"
                    : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      entry.rank === 1
                        ? "bg-yellow-400 text-white"
                        : entry.rank === 2
                          ? "bg-gray-400 text-white"
                          : entry.rank === 3
                            ? "bg-orange-400 text-white"
                            : "bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100"
                    }`}
                  >
                    {entry.rank}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {entry.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {entry.answeredQuestions}/{entry.totalQuestions} soal
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-lg text-blue-600 dark:text-blue-400">
                    {entry.score}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round((entry.answeredQuestions / entry.totalQuestions) * 100)}%
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-900 dark:text-blue-200 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Update otomatis setiap 15 detik
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
