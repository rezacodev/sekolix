"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, Tag, Save } from "lucide-react";

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

interface QuestionFormProps {
  question?: QuestionBank | null;
  onClose: () => void;
  onSave: (question: Omit<QuestionBank, "id" | "teacher_id" | "usage_count" | "last_used_at" | "is_active" | "created_at" | "subject" | "teacher">) => Promise<QuestionBank>;
  onSaveAndBack?: (question: Omit<QuestionBank, "id" | "teacher_id" | "usage_count" | "last_used_at" | "is_active" | "created_at" | "subject" | "teacher">) => void;
  onSaveAndAddAnother?: (question: Omit<QuestionBank, "id" | "teacher_id" | "usage_count" | "last_used_at" | "is_active" | "created_at" | "subject" | "teacher">) => void;
  subjects?: { id: number; name: string }[];
  loading?: boolean;
}

export function QuestionForm({ question, onClose, onSave, onSaveAndBack, onSaveAndAddAnother, subjects = [], loading = false }: QuestionFormProps) {
  const [newTag, setNewTag] = useState("");

  // Initialize form data when question prop changes
  const initialFormData = question ? {
    subject_id: question.subject_id,
    question_type: question.question_type,
    difficulty: question.difficulty,
    cognitive_level: question.cognitive_level,
    question_text: question.question_text,
    options: question.options || ["", "", "", ""],
    correct_answer: question.correct_answer,
    explanation: question.explanation || "",
    tags: question.tags,
    topic: question.topic || "",
  } : {
    subject_id: 1,
    question_type: "MULTIPLE_CHOICE",
    difficulty: "SEDANG",
    cognitive_level: "MEMAHAMI",
    question_text: "",
    options: ["", "", "", ""],
    correct_answer: "",
    explanation: "",
    tags: [] as string[],
    topic: "",
  };

  const [formData, setFormData] = useState(initialFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.question_text.trim()) {
      alert("Pertanyaan tidak boleh kosong");
      return;
    }

    if (formData.question_type === "MULTIPLE_CHOICE") {
      if (formData.options.some(opt => !opt.trim())) {
        alert("Semua opsi pilihan ganda harus diisi");
        return;
      }
      if (!formData.correct_answer.trim()) {
        alert("Jawaban benar harus dipilih");
        return;
      }
    }

    const questionData = {
      subject_id: formData.subject_id,
      question_type: formData.question_type,
      difficulty: formData.difficulty,
      cognitive_level: formData.cognitive_level,
      question_text: formData.question_text,
      options: formData.question_type === "MULTIPLE_CHOICE" ? formData.options : undefined,
      correct_answer: formData.correct_answer,
      explanation: formData.explanation,
      tags: formData.tags,
      topic: formData.topic,
    };

    try {
      await onSave(questionData);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleSaveAndBack = async () => {
    if (!onSaveAndBack) return;

    // Validate form
    if (!formData.question_text.trim()) {
      alert("Pertanyaan tidak boleh kosong");
      return;
    }

    if (formData.question_type === "MULTIPLE_CHOICE") {
      if (formData.options.some(opt => !opt.trim())) {
        alert("Semua opsi pilihan ganda harus diisi");
        return;
      }
      if (!formData.correct_answer.trim()) {
        alert("Jawaban benar harus dipilih");
        return;
      }
    }

    const questionData = {
      subject_id: formData.subject_id,
      question_type: formData.question_type,
      difficulty: formData.difficulty,
      cognitive_level: formData.cognitive_level,
      question_text: formData.question_text,
      options: formData.question_type === "MULTIPLE_CHOICE" ? formData.options : undefined,
      correct_answer: formData.correct_answer,
      explanation: formData.explanation,
      tags: formData.tags,
      topic: formData.topic,
    };

    onSaveAndBack(questionData);
  };

  const handleSaveAndAddAnother = async () => {
    if (!onSaveAndAddAnother) return;

    // Validate form
    if (!formData.question_text.trim()) {
      alert("Pertanyaan tidak boleh kosong");
      return;
    }

    if (formData.question_type === "MULTIPLE_CHOICE") {
      if (formData.options.some(opt => !opt.trim())) {
        alert("Semua opsi pilihan ganda harus diisi");
        return;
      }
      if (!formData.correct_answer.trim()) {
        alert("Jawaban benar harus dipilih");
        return;
      }
    }

    const questionData = {
      subject_id: formData.subject_id,
      question_type: formData.question_type,
      difficulty: formData.difficulty,
      cognitive_level: formData.cognitive_level,
      question_text: formData.question_text,
      options: formData.question_type === "MULTIPLE_CHOICE" ? formData.options : undefined,
      correct_answer: formData.correct_answer,
      explanation: formData.explanation,
      tags: formData.tags,
      topic: formData.topic,
    };

    onSaveAndAddAnother(questionData);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, ""]
    }));
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, options: newOptions }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Dasar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subject">Mata Pelajaran</Label>
              <Select
                value={formData.subject_id.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, subject_id: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="topic">Topik/Bab</Label>
              <Input
                id="topic"
                value={formData.topic}
                onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                placeholder="Contoh: Fotosintesis"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="question_type">Tipe Soal</Label>
              <Select
                value={formData.question_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, question_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MULTIPLE_CHOICE">Pilihan Ganda</SelectItem>
                  <SelectItem value="TRUE_FALSE">Benar/Salah</SelectItem>
                  <SelectItem value="SHORT_ANSWER">Jawaban Singkat</SelectItem>
                  <SelectItem value="ESSAY">Essay</SelectItem>
                  <SelectItem value="MATCHING">Pencocokkan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="difficulty">Tingkat Kesulitan</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MUDAH">Mudah</SelectItem>
                  <SelectItem value="SEDANG">Sedang</SelectItem>
                  <SelectItem value="SULIT">Sulit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cognitive_level">Tingkat Kognitif</Label>
              <Select
                value={formData.cognitive_level}
                onValueChange={(value) => setFormData(prev => ({ ...prev, cognitive_level: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MENGINGAT">Mengingat (C1)</SelectItem>
                  <SelectItem value="MEMAHAMI">Memahami (C2)</SelectItem>
                  <SelectItem value="MENERAPKAN">Menerapkan (C3)</SelectItem>
                  <SelectItem value="MENGANALISIS">Menganalisis (C4)</SelectItem>
                  <SelectItem value="MENGEVALUASI">Mengevaluasi (C5)</SelectItem>
                  <SelectItem value="MENCIPTAKAN">Menciptakan (C6)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Content */}
      <Card>
        <CardHeader>
          <CardTitle>Isi Soal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="question_text">Pertanyaan</Label>
            <Textarea
              id="question_text"
              value={formData.question_text}
              onChange={(e) => setFormData(prev => ({ ...prev, question_text: e.target.value }))}
              placeholder="Masukkan pertanyaan..."
              rows={4}
              required
            />
          </div>

          {/* Options for Multiple Choice */}
          {formData.question_type === "MULTIPLE_CHOICE" && (
            <div>
              <Label>Opsi Jawaban</Label>
              <div className="space-y-2 mt-2">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Opsi ${String.fromCharCode(65 + index)}`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant={formData.correct_answer === option ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, correct_answer: option }))}
                    >
                      {formData.correct_answer === option ? "Benar" : "Pilih"}
                    </Button>
                    {formData.options.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeOption(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Opsi
                </Button>
              </div>
            </div>
          )}

          {/* Correct Answer for other types */}
          {formData.question_type !== "MULTIPLE_CHOICE" && (
            <div>
              <Label htmlFor="correct_answer">Jawaban Benar</Label>
              {formData.question_type === "TRUE_FALSE" ? (
                <Select
                  value={formData.correct_answer}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, correct_answer: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jawaban benar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Benar">Benar</SelectItem>
                    <SelectItem value="Salah">Salah</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Textarea
                  id="correct_answer"
                  value={formData.correct_answer}
                  onChange={(e) => setFormData(prev => ({ ...prev, correct_answer: e.target.value }))}
                  placeholder="Masukkan jawaban benar..."
                  rows={2}
                />
              )}
            </div>
          )}

          <div>
            <Label htmlFor="explanation">Penjelasan (Opsional)</Label>
            <Textarea
              id="explanation"
              value={formData.explanation}
              onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
              placeholder="Berikan penjelasan untuk jawaban benar..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tag dan Kategori</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Tambah tag..."
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  <Tag className="h-3 w-3" />
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Batal
        </Button>

        {question ? (
          // Edit mode - single save button
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Simpan Perubahan
          </Button>
        ) : (
          // Create mode - multiple save options
          <>
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveAndBack}
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              Simpan & Kembali ke Index
            </Button>
            <Button
              type="button"
              onClick={handleSaveAndAddAnother}
              disabled={loading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Simpan & Tambah Lagi
            </Button>
          </>
        )}
      </div>
    </form>
  );
}