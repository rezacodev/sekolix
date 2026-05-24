"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus,
  Search
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { QuestionForm } from "./components/QuestionForm";
import { QuestionPreview } from "./components/QuestionPreview";
import { QuestionList } from "./components/QuestionList";
import { QuestionStats } from "./components/QuestionStats";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

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

export default function BankSoalPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: session } = useSession();
  const [questions, setQuestions] = useState<QuestionBank[]>([]);
  const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCognitiveLevel, setSelectedCognitiveLevel] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionBank | null>(null);
  const [previewQuestion, setPreviewQuestion] = useState<QuestionBank | null>(null);

  // Fetch questions from API
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (selectedSubject !== "all") params.append("subject_id", selectedSubject);
      if (selectedDifficulty !== "all") params.append("difficulty", selectedDifficulty);
      if (selectedType !== "all") params.append("question_type", selectedType);
      if (selectedCognitiveLevel !== "all") params.append("cognitive_level", selectedCognitiveLevel);
      if (searchTerm.trim()) params.append("search", searchTerm.trim());

      const response = await fetch(`/api/teacher/bank-soal?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }

      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError("Gagal memuat data soal");
      toast.error("Gagal memuat data soal");
    } finally {
      setLoading(false);
    }
  };

  // Fetch subjects for filter dropdown
  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/teacher/subjects");
      if (response.ok) {
        const data = await response.json();
        setSubjects(data.subjects || []);
      }
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (isAuthenticated && session?.user?.staffRole === "TEACHER") {
      fetchSubjects();
      fetchQuestions();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading, session]);

  // Refetch when filters change
  useEffect(() => {
    if (isAuthenticated && session?.user?.staffRole === "TEACHER") {
      fetchQuestions();
    }
  }, [selectedSubject, selectedDifficulty, selectedType, selectedCognitiveLevel, searchTerm]);

  const handleCreateQuestion = () => {
    router.push("/teacher/ujian/bank-soal/new");
  };

  const handleEditQuestion = (question: QuestionBank) => {
    router.push(`/teacher/ujian/bank-soal/${question.id}/edit`);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus soal ini?")) return;

    try {
      const response = await fetch(`/api/teacher/bank-soal/${questionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete question");
      }

      setQuestions(questions.filter(q => q.id !== questionId));
      toast.success("Soal berhasil dihapus");
    } catch (err) {
      console.error("Error deleting question:", err);
      toast.error("Gagal menghapus soal");
    }
  };

  const handlePreviewQuestion = (question: QuestionBank) => {
    setPreviewQuestion(question);
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized message if not authenticated or not a teacher
  if (!isAuthenticated || session?.user?.staffRole !== "TEACHER") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">Akses Ditolak</h2>
          <p className="mt-2 text-muted-foreground">
            Anda tidak memiliki akses ke halaman ini.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bank Soal</h1>
          <p className="text-muted-foreground">
            Kelola koleksi soal untuk ujian dan penilaian
          </p>
        </div>
        <Button onClick={handleCreateQuestion} className="gap-2">
          <Plus className="h-4 w-4" />
          Buat Soal Baru
        </Button>
      </div>

      {/* Stats Cards */}
      <QuestionStats questions={questions} />

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter & Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari soal, tag, atau topik..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Mata Pelajaran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Mapel</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id.toString()}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Kesulitan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Level</SelectItem>
                <SelectItem value="MUDAH">Mudah</SelectItem>
                <SelectItem value="SEDANG">Sedang</SelectItem>
                <SelectItem value="SULIT">Sulit</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipe Soal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="MULTIPLE_CHOICE">Pilihan Ganda</SelectItem>
                <SelectItem value="TRUE_FALSE">Benar/Salah</SelectItem>
                <SelectItem value="SHORT_ANSWER">Jawaban Singkat</SelectItem>
                <SelectItem value="ESSAY">Essay</SelectItem>
                <SelectItem value="MATCHING">Pencocokkan</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCognitiveLevel} onValueChange={setSelectedCognitiveLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Tingkat Kognitif" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Level</SelectItem>
                <SelectItem value="MENGINGAT">Mengingat</SelectItem>
                <SelectItem value="MEMAHAMI">Memahami</SelectItem>
                <SelectItem value="MENERAPKAN">Menerapkan</SelectItem>
                <SelectItem value="MENGANALISIS">Menganalisis</SelectItem>
                <SelectItem value="MENGEVALUASI">Mengevaluasi</SelectItem>
                <SelectItem value="MENCIPTAKAN">Menciptakan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Question List */}
      <QuestionList
        questions={questions}
        loading={loading}
        onEdit={handleEditQuestion}
        onDelete={handleDeleteQuestion}
        onPreview={handlePreviewQuestion}
      />

      {/* Preview Dialog */}
      <Dialog open={!!previewQuestion} onOpenChange={() => setPreviewQuestion(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preview Soal</DialogTitle>
          </DialogHeader>
          {previewQuestion && <QuestionPreview question={previewQuestion} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}