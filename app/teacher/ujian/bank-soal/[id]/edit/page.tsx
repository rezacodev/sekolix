"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { QuestionForm } from "../../components/QuestionForm";
import { useAuth } from "@/hooks/useAuth";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

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

export default function EditQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: session } = useSession();
  const [question, setQuestion] = useState<QuestionBank | null>(null);
  const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const questionId = params.id as string;

  // Fetch question data
  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/teacher/bank-soal/${questionId}`);

      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Soal tidak ditemukan");
          router.push("/teacher/ujian/bank-soal");
          return;
        }
        throw new Error("Failed to fetch question");
      }

      const data = await response.json();
      setQuestion(data.question);
    } catch (err) {
      console.error("Error fetching question:", err);
      toast.error("Gagal memuat data soal");
      router.push("/teacher/ujian/bank-soal");
    } finally {
      setLoading(false);
    }
  };

  // Fetch subjects for dropdown
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
    if (isAuthenticated && session?.user?.staffRole === "TEACHER" && questionId) {
      fetchSubjects();
      fetchQuestion();
    }
  }, [isAuthenticated, session, questionId]);

  const handleSaveQuestion = async (questionData: Omit<QuestionBank, "id" | "teacher_id" | "usage_count" | "last_used_at" | "is_active" | "created_at" | "subject" | "teacher">) => {
    try {
      setSaving(true);

      const response = await fetch(`/api/teacher/bank-soal/${questionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(questionData),
      });

      if (!response.ok) {
        throw new Error("Failed to update question");
      }

      const data = await response.json();
      setQuestion(data.question);
      toast.success("Soal berhasil diperbarui");
      return data.question;
    } catch (err) {
      console.error("Error saving question:", err);
      toast.error("Gagal menyimpan soal");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Show loading state while checking authentication
  if (authLoading || loading) {
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

  // Show not found if question doesn't exist
  if (!question) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">Soal Tidak Ditemukan</h2>
          <p className="mt-2 text-muted-foreground">
            Soal yang Anda cari tidak ditemukan.
          </p>
          <Button
            onClick={() => router.push("/teacher/ujian/bank-soal")}
            className="mt-4"
          >
            Kembali ke Bank Soal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/teacher/ujian/bank-soal")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Soal</h1>
            <p className="text-muted-foreground">
              Edit detail soal yang dipilih
            </p>
          </div>
        </div>
      </div>

      {/* Question Form */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Soal</CardTitle>
        </CardHeader>
        <CardContent>
          <QuestionForm
            question={question}
            onClose={() => router.push("/teacher/ujian/bank-soal")}
            onSave={handleSaveQuestion}
            subjects={subjects}
            loading={saving}
          />
        </CardContent>
      </Card>
    </div>
  );
}