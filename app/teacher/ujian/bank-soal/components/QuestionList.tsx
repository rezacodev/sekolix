"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Edit,
  Trash2,
  Eye,
  BookOpen,
  Target,
  Brain,
  Tag,
  MoreHorizontal,
  Clock,
  User
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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

interface QuestionListProps {
  questions: QuestionBank[];
  loading: boolean;
  onEdit: (question: QuestionBank) => void;
  onDelete: (questionId: string) => void;
  onPreview: (question: QuestionBank) => void;
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

export function QuestionList({ questions, loading, onEdit, onDelete, onPreview }: QuestionListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Belum ada soal</h3>
          <p className="text-muted-foreground text-center mb-4">
            Belum ada soal yang dibuat. Mulai buat soal pertama Anda.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {questions.map((question) => (
        <Card key={question.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-sm font-medium line-clamp-2 mb-2">
                  {question.question_text}
                </CardTitle>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  {question.teacher.name}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onPreview(question)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(question)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(question.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Hapus
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="space-y-3">
              {/* Badges */}
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className={getTypeColor(question.question_type)}>
                  {formatQuestionType(question.question_type)}
                </Badge>
                <Badge variant="secondary" className={getDifficultyColor(question.difficulty)}>
                  {formatDifficulty(question.difficulty)}
                </Badge>
              </div>

              {/* Cognitive Level */}
              <div className="flex items-center gap-2">
                <Brain className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {formatCognitiveLevel(question.cognitive_level)}
                </span>
              </div>

              {/* Subject and Topic */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{question.subject.name}</span>
                  {question.topic && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{question.topic}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Usage Stats */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Digunakan {question.usage_count}x
                  </span>
                </div>
                {question.last_used_at && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {new Date(question.last_used_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {question.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {question.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <Tag className="h-2 w-2 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                  {question.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{question.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}