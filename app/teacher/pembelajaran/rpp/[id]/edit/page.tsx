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

interface Syllabus {
  id: number;
  title: string;
  academicYear: string;
  semester: number;
}

interface AcademicYear {
  id: string;
  label: string;
  isActive: boolean;
}

export default function EditRPPPage() {
  const router = useRouter();
  const params = useParams();
  const { setBreadcrumbs } = useBreadcrumb();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);

  const [formData, setFormData] = useState({
    id: "",
    syllabusId: "",
    subjectId: "",
    classId: "",
    academicYear: "",
    semester: "",
    title: "",
    meetingNumber: "",
    timeAllocation: "",
    learningObjectives: "",
    indicators: "",
    subjectMatter: "",
    teachingMethod: "",
    mediaAndTools: "",
    learningResources: "",
    openingActivities: "",
    coreActivities: "",
    closingActivities: "",
    assessmentTechnique: "",
    assessmentInstrument: "",
    notes: "",
    fileUrl: "",
    fileName: "",
  });

  useEffect(() => {
    setBreadcrumbs([
      { label: "Pembelajaran", href: "/teacher" },
      { label: "Silabus & RPP", href: "/teacher/pembelajaran/silabus" },
      { label: "Edit RPP" },
    ]);

    fetchSubjects();
    fetchClasses();
    fetchAcademicYears();
    fetchLessonPlan();
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

  const fetchSyllabuses = async (subjectId: string, classId: string) => {
    if (!subjectId || !classId) return;
    
    try {
      const response = await fetch(
        `/api/teacher/pembelajaran/silabus?subjectId=${subjectId}&classId=${classId}`
      );
      if (!response.ok) throw new Error("Failed to fetch syllabuses");
      const data = await response.json();
      setSyllabuses(data.syllabuses || []);
    } catch (error) {
      console.error("Error fetching syllabuses:", error);
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

  const fetchLessonPlan = async () => {
    try {
      const response = await fetch(`/api/teacher/pembelajaran/rpp?id=${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch lesson plan");
      
      const lessonPlan = await response.json();

      if (!lessonPlan) {
        toast.error("RPP tidak ditemukan");
        router.push("/teacher/pembelajaran/silabus");
        return;
      }

      setFormData({
        id: lessonPlan.id.toString(),
        syllabusId: lessonPlan.syllabusId?.toString() || "",
        subjectId: lessonPlan.subjectId.toString(),
        classId: lessonPlan.classId.toString(),
        academicYear: lessonPlan.academicYear || "",
        semester: lessonPlan.semester?.toString() || "",
        title: lessonPlan.title,
        meetingNumber: lessonPlan.meetingNumber?.toString() || "",
        timeAllocation: lessonPlan.timeAllocation || "",
        learningObjectives: lessonPlan.learningObjectives,
        indicators: lessonPlan.indicators || "",
        subjectMatter: lessonPlan.subjectMatter || "",
        teachingMethod: lessonPlan.teachingMethod || "",
        mediaAndTools: lessonPlan.mediaAndTools || "",
        learningResources: lessonPlan.learningResources || "",
        openingActivities: lessonPlan.openingActivities || "",
        coreActivities: lessonPlan.coreActivities || "",
        closingActivities: lessonPlan.closingActivities || "",
        assessmentTechnique: lessonPlan.assessmentTechnique || "",
        assessmentInstrument: lessonPlan.assessmentInstrument || "",
        notes: lessonPlan.notes || "",
        fileUrl: lessonPlan.fileUrl || "",
        fileName: lessonPlan.fileName || "",
      });

      // Fetch syllabuses for the subject and class
      fetchSyllabuses(
        lessonPlan.subjectId.toString(),
        lessonPlan.classId.toString()
      );
    } catch (error) {
      console.error("Error fetching lesson plan:", error);
      toast.error("Gagal memuat data RPP");
      router.push("/teacher/pembelajaran/silabus");
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.learningObjectives || !formData.academicYear || !formData.semester) {
      toast.error("Judul, tujuan pembelajaran, tahun ajaran, dan semester harus diisi");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/teacher/pembelajaran/rpp", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          syllabusId: formData.syllabusId || null,
          meetingNumber: formData.meetingNumber ? parseInt(formData.meetingNumber) : null,
          semester: parseInt(formData.semester),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update lesson plan");
      }

      toast.success("RPP berhasil diperbarui");
      router.push("/teacher/pembelajaran/silabus?tab=rpp");
    } catch (error) {
      console.error("Error updating lesson plan:", error);
      toast.error(error instanceof Error ? error.message : "Gagal memperbarui RPP");
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
          <h1 className="text-2xl font-bold">Edit RPP</h1>
          <p className="text-sm text-muted-foreground">
            Perbarui informasi RPP
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
                <Label htmlFor="syllabusId">Silabus Terkait</Label>
                <Select
                  value={formData.syllabusId || "none"}
                  onValueChange={(value) => {
                    // Auto-fill academic year and semester from selected syllabus
                    if (value === "none") {
                      setFormData({ ...formData, syllabusId: "" });
                    } else {
                      const selectedSyllabus = syllabuses.find(s => s.id.toString() === value);
                      if (selectedSyllabus) {
                        setFormData(prev => ({
                          ...prev,
                          syllabusId: value,
                          academicYear: selectedSyllabus.academicYear,
                          semester: selectedSyllabus.semester.toString(),
                        }));
                      } else {
                        setFormData({ ...formData, syllabusId: value });
                      }
                    }
                  }}
                >
                  <SelectTrigger id="syllabusId">
                    <SelectValue placeholder="Pilih Silabus (Opsional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak Terkait Silabus</SelectItem>
                    {syllabuses.map((syllabus) => (
                      <SelectItem key={syllabus.id} value={syllabus.id.toString()}>
                        {syllabus.title} ({syllabus.academicYear} - Sem{" "}
                        {syllabus.semester})
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

              <div className="space-y-2">
                <Label htmlFor="meetingNumber">Pertemuan Ke-</Label>
                <Input
                  id="meetingNumber"
                  type="number"
                  min="1"
                  value={formData.meetingNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, meetingNumber: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Judul RPP <span className="text-red-500">*</span>
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
            </div>
          </CardContent>
        </Card>

        {/* Tujuan dan Indikator */}
        <Card>
          <CardHeader>
            <CardTitle>Tujuan dan Indikator Pembelajaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="learningObjectives">
                Tujuan Pembelajaran <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="learningObjectives"
                rows={4}
                value={formData.learningObjectives}
                onChange={(e) =>
                  setFormData({ ...formData, learningObjectives: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="indicators">Indikator Pencapaian</Label>
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

        {/* Materi dan Metode */}
        <Card>
          <CardHeader>
            <CardTitle>Materi dan Metode Pembelajaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subjectMatter">Materi Pembelajaran</Label>
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
              <Label htmlFor="teachingMethod">Metode Pembelajaran</Label>
              <Textarea
                id="teachingMethod"
                rows={3}
                value={formData.teachingMethod}
                onChange={(e) =>
                  setFormData({ ...formData, teachingMethod: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mediaAndTools">Media dan Alat</Label>
              <Textarea
                id="mediaAndTools"
                rows={3}
                value={formData.mediaAndTools}
                onChange={(e) =>
                  setFormData({ ...formData, mediaAndTools: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="learningResources">Sumber Belajar</Label>
              <Textarea
                id="learningResources"
                rows={3}
                value={formData.learningResources}
                onChange={(e) =>
                  setFormData({ ...formData, learningResources: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Kegiatan Pembelajaran */}
        <Card>
          <CardHeader>
            <CardTitle>Kegiatan Pembelajaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openingActivities">Kegiatan Pendahuluan</Label>
              <Textarea
                id="openingActivities"
                rows={4}
                value={formData.openingActivities}
                onChange={(e) =>
                  setFormData({ ...formData, openingActivities: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coreActivities">Kegiatan Inti</Label>
              <Textarea
                id="coreActivities"
                rows={6}
                value={formData.coreActivities}
                onChange={(e) =>
                  setFormData({ ...formData, coreActivities: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="closingActivities">Kegiatan Penutup</Label>
              <Textarea
                id="closingActivities"
                rows={4}
                value={formData.closingActivities}
                onChange={(e) =>
                  setFormData({ ...formData, closingActivities: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Penilaian */}
        <Card>
          <CardHeader>
            <CardTitle>Penilaian</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assessmentTechnique">Teknik Penilaian</Label>
              <Textarea
                id="assessmentTechnique"
                rows={3}
                value={formData.assessmentTechnique}
                onChange={(e) =>
                  setFormData({ ...formData, assessmentTechnique: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assessmentInstrument">Instrumen Penilaian</Label>
              <Textarea
                id="assessmentInstrument"
                rows={3}
                value={formData.assessmentInstrument}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    assessmentInstrument: e.target.value,
                  })
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
