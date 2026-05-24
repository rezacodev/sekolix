"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AssignmentDetail {
  id: number;
  rombelId: number;
  subjectId: number;
  academicYear: string;
  semester: number;
  title: string;
  description: string | null;
  dueDate: string;
  maxScore: number;
  subjectName: string;
  rombelName: string;
}

export default function EditTugasPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    dueTime: "",
    maxScore: "100",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch assignment detail
  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await fetch(`/api/teacher/tugas/${id}`);
        if (!response.ok) throw new Error("Failed to fetch assignment");
        const data = await response.json();
        
        setAssignment(data);
        
        // Parse due date to separate date and time
        const dueDate = new Date(data.dueDate);
        const dateStr = dueDate.toISOString().split("T")[0];
        const timeStr = dueDate.toTimeString().slice(0, 5);
        
        setFormData({
          title: data.title,
          description: data.description || "",
          dueDate: dateStr,
          dueTime: timeStr,
          maxScore: data.maxScore?.toString() || "100",
        });
      } catch (error) {
        console.error("Error fetching assignment:", error);
        toast.error("Gagal memuat data tugas");
        router.push("/teacher/tugas");
      } finally {
        setLoadingData(false);
      }
    };

    if (id) {
      fetchAssignment();
    }
  }, [id, router]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

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

      const response = await fetch(`/api/teacher/tugas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          dueDate: dueDateTime.toISOString(),
          maxScore: parseFloat(formData.maxScore),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update assignment");
      }

      toast.success("Tugas berhasil diperbarui");
      router.push("/teacher/tugas");
    } catch (error) {
      console.error("Error updating tugas:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal memperbarui tugas"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/teacher/tugas");
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!assignment) {
    return null;
  }

  return (
    <div>
      <PageHeader
        title="Edit Tugas Online"
        description="Ubah informasi tugas online"
        backHref="/teacher/tugas"
        backLabel="Kembali ke Daftar Tugas Online"
      />

      {/* Assignment Info Card */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Rombel & Mata Pelajaran</p>
              <p className="text-base font-semibold text-blue-900">
                {assignment.subjectName} - {assignment.rombelName}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tahun Ajaran</p>
              <p className="text-base font-semibold text-blue-900">
                {assignment.academicYear} - Semester {assignment.semester}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Catatan</p>
              <p className="text-sm text-blue-800">
                Rombel dan mata pelajaran tidak dapat diubah
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-card rounded-lg border p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
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
              {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
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
