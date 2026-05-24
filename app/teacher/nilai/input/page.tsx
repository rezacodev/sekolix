"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, AlertCircle, CheckCircle2, Settings2, Info, FileSpreadsheet } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useBreadcrumb } from "@/app/teacher/BreadcrumbContext";

interface Rubric {
  id: number;
  name: string;
  type: string;
  weight: number;
  maxScore: number;
  criteria: RubricCriteria[];
}

interface Student {
  id: string;
  fullName: string;
  nisn: string | null;
  registrationCode: string | null;
  grades: Record<string, number | null>;
  finalScore: number | null;
  isPassing: boolean | null;
}

interface GradeData {
  rombel: {
    id: number;
    name: string;
    className: string;
  };
  subject: {
    id: number;
    name: string;
    kkm: number | null;
  };
  rubrics: Rubric[];
  students: Student[];
}

interface ClassSubject {
  teacherSubjectId: string;
  rombelId: string;
  rombelName: string;
  className: string;
  subjectId: string;
  subjectName: string;
}

interface RubricCriteria {
  id: number;
  name: string;
  description: string | null;
  max_score: number;
  order: number;
}

interface RubricScore {
  rubric_criterion_id: number;
  score: number;
}

interface Rubric {
  id: number;
  name: string;
  description: string | null;
  type: string;
  weight: number;
  max_score: number;
  criteria: RubricCriteria[];
}

