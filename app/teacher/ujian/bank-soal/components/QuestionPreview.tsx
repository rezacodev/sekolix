"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Target, Tag, CheckCircle } from "lucide-react";

interface QuestionBank {
  id: string;
  teacher_id: string;
  subject_id: number;
  question_type: string;
  difficulty: string;
  cognitive_level: string;
  question_text: string;
  options?: string[];
  correct_answer: string;
  explanation?: string;
  tags: string[];
  topic?: string;
  usage_count: number;
  last_used_at?: string;
  is_active: boolean;
  created_at: string;
  subject: {
    name: string;
  };
  teacher: {
    name: string;
  };
}

interface QuestionPreviewProps {
  question: QuestionBank;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "MUDAH": return "bg-green-100 text-green-800";
    case "SEDANG": return "bg-yellow-100 text-yellow-800";
    case "SULIT": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "MULTIPLE_CHOICE": return "bg-blue-100 text-blue-800";
    case "TRUE_FALSE": return "bg-purple-100 text-purple-800";
    case "SHORT_ANSWER": return "bg-orange-100 text-orange-800";
    case "ESSAY": return "bg-indigo-100 text-indigo-800";
    case "MATCHING": return "bg-pink-100 text-pink-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const formatQuestionType = (type: string) => {
  switch (type) {
    case "MULTIPLE_CHOICE": return "Pilihan Ganda";
    case "TRUE_FALSE": return "Benar/Salah";
    case "SHORT_ANSWER": return "Jawaban Singkat";
    case "ESSAY": return "Essay";
    case "MATCHING": return "Pencocokkan";
    default: return type;
  }
};

const formatDifficulty = (difficulty: string) => {
  switch (difficulty) {
    case "MUDAH": return "Mudah";
    case "SEDANG": return "Sedang";
    case "SULIT": return "Sulit";
    default: return difficulty;
  }
};

const formatCognitiveLevel = (level: string) => {
  switch (level) {
    case "MENGINGAT": return "Mengingat (C1)";
    case "MEMAHAMI": return "Memahami (C2)";
    case "MENERAPKAN": return "Menerapkan (C3)";
    case "MENGANALISIS": return "Menganalisis (C4)";
    case "MENGEVALUASI": return "Mengevaluasi (C5)";
    case "MENCIPTAKAN": return "Menciptakan (C6)";
    default: return level;
  }
};

export function QuestionPreview({ question }: QuestionPreviewProps) {
  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={getTypeColor(question.question_type)}>
              {formatQuestionType(question.question_type)}
            </Badge>
            <Badge variant="secondary" className={getDifficultyColor(question.difficulty)}>
              {formatDifficulty(question.difficulty)}
            </Badge>
            <Badge variant="outline">
              {formatCognitiveLevel(question.cognitive_level)}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {question.subject.name}
            {question.topic && ` • ${question.topic}`}
          </div>
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            Digunakan {question.usage_count}x
          </div>
        </div>
      </div>

      <Separator />

      {/* Question Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pertanyaan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="text-base leading-relaxed">{question.question_text}</p>
          </div>
        </CardContent>
      </Card>

      {/* Options (for Multiple Choice) */}
      {question.question_type === "MULTIPLE_CHOICE" && question.options && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Opsi Jawaban</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {question.options.map((option: string, index: number) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    option === question.correct_answer
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                    option === question.correct_answer
                      ? "bg-green-500 text-white"
                      : "bg-gray-300 text-gray-700"
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="flex-1">{option}</span>
                  {option === question.correct_answer && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Answer for other types */}
      {question.question_type !== "MULTIPLE_CHOICE" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Jawaban Benar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium">{question.correct_answer}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Explanation */}
      {question.explanation && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Penjelasan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground leading-relaxed">{question.explanation}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      {question.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {question.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  <Tag className="h-3 w-3" />
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informasi Tambahan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Dibuat oleh:</span>
              <p className="text-muted-foreground">{question.teacher.name}</p>
            </div>
            <div>
              <span className="font-medium">Dibuat pada:</span>
              <p className="text-muted-foreground">
                {new Date(question.created_at).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            {question.last_used_at && (
              <div>
                <span className="font-medium">Terakhir digunakan:</span>
                <p className="text-muted-foreground">
                  {new Date(question.last_used_at).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
            <div>
              <span className="font-medium">Status:</span>
              <p className={`font-medium ${question.is_active ? 'text-green-600' : 'text-red-600'}`}>
                {question.is_active ? 'Aktif' : 'Tidak Aktif'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}