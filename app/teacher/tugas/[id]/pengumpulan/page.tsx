"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  Edit2,
  FileText,
  Eye,
  Link2,
  X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { useBreadcrumb } from "@/app/teacher/BreadcrumbContext";

interface AssignmentInfo {
  id: number;
  title: string;
  description: string | null;
  dueDate: string;
  maxScore: number;
  subjectName: string;
  rombelName: string;
  academicYear: string;
  semester: number;
}

interface Student {
  id: string;
  name: string;
  registrationCode: string | null;
  submittedAt: string | null;
  score: number | null;
  feedback: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  status: "not_submitted" | "submitted" | "graded";
}

interface Summary {
  total: number;
  submitted: number;
  graded: number;
  notSubmitted: number;
}

function isImageUrl(url: string): boolean {
  const lower = url.toLowerCase().split("?")[0];
  return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/.test(lower);
}

export default function PengumpulanTugasPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const breadcrumbContext = useBreadcrumb();
  const { setBreadcrumbs } = breadcrumbContext || {};

  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState<AssignmentInfo | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);

  // Grade dialog state
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [gradeForm, setGradeForm] = useState({
    score: "",
    feedback: "",
    attachmentUrl: "",
    attachmentName: "",
  });
  const [isGrading, setIsGrading] = useState(false);

  // Image preview modal state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string>("");

  useEffect(() => {
    if (assignment && setBreadcrumbs) {
      setBreadcrumbs([
        { label: "Tugas Online", href: "/teacher/tugas" },
        { label: assignment.title, href: `/teacher/tugas/${id}/pengumpulan` },
      ]);
    }
  }, [assignment, setBreadcrumbs, id]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/teacher/tugas/${id}/pengumpulan`);
      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();
      setAssignment(data.assignment);
      setStudents(data.students);
      setSummary(data.summary);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Gagal memuat data pengumpulan");
      router.push("/teacher/tugas");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (id) fetchData();
  }, [id, fetchData]);

  const handleGrade = (student: Student) => {
    setSelectedStudent(student);
    setGradeForm({
      score: student.score?.toString() || "",
      feedback: student.feedback || "",
      attachmentUrl: student.attachmentUrl || "",
      attachmentName: student.attachmentName || "",
    });
    setGradeDialogOpen(true);
  };

  const handleOpenAttachment = (student: Student) => {
    if (!student.attachmentUrl) return;
    if (isImageUrl(student.attachmentUrl)) {
      setPreviewName(student.attachmentName || "Lampiran");
      setPreviewUrl(student.attachmentUrl);
    } else {
      window.open(student.attachmentUrl, "_blank");
    }
  };

  const handleSubmitGrade = async () => {
    if (!selectedStudent) return;

    const scoreNum = parseFloat(gradeForm.score);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > (assignment?.maxScore || 100)) {
      toast.error(`Nilai harus antara 0 dan ${assignment?.maxScore || 100}`);
      return;
    }

    try {
      setIsGrading(true);
      const response = await fetch(`/api/teacher/tugas/${id}/pengumpulan`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          score: scoreNum,
          feedback: gradeForm.feedback || null,
          attachmentUrl: gradeForm.attachmentUrl || null,
          attachmentName: gradeForm.attachmentName || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to save grade");

      toast.success("Nilai berhasil disimpan");
      setGradeDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving grade:", error);
      toast.error("Gagal menyimpan nilai");
    } finally {
      setIsGrading(false);
    }
  };

  const getStatusBadge = (status: Student["status"]) => {
    switch (status) {
      case "graded":
        return (
          <Badge className="bg-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Sudah Dinilai
          </Badge>
        );
      case "submitted":
        return (
          <Badge className="bg-blue-500">
            <Clock className="h-3 w-3 mr-1" />
            Menunggu Penilaian
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <XCircle className="h-3 w-3 mr-1" />
            Belum Mengumpulkan
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!assignment) return null;

  const dueDate = new Date(assignment.dueDate);
  const isOverdue = dueDate < new Date();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengumpulan & Penilaian Tugas"
        description="Kelola pengumpulan dan nilai tugas siswa"
        backHref="/teacher/tugas"
        backLabel="Kembali ke Daftar Tugas"
      />

      {/* Assignment Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{assignment.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Rombel</p>
              <p className="font-medium">{assignment.rombelName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mata Pelajaran</p>
              <p className="font-medium">{assignment.subjectName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Deadline</p>
              <p className={`font-medium ${isOverdue ? "text-destructive" : ""}`}>
                {dueDate.toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(dueDate, { addSuffix: true, locale: localeId })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nilai Maksimal</p>
              <p className="font-medium">{assignment.maxScore}</p>
            </div>
          </div>
          {assignment.description && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Deskripsi Tugas</p>
              <p className="text-sm">{assignment.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{summary.total}</p>
                <p className="text-sm text-muted-foreground">Total Siswa</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{summary.submitted}</p>
                <p className="text-sm text-muted-foreground">Sudah Mengumpulkan</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{summary.graded}</p>
                <p className="text-sm text-muted-foreground">Sudah Dinilai</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-muted-foreground">{summary.notSubmitted}</p>
                <p className="text-sm text-muted-foreground">Belum Mengumpulkan</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengumpulan</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">No</TableHead>
                <TableHead>NIS</TableHead>
                <TableHead>Nama Siswa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Waktu Pengumpulan</TableHead>
                <TableHead>Lampiran</TableHead>
                <TableHead className="text-center">Nilai</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student, index) => (
                <TableRow key={student.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {student.registrationCode || "-"}
                  </TableCell>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{getStatusBadge(student.status)}</TableCell>
                  <TableCell>
                    {student.submittedAt ? (
                      <div>
                        <p className="text-sm">
                          {new Date(student.submittedAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(student.submittedAt), {
                            addSuffix: true,
                            locale: localeId,
                          })}
                        </p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {student.attachmentUrl ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenAttachment(student)}
                        className="gap-1"
                      >
                        {isImageUrl(student.attachmentUrl) ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                        {student.attachmentName || "File"}
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {student.score !== null ? (
                      <span className="font-semibold text-lg">{student.score}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGrade(student)}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      {student.status === "graded" ? "Edit Nilai" : "Beri Nilai"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {students.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Tidak ada siswa di rombel ini
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Grade Dialog */}
      <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Beri Nilai</DialogTitle>
            <DialogDescription>
              Siswa: <strong>{selectedStudent?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="score">
                Nilai <span className="text-destructive">*</span>
              </Label>
              <Input
                id="score"
                type="number"
                min="0"
                max={assignment.maxScore}
                step="0.1"
                value={gradeForm.score}
                onChange={(e) => setGradeForm({ ...gradeForm, score: e.target.value })}
                placeholder={`0 - ${assignment.maxScore}`}
              />
              <p className="text-xs text-muted-foreground">Nilai maksimal: {assignment.maxScore}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback">Catatan / Feedback</Label>
              <Textarea
                id="feedback"
                value={gradeForm.feedback}
                onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                placeholder="Berikan catatan atau feedback untuk siswa..."
                rows={3}
              />
            </div>
            <div className="space-y-2 border-t pt-4">
              <Label className="flex items-center gap-1">
                <Link2 className="h-3.5 w-3.5" />
                URL Lampiran Jawaban Siswa
              </Label>
              <Input
                value={gradeForm.attachmentUrl}
                onChange={(e) => setGradeForm({ ...gradeForm, attachmentUrl: e.target.value })}
                placeholder="https://drive.google.com/... atau URL file lain"
              />
              <Input
                value={gradeForm.attachmentName}
                onChange={(e) => setGradeForm({ ...gradeForm, attachmentName: e.target.value })}
                placeholder="Nama file (opsional)"
              />
              <p className="text-xs text-muted-foreground">
                Isi jika siswa menyerahkan jawaban via link (Google Drive, dll.)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setGradeDialogOpen(false)}
              disabled={isGrading}
            >
              Batal
            </Button>
            <Button onClick={handleSubmitGrade} disabled={isGrading}>
              {isGrading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Nilai"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-0 right-0 z-10 bg-black/60 text-white hover:bg-black/80"
              onClick={() => setPreviewUrl(null)}
            >
              <X className="h-5 w-5" />
            </Button>
            <p className="text-white text-sm mb-2 text-center">{previewName}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt={previewName}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            <div className="flex justify-center mt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.open(previewUrl, "_blank")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Buka di Tab Baru
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
