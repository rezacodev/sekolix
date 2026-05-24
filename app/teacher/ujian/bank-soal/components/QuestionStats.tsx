"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Target, Brain, TrendingUp } from "lucide-react";

interface QuestionBank {
  id: string;
  question_type: string;
  difficulty: string;
  cognitive_level: string;
  usage_count: number;
  is_active: boolean;
}

interface QuestionStatsProps {
  questions: QuestionBank[];
}

export function QuestionStats({ questions }: QuestionStatsProps) {
  const totalQuestions = questions.length;
  const activeQuestions = questions.filter(q => q.is_active).length;
  const totalUsage = questions.reduce((sum, q) => sum + q.usage_count, 0);

  // Calculate difficulty distribution
  const difficultyStats = questions.reduce((acc, q) => {
    acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate type distribution
  const typeStats = questions.reduce((acc, q) => {
    acc[q.question_type] = (acc[q.question_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stats = [
    {
      title: "Total Soal",
      value: totalQuestions,
      description: `${activeQuestions} soal aktif`,
      icon: BookOpen,
      color: "text-blue-600"
    },
    {
      title: "Total Penggunaan",
      value: totalUsage,
      description: "Kali digunakan di ujian",
      icon: Target,
      color: "text-green-600"
    },
    {
      title: "Tipe Soal Terbanyak",
      value: Object.keys(typeStats).length > 0 ? Object.keys(typeStats).reduce((a, b) => typeStats[a] > typeStats[b] ? a : b) : "N/A",
      description: `${Math.max(...Object.values(typeStats))} soal`,
      icon: Brain,
      color: "text-purple-600"
    },
    {
      title: "Rata-rata Kesulitan",
      value: Object.keys(difficultyStats).length > 0 ? Object.keys(difficultyStats).reduce((a, b) => difficultyStats[a] > difficultyStats[b] ? a : b) : "N/A",
      description: "Level dominan",
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}