export default function InputNilaiPage() {
  const router = useRouter();
  const breadcrumbContext = useBreadcrumb();
  const { setBreadcrumbs } = breadcrumbContext || {};

  const [loading, setLoading] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [gradeData, setGradeData] = useState<GradeData | null>(null);
  const [rubricModalOpen, setRubricModalOpen] = useState(false);
  const [selectedStudentForRubric, setSelectedStudentForRubric] = useState<Student | null>(null);
  const [selectedRubricForInput, setSelectedRubricForInput] = useState<Rubric | null>(null);
  const [selectedRubric, setSelectedRubric] = useState<Rubric | null>(null);
  const [rubricScores, setRubricScores] = useState<Record<number, number>>({});
  const [rubricScoreErrors, setRubricScoreErrors] = useState<Record<number, string>>({});

  // Function to fetch grade data for a specific class
  const fetchGradeData = async (teacherSubjectId: string) => {
    try {
      const selected = classSubjects.find(c => c.teacherSubjectId === teacherSubjectId);
      if (!selected) return;

      const params = new URLSearchParams({
        rombelId: selected.rombelId,
        subjectId: selected.subjectId
      });

      const response = await fetch(`/api/teacher/nilai/input?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch grades");

      const data = await response.json();
      setGradeData(data);
    } catch (error) {
      console.error("Error fetching grade data:", error);
      // Don't show toast here to avoid confusing users - the save was successful
    }
  };

  // Set breadcrumb
  useEffect(() => {
    if (setBreadcrumbs) {
      setBreadcrumbs([
        { label: "Input Nilai Akademik", href: "/teacher/nilai/input" },
      ]);
    }
  }, [setBreadcrumbs]);

  // Fetch classes yang diampu teacher
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoadingClasses(true);
        const response = await fetch("/api/teacher/my-classes");
        if (!response.ok) throw new Error("Failed to fetch classes");

        const data = await response.json();
        
        
        // Flatten teacher subjects
        const flattened: ClassSubject[] = [];
        data.data?.forEach((rombel: unknown) => {
          (rombel as { subjects?: unknown[] }).subjects?.forEach((subject: unknown) => {
            const subj = subject as { teacherSubjectId: string; id: string; name: string };
            const romb = rombel as { rombelId: string; rombelName: string; className: string };
            flattened.push({
              teacherSubjectId: subj.teacherSubjectId,
              rombelId: String(romb.rombelId),
              rombelName: romb.rombelName,
              className: romb.className,
              subjectId: String(subj.id),
              subjectName: subj.name
            });
          });
        });

        setClassSubjects(flattened);
      } catch (error) {
        console.error("Error fetching classes:", error);
        toast.error("Gagal memuat data kelas");
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, []);

  // Fetch grades when class is selected
  useEffect(() => {
    if (!selectedClass) {
      setGradeData(null);
      setLoading(false);
      return;
    }

    const fetchGrades = async () => {
      try {
        setLoading(true);
        const selected = classSubjects.find(c => c.teacherSubjectId === selectedClass);
        if (!selected) return;

        const params = new URLSearchParams({
          rombelId: selected.rombelId,
          subjectId: selected.subjectId
        });

        const response = await fetch(`/api/teacher/nilai/input?${params.toString()}`);
        if (!response.ok) throw new Error("Failed to fetch grades");

        const data = await response.json();
        setGradeData(data);
      } catch (error) {
        console.error("Error fetching grades:", error);
        toast.error("Gagal memuat data nilai");
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [selectedClass, classSubjects]);

  const handleCellClick = async (studentId: string, rubricId: number) => {
    const student = gradeData?.students.find(s => s.id === studentId);
    const rubric = gradeData?.rubrics.find(r => r.id === rubricId);

    if (!student || !rubric || !gradeData) return;

    setSelectedStudentForRubric(student);
    setSelectedRubricForInput(rubric);

    // Fetch existing rubric scores for this student and rubric
    await fetchExistingRubricScores(studentId, rubricId);

    // Directly set the rubric for input (skip selection step)
    setSelectedRubric(rubric);

    // Set rubric modal
    setRubricModalOpen(true);
  };

  const fetchExistingRubricScores = async (studentId: string, rubricId: number) => {
    try {
      const response = await fetch(`/api/teacher/nilai/rubrik/scores?studentId=${studentId}&rubricId=${rubricId}`);
      if (response.ok) {
        const data = await response.json();
        // Initialize scores with existing data or 0
        const existingScores: Record<string, number> = {};
        const existingErrors: Record<string, string> = {};

        // Get the rubric to know all criteria
        const rubric = gradeData?.rubrics.find(r => r.id === rubricId);
        if (rubric) {
          rubric.criteria.forEach((criterion: RubricCriteria) => {
            // Find existing score for this criterion
            const existingScore = data.scores?.find((s: RubricScore) => s.rubric_criterion_id === criterion.id);
            existingScores[criterion.id] = existingScore ? parseFloat(existingScore.score.toString()) : 0;
            existingErrors[criterion.id] = "";
          });
        }

        setRubricScores(existingScores);
        setRubricScoreErrors(existingErrors);
      } else {
        // Initialize with empty scores if no existing data
        initializeEmptyScores(rubricId);
      }
    } catch (error) {
      console.error("Failed to fetch existing rubric scores:", error);
      // Initialize with empty scores on error
      initializeEmptyScores(rubricId);
    }
  };

  const initializeEmptyScores = (rubricId: number) => {
    const rubric = gradeData?.rubrics.find(r => r.id === rubricId);
    if (rubric) {
      const initialScores: Record<string, number> = {};
      const initialErrors: Record<string, string> = {};
      rubric.criteria.forEach((criterion: RubricCriteria) => {
        initialScores[criterion.id] = 0;
        initialErrors[criterion.id] = "";
      });
      setRubricScores(initialScores);
      setRubricScoreErrors(initialErrors);
    }
  };

  const handleRubricScoreChange = (criterionId: number, score: number) => {
    // Validate score
    const criterion = selectedRubric?.criteria.find(c => c.id === criterionId);
    let error = "";

    if (score < 0) {
      error = "Nilai tidak boleh negatif";
    } else if (criterion && score > criterion.max_score) {
      error = `Nilai maksimal adalah ${criterion.max_score}`;
    } else if (isNaN(score)) {
      error = "Nilai harus berupa angka";
    } else if (score === null || score === undefined) {
      error = "Nilai harus diisi";
    }

    // Update scores
    setRubricScores(prev => ({
      ...prev,
      [criterionId]: score
    }));

    // Update errors
    setRubricScoreErrors(prev => ({
      ...prev,
      [criterionId]: error
    }));
  };

  const handleModalClose = (open: boolean) => {
    setRubricModalOpen(open);
    if (!open) {
      // Reset all modal states when closing
      setSelectedStudentForRubric(null);
      setSelectedRubricForInput(null);
      setSelectedRubric(null);
      setRubricScores({});
      setRubricScoreErrors({});
    }
  };

  const hasValidationErrors = () => {
    return Object.values(rubricScoreErrors).some(error => error !== "");
  };

  const handleSaveRubricScore = async () => {
    if (!selectedStudentForRubric || !selectedRubricForInput || !selectedRubric) return;

    // Check for validation errors
    if (hasValidationErrors()) {
      toast.error("Mohon perbaiki kesalahan validasi sebelum menyimpan");
      return;
    }

    try {
      setSaving(true);

      const selected = classSubjects.find(c => c.teacherSubjectId === selectedClass);
      if (!selected) return;

      const response = await fetch("/api/teacher/nilai/input", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudentForRubric.id,
          rubricId: selectedRubricForInput.id,
          rubricScores,
          rombelId: selected.rombelId,
          subjectId: selected.subjectId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save rubric score");
      }

      toast.success("Nilai berhasil disimpan");

      // Refresh data
      await fetchGradeData(selectedClass);

      // Close modal
      setRubricModalOpen(false);
      setSelectedRubric(null);
      setRubricScores({});

    } catch (error) {
      console.error("Failed to save rubric score:", error);
      toast.error("Gagal menyimpan nilai");
    } finally {
      setSaving(false);
    }
  };

  const selectedClassData = classSubjects.find(c => c.teacherSubjectId === selectedClass);

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <PageHeader
          title="Input Nilai Akademik"
          description="Input dan kelola nilai siswa untuk berbagai jenis penilaian"
        />
        
        <div className="flex flex-col items-end gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/teacher/nilai/input/import")}
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Import Excel
          </Button>
          {selectedClassData && gradeData && (
            <Button
              variant="outline"
              onClick={() => router.push(`/teacher/nilai/rubrik?subjectId=${gradeData.subject.id}&subjectName=${encodeURIComponent(gradeData.subject.name)}&rombelId=${selectedClassData.rombelId}&rombelName=${encodeURIComponent(selectedClassData.rombelName)}&className=${encodeURIComponent(selectedClassData.className)}`)}
              className="bg-blue-50 border-blue-200 hover:bg-blue-100"
            >
              <Settings2 className="w-4 h-4 mr-2" />
              Kelola Rubrik Penilaian
            </Button>
          )}
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Pilih Kelas & Mata Pelajaran</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Kelas & Mata Pelajaran</Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kelas dan mata pelajaran..." />
              </SelectTrigger>
              <SelectContent>
                {loadingClasses ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Memuat data...
                  </div>
                ) : classSubjects.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Tidak ada kelas yang diampu
                  </div>
                ) : (
                  classSubjects.map((item) => (
                    <SelectItem key={item.teacherSubjectId} value={item.teacherSubjectId}>
                      {item.className} {item.rombelName} - {item.subjectName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedClassData && gradeData && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Kelas/Rombel</p>
                  <p className="font-semibold">{gradeData.rombel.className} {gradeData.rombel.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mata Pelajaran</p>
                  <p className="font-semibold">{gradeData.subject.name}</p>
                </div>
                {gradeData.subject.kkm && (
                  <div>
                    <p className="text-sm text-gray-600">KKM</p>
                    <p className="font-semibold text-blue-700">{gradeData.subject.kkm}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Total Siswa</p>
                  <p className="font-semibold">{gradeData.students.length}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {!selectedClass ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Pilih kelas dan mata pelajaran untuk memulai input nilai
            </p>
          </CardContent>
        </Card>
      ) : loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">Memuat data nilai...</span>
          </CardContent>
        </Card>
      ) : gradeData ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tabel Input Nilai</CardTitle>
              {saving && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Menyimpan...
                </div>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Klik pada sel untuk mengedit nilai menggunakan sistem rubrik penilaian.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                  <Settings2 className="h-3 w-3 mr-1" />
                  Sistem Rubrik
                </Badge>
                <span className="text-muted-foreground">Penilaian berdasarkan kriteria yang telah ditentukan</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <div className="relative max-h-[600px] overflow-auto">
                <table className="w-full">
                  <thead className="sticky top-0 z-20 bg-white border-b">
                    <tr className="border-b">
                      <th className="sticky left-0 z-30 bg-white px-4 py-3 text-left text-sm font-medium border-r min-w-[50px]">
                        No
                      </th>
                      <th className="sticky left-[50px] z-30 bg-white px-4 py-3 text-left text-sm font-medium border-r min-w-[200px]">
                        Nama Siswa
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium min-w-[120px]">
                        NISN
                      </th>
                      {gradeData.rubrics.map((rubric) => (
                        <th key={rubric.id} className="px-4 py-3 text-center text-sm font-medium bg-white min-w-[100px]">
                          <div className="space-y-1">
                            <div className="font-semibold flex items-center justify-center gap-1">
                              {rubric.name}
                              <Settings2 className="h-3 w-3 text-blue-600" />
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {rubric.type} (Bobot: {rubric.weight}%)
                            </div>
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                              {rubric.criteria.length} Kriteria
                            </Badge>
                          </div>
                        </th>
                      ))}
                      <th className="px-4 py-3 text-center text-sm font-medium bg-blue-50 min-w-[100px]">
                        <div className="flex items-center justify-center gap-1">
                          <div className="font-semibold">Total Nilai</div>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Info className="h-3 w-3 text-blue-600 cursor-help" />
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="font-semibold text-sm">Total Nilai</h4>
                                <p className="text-sm text-muted-foreground">
                                  Jumlah keseluruhan dari semua skor rubrik yang telah dinilai.
                                </p>
                                <div className="text-xs bg-blue-50 p-2 rounded">
                                  <strong>Rumus:</strong> Σ (Skor Rubrik 1 + Skor Rubrik 2 + ... + Skor Rubrik N)
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="text-xs text-muted-foreground">(Jumlah Semua Rubrik)</div>
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-medium bg-blue-50 min-w-[100px]">
                        <div className="flex items-center justify-center gap-1">
                          <div className="font-semibold">Nilai Akhir</div>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Info className="h-3 w-3 text-blue-600 cursor-help" />
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="font-semibold text-sm">Nilai Akhir</h4>
                                <p className="text-sm text-muted-foreground">
                                  Nilai akhir yang dihitung berdasarkan rata-rata tertimbang dari semua rubrik menggunakan bobot yang telah ditentukan.
                                </p>
                                <div className="text-xs bg-blue-50 p-2 rounded">
                                  <strong>Rumus:</strong> Σ ((Skor Rubrik × Bobot Rubrik) / 100) ÷ Σ (Bobot Rubrik)
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Bobot diambil dari pengaturan rubrik yang dibuat oleh guru.
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="text-xs text-muted-foreground">(Rata-rata Tertimbang)</div>
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-medium bg-blue-50 min-w-[100px]">
                        <div className="flex items-center justify-center gap-1">
                          <div className="font-semibold">Status</div>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Info className="h-3 w-3 text-blue-600 cursor-help" />
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="font-semibold text-sm">Status Kelulusan</h4>
                                <p className="text-sm text-muted-foreground">
                                  Status kelulusan siswa berdasarkan perbandingan nilai akhir dengan Kriteria Ketuntasan Minimal (KKM).
                                </p>
                                <div className="space-y-1 text-xs">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                                    <span><strong>Tuntas:</strong> Nilai Akhir ≥ KKM ({gradeData?.subject.kkm || 75})</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <AlertCircle className="h-3 w-3 text-red-600" />
                                    <span><strong>Remedial:</strong> Nilai Akhir &lt; KKM ({gradeData?.subject.kkm || 75})</span>
                                  </div>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {gradeData.students.map((student, index) => {
                      const isBelowKKM = student.isPassing === false;

                      return (
                        <tr key={student.id} className={`hover:bg-gray-50 ${isBelowKKM ? "bg-red-50" : ""}`}>
                          <td className="sticky left-0 z-10 bg-white px-4 py-3 font-medium border-r">
                            {index + 1}
                          </td>
                          <td className="sticky left-[50px] z-10 bg-white px-4 py-3 border-r">
                            <div>
                              <div className="font-medium">{student.fullName}</div>
                              {student.registrationCode && (
                                <div className="text-xs text-muted-foreground">
                                  {student.registrationCode}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {student.nisn || "-"}
                          </td>
                          {gradeData.rubrics.map((rubric) => {
                            const gradeValue = student.grades[`rubric_${rubric.id}`];

                            return (
                              <td
                                key={rubric.id}
                                className="px-4 py-3 text-center cursor-pointer hover:bg-blue-50 transition-colors"
                                onClick={() => handleCellClick(student.id, rubric.id)}
                              >
                                <div className="py-1 flex flex-col items-center gap-1">
                                  {gradeValue !== null && gradeValue !== undefined ? (
                                    <>
                                      <span className="font-medium">{gradeValue}</span>
                                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                                        <Settings2 className="h-2 w-2 mr-1" />
                                        Rubrik
                                      </Badge>
                                    </>
                                  ) : (
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-muted-foreground">-</span>
                                      <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-300">
                                        <Settings2 className="h-2 w-2 mr-1" />
                                        Input
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                          <td className="px-4 py-3 text-center font-bold bg-blue-50">
                            {(() => {
                              const totalScore = gradeData.rubrics.reduce((sum, rubric) => {
                                const gradeValue = student.grades[`rubric_${rubric.id}`];
                                return sum + (gradeValue !== null && gradeValue !== undefined ? gradeValue : 0);
                              }, 0);
                              return totalScore > 0 ? totalScore.toFixed(2) : "-";
                            })()}
                          </td>
                          <td className="px-4 py-3 text-center font-bold bg-blue-50">
                            {student.finalScore !== null ? student.finalScore.toFixed(2) : "-"}
                          </td>
                          <td className="px-4 py-3 text-center bg-blue-50">
                            {student.isPassing === null ? (
                              <span className="text-muted-foreground">-</span>
                            ) : student.isPassing ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Tuntas
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Remedial
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {gradeData.students.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                Tidak ada data siswa
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Rubric Modal */}
      <Dialog open={rubricModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-blue-600" />
              Input Nilai Rubrik - {selectedStudentForRubric?.fullName}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {selectedRubricForInput?.name} - {gradeData?.subject.name}
            </p>
            <Badge variant="outline" className="w-fit bg-blue-50 text-blue-700 border-blue-300">
              Penilaian Berdasarkan Kriteria
            </Badge>
          </DialogHeader>

          <div className="space-y-4">
            {!selectedRubric ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
                <span className="text-muted-foreground">Memuat form penilaian...</span>
              </div>
            ) : (
              <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">{selectedRubric.name}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setRubricModalOpen(false);
                    setSelectedRubric(null);
                    setRubricScores({});
                    setRubricScoreErrors({});
                  }}
                >
                  Tutup
                </Button>
              </div>

                {/* Validation Summary */}
                {Object.keys(rubricScoreErrors).length > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-800">
                        {Object.values(rubricScoreErrors).filter(error => error === "").length} dari {selectedRubric.criteria.length} kriteria valid
                        {Object.values(rubricScoreErrors).some(error => error !== "") && (
                          <span className="text-red-600 ml-1">
                            ({Object.values(rubricScoreErrors).filter(error => error !== "").length} perlu diperbaiki)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {selectedRubric.criteria.map((criterion: RubricCriteria) => (
                    <div key={criterion.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium">{criterion.name}</h4>
                          <p className="text-sm text-muted-foreground">{criterion.description}</p>
                        </div>
                        <Badge variant="secondary">Max: {criterion.max_score}</Badge>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Nilai:</Label>
                        <Input
                          type="number"
                          min="0"
                          max={criterion.max_score}
                          step="0.01"
                          value={rubricScores[criterion.id] || 0}
                          onChange={(e) => handleRubricScoreChange(criterion.id, parseFloat(e.target.value) || 0)}
                          className={`w-full ${rubricScoreErrors[criterion.id] ? 'border-red-500 focus:border-red-500' : ''}`}
                        />
                        {rubricScoreErrors[criterion.id] && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {rubricScoreErrors[criterion.id]}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRubricModalOpen(false);
                      setSelectedRubric(null);
                      setRubricScores({});
                    }}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleSaveRubricScore}
                    disabled={saving || hasValidationErrors()}
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Simpan Nilai
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
