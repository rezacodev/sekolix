"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useBreadcrumb } from "../../../BreadcrumbContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Pencil, 
  Copy, 
  FileText, 
  Book, 
  Calendar, 
  CheckCircle, 
  Clock,
  Loader2 
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Syllabus {
  id: number;
  title: string;
  subjectId: number;
  classId: number;
  academicYear: string;
  semester: number;
  coreCompetencies: string | null;
  basicCompetencies: string | null;
  indicators: string | null;
  subjectMatter: string | null;
  learningActivities: string | null;
  assessment: string | null;
  timeAllocation: string | null;
  learningResources: string | null;
  notes: string | null;
  isApproved: boolean;
  subject: {
    id: number;
    name: string;
    code: string | null;
  };
  class: {
    id: number;
    name: string;
  };
  lessonPlans: Array<{
    id: number;
    title: string;
    meetingNumber: number;
  }>;
}

export default function SyllabusDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { setBreadcrumbs } = useBreadcrumb();
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [loading, setLoading] = useState(true);
  const [duplicating, setDuplicating] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");

  const syllabusId = params?.id as string;

  useEffect(() => {
    fetchSyllabus();
    fetchAcademicYears();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syllabusId]);

  const fetchAcademicYears = async () => {
    try {
      const response = await fetch("/api/teacher/tahun-ajaran");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.academicYears) {
          setAcademicYears(data.academicYears.map((y: { label: string }) => y.label));
        }
      }
    } catch (error) {
      console.error("Error fetching academic years:", error);
    }
  };

  const fetchSyllabus = async () => {
    try {
      const response = await fetch(`/api/teacher/pembelajaran/syllabus/${syllabusId}`);
      if (!response.ok) throw new Error("Failed to fetch syllabus");
      
      const data = await response.json();
      setSyllabus(data.syllabus);

      if (setBreadcrumbs) {
        setBreadcrumbs([
          { label: "Pembelajaran", href: "/teacher" },
          { label: "Silabus & RPP", href: "/teacher/pembelajaran/silabus" },
          { label: data.syllabus.title },
        ]);
      }
    } catch (error) {
      console.error("Error fetching syllabus:", error);
      toast.error("Gagal memuat data silabus");
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async () => {
    if (!selectedAcademicYear || !selectedSemester) {
      toast.error("Pilih tahun ajaran dan semester");
      return;
    }

    setShowDuplicateDialog(false);
    setDuplicating(true);
    try {
      const response = await fetch(`/api/teacher/pembelajaran/syllabus/${syllabusId}/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academicYear: selectedAcademicYear,
          semester: parseInt(selectedSemester),
        }),
      });

      if (!response.ok) throw new Error("Failed to duplicate");

      const data = await response.json();
      toast.success("Silabus berhasil diduplikasi");
      router.push(`/teacher/pembelajaran/silabus/${data.syllabus.id}/edit`);
    } catch (error) {
      console.error("Error duplicating syllabus:", error);
      toast.error("Gagal menduplikasi silabus");
    } finally {
      setDuplicating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!syllabus) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Silabus tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={syllabus.title}
        description={`${syllabus.subject.name} - Kelas ${syllabus.class.name}`}
        backHref="/teacher/pembelajaran/silabus"
        backLabel="Kembali ke Silabus & RPP"
      >
        <div className="flex gap-2">
          <Button 
            onClick={() => {
              setSelectedAcademicYear(syllabus?.academicYear || "");
              setSelectedSemester(syllabus?.semester.toString() || "");
              setShowDuplicateDialog(true);
            }} 
            variant="outline" 
            disabled={duplicating}
          >
            {duplicating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            Duplikasi
          </Button>
          <Link href={`/teacher/pembelajaran/silabus/${syllabusId}/edit`}>
            <Button>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Silabus
            </Button>
          </Link>
        </div>
      </PageHeader>

      <div className="mt-6 space-y-6">
        {/* Informasi Dasar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Informasi Dasar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Mata Pelajaran</label>
                <p className="text-base mt-1">{syllabus.subject.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Kelas</label>
                <p className="text-base mt-1">Kelas {syllabus.class.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tahun Ajaran</label>
                <p className="text-base mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {syllabus.academicYear}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Semester</label>
                <p className="text-base mt-1">Semester {syllabus.semester}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  {syllabus.isApproved ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Disetujui
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" />
                      Menunggu Persetujuan
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Jumlah RPP</label>
                <p className="text-base mt-1">
                  <Badge variant="outline">{syllabus.lessonPlans.length} RPP</Badge>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kompetensi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Kompetensi Inti</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {syllabus.coreCompetencies || "-"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kompetensi Dasar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {syllabus.basicCompetencies || "-"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Indikator */}
        <Card>
          <CardHeader>
            <CardTitle>Indikator Pencapaian Kompetensi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {syllabus.indicators || "-"}
            </p>
          </CardContent>
        </Card>

        {/* Materi & Kegiatan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Materi Pembelajaran</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {syllabus.subjectMatter || "-"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kegiatan Pembelajaran</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {syllabus.learningActivities || "-"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Penilaian & Alokasi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Penilaian</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {syllabus.assessment || "-"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alokasi Waktu</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {syllabus.timeAllocation || "-"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sumber Belajar */}
        <Card>
          <CardHeader>
            <CardTitle>Sumber Belajar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {syllabus.learningResources || "-"}
            </p>
          </CardContent>
        </Card>

        {/* Catatan */}
        {syllabus.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Catatan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {syllabus.notes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Daftar RPP */}
        {syllabus.lessonPlans.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Daftar RPP ({syllabus.lessonPlans.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {syllabus.lessonPlans.map((rpp) => (
                  <Link
                    key={rpp.id}
                    href={`/teacher/pembelajaran/silabus/${syllabusId}/rpp/${rpp.id}`}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div>
                      <p className="font-medium">{rpp.title}</p>
                      <p className="text-sm text-muted-foreground">Pertemuan {rpp.meetingNumber}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Lihat
                    </Button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Duplicate Confirmation Modal */}
      <AlertDialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplikasi Silabus</AlertDialogTitle>
            <AlertDialogDescription>
              Pilih tahun ajaran dan semester untuk silabus yang akan diduplikasi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tahun Ajaran</label>
              <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tahun ajaran" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Semester</label>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Semester 1</SelectItem>
                  <SelectItem value="2">Semester 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDuplicate}>Duplikasi</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
