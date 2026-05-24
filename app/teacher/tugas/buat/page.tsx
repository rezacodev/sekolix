"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface TeacherSubject {
  id: number;
  subject_id: number;
  rombel_id: number;
  subject: { 
    id: number;
    name: string;
  };
  rombel: {
    id: number;
    name: string;
    student_count: number;
    class: { 
      id: number;
      name: string;
    };
  };
}

export default function BuatTugasPage() {
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [teacherSubjects, setTeacherSubjects] = useState<TeacherSubject[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  const [formData, setFormData] = useState({
    rombelId: "",
    subjectId: "",
    title: "",
    description: "",
    dueDate: "",
    dueTime: "",
    maxScore: "100",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch teacher subjects (rombels where teacher teaches)
  useEffect(() => {
    const searchParams = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : ""
    );
    
    const fetchTeacherSubjects = async () => {
      try {
        const response = await fetch("/api/teacher/pembelajaran/kelas-saya");
        if (!response.ok) throw new Error("Failed to fetch classes");
        const data = await response.json();
        setTeacherSubjects(data.items || []);
        
        // Auto-select if subjectId and rombelId provided in query params
        const subjectIdParam = searchParams.get("subjectId");
        const rombelIdParam = searchParams.get("rombelId");
        
        if (subjectIdParam && rombelIdParam && data.items) {
          // Find matching teacher subject
          const matchingSubject = data.items.find(
            (ts: TeacherSubject) => 
              ts.subject_id.toString() === subjectIdParam && 
              ts.rombel_id.toString() === rombelIdParam
          );
          
          if (matchingSubject) {
            setFormData(prev => ({
              ...prev,
              rombelId: matchingSubject.rombel_id.toString(),
              subjectId: matchingSubject.subject_id.toString()
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching teacher subjects:", error);
        toast.error("Gagal memuat data kelas");
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchTeacherSubjects();
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.rombelId || !formData.subjectId) {
      newErrors.rombelId = "Pilih kelas dan mata pelajaran";
    }
    if (!formData.title.trim()) {
      newErrors.title = "Judul tugas wajib diisi";
    }
    if (!formData.dueDate) {
      newErrors.dueDate = "Tanggal deadline wajib diisi";
    }
    if (!formData.dueTime) {
      newErrors.dueTime = "Waktu deadline wajib diisi";
    }

    const maxScore = parseFloat(formData.maxScore);
    if (isNaN(maxScore) || maxScore <= 0) {
      newErrors.maxScore = "Nilai maksimal harus lebih dari 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Mohon lengkapi semua field yang wajib diisi");
      return;
    }

    try {
      setIsLoading(true);

      // Combine date and time
      const dueDateTime = new Date(
        `${formData.dueDate}T${formData.dueTime}:00`
      );

      const response = await fetch("/api/teacher/tugas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rombelId: formData.rombelId,
          subjectId: formData.subjectId,
          title: formData.title,
          description: formData.description || null,
          dueDate: dueDateTime.toISOString(),
          maxScore: parseFloat(formData.maxScore),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create assignment");
      }

      toast.success("Tugas berhasil dibuat");
      router.push("/teacher/tugas");
    } catch (error) {
      console.error("Error creating tugas:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal membuat tugas"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/teacher/tugas");
  };

  return (
    <div>
      <PageHeader
        title="Buat Tugas Online Baru"
        description="Buat tugas online untuk siswa"
        backHref="/teacher/tugas"
        backLabel="Kembali ke Daftar Tugas Online"
      />

      <div className="bg-card rounded-lg border p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rombel + Subject Selection */}
          <div className="space-y-2">
            <Label htmlFor="teacherSubject">
              Kelas & Mata Pelajaran <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.rombelId && formData.subjectId ? `${formData.rombelId}-${formData.subjectId}` : ""}
              onValueChange={(value) => {
                const [rombelId, subjectId] = value.split("-");
                setFormData({ ...formData, rombelId, subjectId });
              }}
              disabled={loadingClasses}
            >
              <SelectTrigger id="teacherSubject">
                <SelectValue placeholder="Pilih kelas dan mata pelajaran" />
              </SelectTrigger>
              <SelectContent>
                {teacherSubjects.map((ts) => (
                  <SelectItem key={ts.id} value={`${ts.rombel_id}-${ts.subject_id}`}>
                    {ts.subject.name} - {ts.rombel.class.name} {ts.rombel.name} ({ts.rombel.student_count} siswa)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.rombelId && (
              <p className="text-sm text-destructive">{errors.rombelId}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Judul Tugas <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Contoh: Tugas Membuat Esai tentang Lingkungan"
              maxLength={200}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Jelaskan instruksi tugas, kriteria penilaian, dan hal penting lainnya..."
              rows={6}
            />
            <p className="text-sm text-muted-foreground">
              Gunakan deskripsi untuk memberikan instruksi lengkap kepada siswa
            </p>
          </div>

          {/* Due Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">
                Tanggal Deadline <span className="text-destructive">*</span>
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                min={new Date().toISOString().split("T")[0]}
              />
              {errors.dueDate && (
                <p className="text-sm text-destructive">{errors.dueDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueTime">
                Waktu Deadline <span className="text-destructive">*</span>
              </Label>
              <Input
                id="dueTime"
                type="time"
                value={formData.dueTime}
                onChange={(e) =>
                  setFormData({ ...formData, dueTime: e.target.value })
                }
              />
              {errors.dueTime && (
                <p className="text-sm text-destructive">{errors.dueTime}</p>
              )}
            </div>
          </div>

          {/* Max Score */}
          <div className="space-y-2">
            <Label htmlFor="maxScore">
              Nilai Maksimal <span className="text-destructive">*</span>
            </Label>
            <Input
              id="maxScore"
              type="number"
              value={formData.maxScore}
              onChange={(e) =>
                setFormData({ ...formData, maxScore: e.target.value })
              }
              min="1"
              step="1"
            />
            {errors.maxScore && (
              <p className="text-sm text-destructive">{errors.maxScore}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Menyimpan..." : "Simpan Tugas"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Batal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
