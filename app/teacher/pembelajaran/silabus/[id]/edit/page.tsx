"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useBreadcrumb } from "../../../../BreadcrumbContext";
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

export default function EditSilabusPage() {
  const router = useRouter();
  const params = useParams();
  const { setBreadcrumbs } = useBreadcrumb();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);

  const [formData, setFormData] = useState({
    id: "",
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
      { label: "Edit Silabus" },
    ]);

    fetchSubjects();
    fetchClasses();
    fetchAcademicYears();
    fetchSyllabus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setBreadcrumbs, params.id]);

  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/teacher/subjects");
      if (!response.ok) throw new Error("Failed to fetch subjects");
      const data = await response.json();
      setSubjects(data.subjects || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
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
    }
  };

  const fetchSyllabus = async () => {
    try {
      const response = await fetch(`/api/teacher/pembelajaran/silabus?id=${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch syllabus");
      
      const syllabus = await response.json();

      if (!syllabus) {
        toast.error("Silabus tidak ditemukan");
        router.push("/teacher/pembelajaran/silabus");
        return;
      }

      setFormData({
        id: syllabus.id.toString(),
        subjectId: syllabus.subjectId.toString(),
        classId: syllabus.classId.toString(),
        academicYear: syllabus.academicYear,
        semester: syllabus.semester.toString(),
        title: syllabus.title,
        coreCompetencies: syllabus.coreCompetencies || "",
        basicCompetencies: syllabus.basicCompetencies || "",
        indicators: syllabus.indicators || "",
        subjectMatter: syllabus.subjectMatter || "",
        learningActivities: syllabus.learningActivities || "",
        assessment: syllabus.assessment || "",
        timeAllocation: syllabus.timeAllocation || "",
        learningResources: syllabus.learningResources || "",
        notes: syllabus.notes || "",
        fileUrl: syllabus.fileUrl || "",
        fileName: syllabus.fileName || "",
      });
    } catch (error) {
      console.error("Error fetching syllabus:", error);
      toast.error("Gagal memuat data silabus");
      router.push("/teacher/pembelajaran/silabus");
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast.error("Judul silabus harus diisi");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/teacher/pembelajaran/silabus", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update syllabus");
      }

      toast.success("Silabus berhasil diperbarui");
      router.push("/teacher/pembelajaran/silabus");
    } catch (error) {
      console.error("Error updating syllabus:", error);
      toast.error(error instanceof Error ? error.message : "Gagal memperbarui silabus");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Edit Silabus</h1>
          <p className="text-sm text-muted-foreground">
            Perbarui informasi silabus
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
                <Label htmlFor="subjectId">Mata Pelajaran</Label>
                <Select value={formData.subjectId} disabled>
                  <SelectTrigger id="subjectId">
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
                <p className="text-xs text-muted-foreground">
                  Mata pelajaran tidak dapat diubah
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="classId">Kelas</Label>
                <Select value={formData.classId} disabled>
                  <SelectTrigger id="classId">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        Kelas {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Kelas tidak dapat diubah
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="academicYear">Tahun Ajaran</Label>
                <Select value={formData.academicYear} disabled>
                  <SelectTrigger id="academicYear">
                    <SelectValue />
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
                <Label htmlFor="semester">Semester</Label>
                <Select value={formData.semester} disabled>
                  <SelectTrigger id="semester">
                    <SelectValue />
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
              <Label htmlFor="coreCompetencies">Kompetensi Inti (KI)</Label>
              <Textarea
                id="coreCompetencies"
                rows={4}
                value={formData.coreCompetencies}
                onChange={(e) =>
                  setFormData({ ...formData, coreCompetencies: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="basicCompetencies">Kompetensi Dasar (KD)</Label>
              <Textarea
                id="basicCompetencies"
                rows={4}
                value={formData.basicCompetencies}
                onChange={(e) =>
                  setFormData({ ...formData, basicCompetencies: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="indicators">Indikator Pencapaian Kompetensi</Label>
              <Textarea
                id="indicators"
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
                Simpan Perubahan
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
