"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
import { QuestionForm } from "../components/QuestionForm";
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

export default function NewQuestionPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: session } = useSession();
  const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

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
    if (isAuthenticated && session?.user?.staffRole === "TEACHER") {
      fetchSubjects();
    }
  }, [isAuthenticated, session]);

  const handleSaveQuestion = async (questionData: Omit<QuestionBank, "id" | "teacher_id" | "usage_count" | "last_used_at" | "is_active" | "created_at" | "subject" | "teacher">) => {
    try {
      setLoading(true);

      const response = await fetch("/api/teacher/bank-soal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(questionData),
      });

      if (!response.ok) {
        throw new Error("Failed to create question");
      }

      const data = await response.json();
      toast.success("Soal berhasil dibuat");
      return data.question;
    } catch (err) {
      console.error("Error saving question:", err);
      toast.error("Gagal menyimpan soal");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndBack = async (questionData: Omit<QuestionBank, "id" | "teacher_id" | "usage_count" | "last_used_at" | "is_active" | "created_at" | "subject" | "teacher">) => {
    try {
      await handleSaveQuestion(questionData);
      router.push("/teacher/ujian/bank-soal");
    } catch (err) {
      // Error sudah ditangani di handleSaveQuestion
    }
  };

  const handleSaveAndAddAnother = async (questionData: Omit<QuestionBank, "id" | "teacher_id" | "usage_count" | "last_used_at" | "is_active" | "created_at" | "subject" | "teacher">) => {
    try {
      await handleSaveQuestion(questionData);
      // Reset form by reloading the page
      window.location.reload();
    } catch (err) {
      // Error sudah ditangani di handleSaveQuestion
    }
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
            <h1 className="text-3xl font-bold tracking-tight">Buat Soal Baru</h1>
            <p className="text-muted-foreground">
              Buat soal baru untuk bank soal
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
            question={null}
            onClose={() => router.push("/teacher/ujian/bank-soal")}
            onSave={handleSaveQuestion}
            onSaveAndBack={handleSaveAndBack}
            onSaveAndAddAnother={handleSaveAndAddAnother}
            subjects={subjects}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}