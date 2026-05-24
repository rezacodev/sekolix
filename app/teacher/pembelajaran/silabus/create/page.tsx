"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBreadcrumb } from "../../../BreadcrumbContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Subject {
  id: number;
  name: string;
  code: string | null;
}

interface Class {
  id: number;
  name: string;
}

interface AcademicYear {
  id: string;
  label: string;
  isActive: boolean;
}

export default function CreateSilabusPage() {
  const router = useRouter();
  const { setBreadcrumbs } = useBreadcrumb();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);

  const [formData, setFormData] = useState({
    subjectId: "",
    classId: "",
    academicYear: "",
    semester: "",
    title: "",
    coreCompetencies: "",
    basicCompetencies: "",
    indicators: "",
    subjectMatter: "",
    learningActivities: "",
    assessment: "",
    timeAllocation: "",
    learningResources: "",
    notes: "",
    fileUrl: "",
    fileName: "",
  });

  useEffect(() => {
    setBreadcrumbs([
      { label: "Pembelajaran", href: "/teacher" },
      { label: "Silabus & RPP", href: "/teacher/pembelajaran/silabus" },
      { label: "Buat Silabus" },
    ]);

    fetchSubjects();
    fetchClasses();
    fetchAcademicYears();
  }, [setBreadcrumbs]);

  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/teacher/subjects");
      if (!response.ok) throw new Error("Failed to fetch subjects");
      const data = await response.json();
      setSubjects(data.subjects || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast.error("Gagal memuat daftar mata pelajaran");
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/teacher/classes");
      if (!response.ok) throw new Error("Failed to fetch classes");
      const data = await response.json();
      setClasses(data.classes || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Gagal memuat daftar kelas");
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const response = await fetch("/api/teacher/tahun-ajaran");
      if (!response.ok) throw new Error("Failed to fetch academic years");
      const data = await response.json();
      setAcademicYears(data.academicYears || []);
    } catch (error) {
      console.error("Error fetching academic years:", error);
      toast.error("Gagal memuat daftar tahun ajaran");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subjectId || !formData.classId || !formData.semester || !formData.title) {
      toast.error("Mohon lengkapi semua field yang wajib");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/teacher/pembelajaran/silabus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create syllabus");
      }

      toast.success("Silabus berhasil dibuat");
      router.push("/teacher/pembelajaran/silabus");
    } catch (error) {
      console.error("Error creating syllabus:", error);
      toast.error(error instanceof Error ? error.message : "Gagal membuat silabus");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Buat Silabus Baru</h1>
          <p className="text-sm text-muted-foreground">
            Lengkapi form di bawah untuk membuat silabus
          </p>
        </div>
        <Link href="/teacher/pembelajaran/silabus">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informasi Dasar */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Dasar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subjectId">
                  Mata Pelajaran <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.subjectId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, subjectId: value })
                  }
                  required
                >
                  <SelectTrigger id="subjectId">
                    <SelectValue placeholder="Pilih Mata Pelajaran" />
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

              <div className="space-y-2">
                <Label htmlFor="classId">
                  Kelas <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.classId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, classId: value })
                  }
                  required
                >
                  <SelectTrigger id="classId">
                    <SelectValue placeholder="Pilih Kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        Kelas {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="academicYear">
                  Tahun Ajaran <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.academicYear}
                  onValueChange={(value) =>
                    setFormData({ ...formData, academicYear: value })
                  }
                  required
                >
                  <SelectTrigger id="academicYear">
                    <SelectValue placeholder="Pilih Tahun Ajaran" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map((year) => (
                      <SelectItem key={year.id} value={year.label}>
                        {year.label}
                        {year.isActive && (
                          <span className="ml-2 text-xs text-green-600">(Aktif)</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="semester">
                  Semester <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.semester}
                  onValueChange={(value) =>
                    setFormData({ ...formData, semester: value })
                  }
                  required
                >
                  <SelectTrigger id="semester">
                    <SelectValue placeholder="Pilih Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Semester 1</SelectItem>
                    <SelectItem value="2">Semester 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">
                Judul Silabus <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Contoh: Silabus Matematika Kelas X Semester 1"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Kompetensi */}
        <Card>
          <CardHeader>
            <CardTitle>Kompetensi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="coreCompetencies">
                Kompetensi Inti (KI)
              </Label>
              <Textarea
                id="coreCompetencies"
                placeholder="Tuliskan kompetensi inti yang akan dicapai..."
                rows={4}
                value={formData.coreCompetencies}
                onChange={(e) =>
                  setFormData({ ...formData, coreCompetencies: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="basicCompetencies">
                Kompetensi Dasar (KD)
              </Label>
              <Textarea
                id="basicCompetencies"
                placeholder="Tuliskan kompetensi dasar yang akan dicapai..."
                rows={4}
                value={formData.basicCompetencies}
                onChange={(e) =>
                  setFormData({ ...formData, basicCompetencies: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="indicators">
                Indikator Pencapaian Kompetensi
              </Label>
              <Textarea
                id="indicators"
                placeholder="Tuliskan indikator pencapaian kompetensi..."
                rows={4}
                value={formData.indicators}
                onChange={(e) =>
                  setFormData({ ...formData, indicators: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Materi dan Kegiatan */}
        <Card>
          <CardHeader>
            <CardTitle>Materi dan Kegiatan Pembelajaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subjectMatter">Materi Pokok</Label>
              <Textarea
                id="subjectMatter"
                placeholder="Tuliskan materi pokok yang akan diajarkan..."
                rows={4}
                value={formData.subjectMatter}
                onChange={(e) =>
                  setFormData({ ...formData, subjectMatter: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="learningActivities">Kegiatan Pembelajaran</Label>
              <Textarea
                id="learningActivities"
                placeholder="Tuliskan kegiatan pembelajaran yang akan dilakukan..."
                rows={4}
                value={formData.learningActivities}
                onChange={(e) =>
                  setFormData({ ...formData, learningActivities: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeAllocation">Alokasi Waktu</Label>
              <Input
                id="timeAllocation"
                placeholder="Contoh: 2 x 45 menit"
                value={formData.timeAllocation}
                onChange={(e) =>
                  setFormData({ ...formData, timeAllocation: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Penilaian dan Sumber Belajar */}
        <Card>
          <CardHeader>
            <CardTitle>Penilaian dan Sumber Belajar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assessment">Penilaian</Label>
              <Textarea
                id="assessment"
                placeholder="Tuliskan metode dan instrumen penilaian..."
                rows={4}
                value={formData.assessment}
                onChange={(e) =>
                  setFormData({ ...formData, assessment: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="learningResources">Sumber Belajar</Label>
              <Textarea
                id="learningResources"
                placeholder="Tuliskan sumber belajar yang digunakan..."
                rows={4}
                value={formData.learningResources}
                onChange={(e) =>
                  setFormData({ ...formData, learningResources: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                placeholder="Catatan tambahan (opsional)..."
                rows={3}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Batal
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Simpan Silabus
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
