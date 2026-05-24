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

export default function CreateRPPPage() {
  const router = useRouter();
  const { setBreadcrumbs } = useBreadcrumb();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);

  const [formData, setFormData] = useState({
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
      { label: "Buat RPP" },
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
      toast.error("Gagal memuat daftar silabus");
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

  useEffect(() => {
    if (formData.subjectId && formData.classId) {
      fetchSyllabuses(formData.subjectId, formData.classId);
    }
  }, [formData.subjectId, formData.classId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subjectId || !formData.classId || !formData.title || !formData.learningObjectives || !formData.academicYear || !formData.semester) {
      toast.error("Mohon lengkapi semua field yang wajib");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/teacher/pembelajaran/rpp", {
        method: "POST",
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
        throw new Error(error.error || "Failed to create lesson plan");
      }

      toast.success("RPP berhasil dibuat");
      router.push("/teacher/pembelajaran/silabus?tab=rpp");
    } catch (error) {
      console.error("Error creating lesson plan:", error);
      toast.error(error instanceof Error ? error.message : "Gagal membuat RPP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Buat RPP Baru</h1>
          <p className="text-sm text-muted-foreground">
            Lengkapi form di bawah untuk membuat rencana pelaksanaan pembelajaran
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
                    setFormData({ ...formData, subjectId: value, syllabusId: "" })
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
                    setFormData({ ...formData, classId: value, syllabusId: "" })
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
                <Label htmlFor="syllabusId">Silabus Terkait (Opsional)</Label>
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
                  disabled={!formData.subjectId || !formData.classId}
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
                  placeholder="Contoh: 1"
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
                  placeholder="Contoh: Pengenalan Aljabar"
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
                  placeholder="Contoh: 2 x 45 menit"
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
                placeholder="Tuliskan tujuan pembelajaran yang akan dicapai..."
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
                placeholder="Tuliskan materi yang akan diajarkan..."
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
                placeholder="Tuliskan metode pembelajaran yang digunakan..."
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
                placeholder="Tuliskan media dan alat yang digunakan..."
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
                placeholder="Tuliskan sumber belajar yang digunakan..."
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
                placeholder="Tuliskan kegiatan pembuka pembelajaran..."
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
                placeholder="Tuliskan kegiatan inti pembelajaran..."
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
                placeholder="Tuliskan kegiatan penutup pembelajaran..."
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
                placeholder="Tuliskan teknik penilaian yang digunakan..."
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
                placeholder="Tuliskan instrumen penilaian yang digunakan..."
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
                Simpan RPP
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
