"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useBreadcrumb } from "../../BreadcrumbContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
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
import { FileText, BookOpen, Plus } from "lucide-react";
import { toast } from "sonner";
import { createSyllabusColumns, SyllabusRow } from "./silabus-columns";
import { createLessonPlanColumns, LessonPlanRow } from "./rpp-columns";

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

interface SyllabusApiResponse {
  id: number;
  title: string;
  subject: { id: number; name: string };
  class: { id: number; name: string };
  academicYear: string;
  semester: number;
  isApproved: boolean;
  lessonPlansCount: number;
}

interface LessonPlanApiResponse {
  id: number;
  title: string;
  subject: { id: number; name: string };
  class: { id: number; name: string };
  meetingNumber: number | null;
  isApproved: boolean;
  syllabus: {
    id: number;
    academicYear: string;
    semester: number;
  } | null;
}

export default function SilabusRPPPage() {
  const router = useRouter();
  const { setBreadcrumbs } = useBreadcrumb();
  const [activeTab, setActiveTab] = useState("silabus");

  // Data states
  const [syllabuses, setSyllabuses] = useState<SyllabusRow[]>([]);
  const [lessonPlans, setLessonPlans] = useState<LessonPlanRow[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deleteType, setDeleteType] = useState<"silabus" | "rpp">("silabus");

  // Duplicate modal states
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateId, setDuplicateId] = useState<number | null>(null);
  const [duplicating, setDuplicating] = useState(false);
  const [availableAcademicYears, setAvailableAcademicYears] = useState<string[]>([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");

  // Filters for silabus
  const [syllabusSubject, setSyllabusSubject] = useState<string | undefined>();
  const [syllabusClass, setSyllabusClass] = useState<string | undefined>();
  const [syllabusYear, setSyllabusYear] = useState<string | undefined>();
  const [syllabusSemester, setSyllabusSemester] = useState<string | undefined>();

  // Pagination for silabus
  const [syllabusPageIndex, setSyllabusPageIndex] = useState(0);
  const [syllabusPageSize, setSyllabusPageSize] = useState(10);
  const [syllabusTotalCount, setSyllabusTotalCount] = useState(0);

  // Filters for RPP
  const [rppSubject, setRppSubject] = useState<string | undefined>();
  const [rppClass, setRppClass] = useState<string | undefined>();

  // Pagination for RPP
  const [rppPageIndex, setRppPageIndex] = useState(0);
  const [rppPageSize, setRppPageSize] = useState(10);
  const [rppTotalCount, setRppTotalCount] = useState(0);

  // Fetch subjects
  const fetchSubjects = useCallback(async () => {
    try {
      const response = await fetch("/api/teacher/subjects");
      if (!response.ok) throw new Error("Failed to fetch subjects");
      const data = await response.json();
      setSubjects(data.subjects || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast.error("Gagal memuat daftar mata pelajaran");
    }
  }, []);

  // Fetch classes
  const fetchClasses = useCallback(async () => {
    try {
      const response = await fetch("/api/teacher/classes");
      if (!response.ok) throw new Error("Failed to fetch classes");
      const data = await response.json();
      setClasses(data.classes || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Gagal memuat daftar kelas");
    }
  }, []);

  // Fetch academic years
  const fetchAcademicYears = useCallback(async () => {
    try {
      const response = await fetch("/api/teacher/tahun-ajaran");
      if (!response.ok) throw new Error("Failed to fetch academic years");
      const data = await response.json();
      setAcademicYears(data.academicYears || []);
    } catch (error) {
      console.error("Error fetching academic years:", error);
    }
  }, []);

  // Fetch syllabuses
  const fetchSyllabuses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (syllabusSubject) params.append("subjectId", syllabusSubject);
      if (syllabusClass) params.append("classId", syllabusClass);
      if (syllabusYear) params.append("academicYear", syllabusYear);
      if (syllabusSemester) params.append("semester", syllabusSemester);
      params.append("page", syllabusPageIndex.toString());
      params.append("pageSize", syllabusPageSize.toString());

      const url = `/api/teacher/pembelajaran/silabus?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error("Failed to fetch syllabuses");

      const data = await response.json();
      const items = data.items || data.syllabuses || [];
      const mapped: SyllabusRow[] = items.map((s: SyllabusApiResponse) => ({
        id: s.id,
        title: s.title,
        subjectName: s.subject.name,
        className: s.class.name,
        academicYear: s.academicYear,
        semester: s.semester,
        isApproved: s.isApproved,
        lessonPlansCount: s.lessonPlansCount || 0,
      }));

      setSyllabuses(mapped);
      setSyllabusTotalCount(data.totalCount || mapped.length);
      setBreadcrumbs([
        { label: "Pembelajaran", href: "/teacher" },
        { label: "Silabus & RPP" },
      ]);
    } catch (error) {
      console.error("Error fetching syllabuses:", error);
      toast.error("Gagal memuat daftar silabus");
    } finally {
      setLoading(false);
    }
  }, [
    syllabusSubject,
    syllabusClass,
    syllabusYear,
    syllabusSemester,
    syllabusPageIndex,
    syllabusPageSize,
    setBreadcrumbs,
  ]);

  // Fetch lesson plans
  const fetchLessonPlans = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (rppSubject) params.append("subjectId", rppSubject);
      if (rppClass) params.append("classId", rppClass);
      params.append("page", rppPageIndex.toString());
      params.append("pageSize", rppPageSize.toString());

      const url = `/api/teacher/pembelajaran/rpp${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      const response = await fetch(url);

      if (!response.ok) throw new Error("Failed to fetch lesson plans");

      const data = await response.json();
      const items = data.items || data.lessonPlans || [];
      const mapped: LessonPlanRow[] = items.map((lp: LessonPlanApiResponse) => ({
        id: lp.id,
        syllabusId: lp.syllabus?.id || 0,
        title: lp.title,
        subjectName: lp.subject.name,
        className: lp.class.name,
        meetingNumber: lp.meetingNumber,
        isApproved: lp.isApproved,
        academicYear: lp.syllabus?.academicYear || "-",
        semester: lp.syllabus?.semester || 0,
      }));

      setLessonPlans(mapped);
      setRppTotalCount(data.totalCount || mapped.length);
    } catch (error) {
      console.error("Error fetching lesson plans:", error);
      toast.error("Gagal memuat daftar RPP");
    } finally {
      setLoading(false);
    }
  }, [rppSubject, rppClass, rppPageIndex, rppPageSize]);
  // Duplicate syllabus - open modal
  const handleDuplicateSyllabus = async (id: number) => {
    const syllabus = syllabuses.find(s => s.id === id);
    if (syllabus) {
      setSelectedAcademicYear(syllabus.academicYear);
      setSelectedSemester(syllabus.semester.toString());
    }
    setDuplicateId(id);
    setShowDuplicateDialog(true);
  };

  // Execute duplication
  const executeDuplicate = async () => {
    if (!selectedAcademicYear || !selectedSemester) {
      toast.error("Pilih tahun ajaran dan semester");
      return;
    }

    setShowDuplicateDialog(false);
    setDuplicating(true);

    try {
      const response = await fetch(`/api/teacher/pembelajaran/syllabus/${duplicateId}/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academicYear: selectedAcademicYear,
          semester: parseInt(selectedSemester),
        }),
      });

      if (!response.ok) throw new Error("Failed to duplicate");

      const data = await response.json();
      const rppCount = data.syllabus.rppCount || 0;
      const message = rppCount > 0 
        ? `Silabus dan ${rppCount} RPP berhasil diduplikasi`
        : "Silabus berhasil diduplikasi";
      toast.success(message);
      
      // Redirect to edit page
      router.push(`/teacher/pembelajaran/silabus/${data.syllabus.id}/edit`);
    } catch (error) {
      console.error("Error duplicating:", error);
      toast.error("Gagal menduplikasi silabus");
    } finally {
      setDuplicating(false);
    }
  };
  // Delete syllabus
  const handleDeleteSyllabus = async (id: number) => {
    try {
      const response = await fetch(
        `/api/teacher/pembelajaran/silabus?id=${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete syllabus");

      toast.success("Silabus berhasil dihapus");
      fetchSyllabuses();
    } catch (error) {
      console.error("Error deleting syllabus:", error);
      toast.error("Gagal menghapus silabus");
    }
  };

  // Delete lesson plan
  const handleDeleteLessonPlan = async (id: number) => {
    try {
      const response = await fetch(`/api/teacher/pembelajaran/rpp?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete lesson plan");

      toast.success("RPP berhasil dihapus");
      fetchLessonPlans();
    } catch (error) {
      console.error("Error deleting lesson plan:", error);
      toast.error("Gagal menghapus RPP");
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchClasses();
    fetchAcademicYears();
    fetchAvailableAcademicYears();
  }, [fetchSubjects, fetchClasses, fetchAcademicYears]);

  const fetchAvailableAcademicYears = async () => {
    try {
      const response = await fetch("/api/teacher/tahun-ajaran");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.academicYears) {
          setAvailableAcademicYears(data.academicYears.map((y: { label: string }) => y.label));
        }
      }
    } catch (error) {
      console.error("Error fetching available academic years:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "silabus") {
      fetchSyllabuses();
    } else {
      fetchLessonPlans();
    }
  }, [activeTab, fetchSyllabuses, fetchLessonPlans]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Memuat data...</p>
      </div>
    );
  }

  // Create columns with delete handlers
  const syllabusColumns = createSyllabusColumns({
    onDelete: (id) => {
      setDeleteConfirmId(id);
      setDeleteType("silabus");
    },
    onDuplicate: handleDuplicateSyllabus,
  });

  const lessonPlanColumns = createLessonPlanColumns({
    onDelete: (id) => {
      setDeleteConfirmId(id);
      setDeleteType("rpp");
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Silabus & RPP</h1>
          <p className="text-sm text-muted-foreground">
            Kelola silabus dan rencana pelaksanaan pembelajaran
          </p>
        </div>
        <Button
          onClick={() => {
            if (activeTab === "silabus") {
              router.push("/teacher/pembelajaran/silabus/create");
            } else {
              router.push("/teacher/pembelajaran/silabus/rpp/create");
            }
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          {activeTab === "silabus" ? "Buat Silabus" : "Buat RPP"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList variant="underline" className="gap-4">
          <TabsTrigger value="silabus" variant="underline">
            <BookOpen className="h-4 w-4" />
            Silabus
          </TabsTrigger>
          <TabsTrigger value="rpp" variant="underline">
            <FileText className="h-4 w-4" />
            RPP
          </TabsTrigger>
        </TabsList>

        {/* Silabus Tab */}
        <TabsContent value="silabus" className="space-y-4">

          <DataTable
            columns={syllabusColumns}
            data={syllabuses}
            searchKey="title"
            searchPlaceholder="Cari silabus..."
            serverSide
            totalCount={syllabusTotalCount}
            pageIndex={syllabusPageIndex}
            pageSize={syllabusPageSize}
            onPageChange={(p) => setSyllabusPageIndex(p)}
            onPageSizeChange={(ps) => {
              setSyllabusPageSize(ps);
              setSyllabusPageIndex(0);
            }}
            onFilterChange={(column, value) => {
              if (column === "subjectName") setSyllabusSubject(value);
              if (column === "className") setSyllabusClass(value);
              if (column === "academicYear") setSyllabusYear(value);
              if (column === "semester") setSyllabusSemester(value);
              setSyllabusPageIndex(0); // Reset ke halaman pertama saat filter berubah
            }}
            externalFilters={{
              subjectName: syllabusSubject,
              className: syllabusClass,
              academicYear: syllabusYear,
              semester: syllabusSemester,
            }}
            filterConfig={[
              {
                column: "subjectName",
                title: "Mata Pelajaran",
                options: subjects.map((s) => ({
                  label: s.name,
                  value: s.id.toString(),
                })),
              },
              {
                column: "className",
                title: "Kelas",
                options: classes.map((c) => ({
                  label: `Kelas ${c.name}`,
                  value: c.id.toString(),
                })),
              },
              {
                column: "academicYear",
                title: "Tahun Ajaran",
                options: academicYears.map((y) => ({
                  label: y.isActive ? `${y.label} (Aktif)` : y.label,
                  value: y.label,
                })),
              },
              {
                column: "semester",
                title: "Semester",
                options: [
                  { label: "Semester 1", value: "1" },
                  { label: "Semester 2", value: "2" },
                ],
              },
            ]}
          />
        </TabsContent>

        {/* RPP Tab */}
        <TabsContent value="rpp" className="space-y-4">
          <DataTable
            columns={lessonPlanColumns}
            data={lessonPlans}
            searchKey="title"
            searchPlaceholder="Cari RPP..."
            serverSide
            totalCount={rppTotalCount}
            pageIndex={rppPageIndex}
            pageSize={rppPageSize}
            onPageChange={(p) => setRppPageIndex(p)}
            onPageSizeChange={(ps) => {
              setRppPageSize(ps);
              setRppPageIndex(0);
            }}
            onFilterChange={(column, value) => {
              if (column === "subjectName") setRppSubject(value);
              if (column === "className") setRppClass(value);
              setRppPageIndex(0); // Reset ke halaman pertama saat filter berubah
            }}
            externalFilters={{
              subjectName: rppSubject,
              className: rppClass,
            }}
            filterConfig={[
              {
                column: "subjectName",
                title: "Mata Pelajaran",
                options: subjects.map((s) => ({
                  label: s.name,
                  value: s.id.toString(),
                })),
              },
              {
                column: "className",
                title: "Kelas",
                options: classes.map((c) => ({
                  label: `Kelas ${c.name}`,
                  value: c.id.toString(),
                })),
              },
            ]}
          />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmId !== null}
        onCancel={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId) {
            if (deleteType === "silabus") {
              handleDeleteSyllabus(deleteConfirmId);
            } else {
              handleDeleteLessonPlan(deleteConfirmId);
            }
            setDeleteConfirmId(null);
          }
        }}
        title={`Hapus ${deleteType === "silabus" ? "Silabus" : "RPP"}`}
        description={`Apakah Anda yakin ingin menghapus ${
          deleteType === "silabus" ? "silabus" : "RPP"
        } ini? Tindakan ini tidak dapat dibatalkan.`}
      />

      {/* Duplicate Confirmation Modal */}
      <AlertDialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplikasi Silabus</AlertDialogTitle>
            <AlertDialogDescription>
              Pilih tahun ajaran dan semester untuk silabus yang akan diduplikasi. Semua RPP terkait juga akan ikut diduplikasi.
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
                  {availableAcademicYears.map((year) => (
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
            <AlertDialogAction onClick={executeDuplicate} disabled={duplicating}>
              {duplicating ? "Menduplikasi..." : "Duplikasi"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
