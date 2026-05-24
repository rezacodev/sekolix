"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { createTugasColumns, TugasRow } from "./tugas-columns";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { useBreadcrumb } from "../BreadcrumbContext";

export default function TugasPage() {
  const router = useRouter();
  const breadcrumbContext = useBreadcrumb();
  const { setBreadcrumbs } = breadcrumbContext || {};
  
  const [tugasData, setTugasData] = useState<TugasRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    subjectId: "",
  });

  // Pagination states
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Additional state for subjects list
  const [subjects, setSubjects] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  // Active academic year info
  const [activeAcademicYear, setActiveAcademicYear] = useState<string | null>(null);
  const [activeSemester, setActiveSemester] = useState<number | null>(null);

  // Fetch subjects for filter
  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/teacher/subjects");
      if (!response.ok) throw new Error("Failed to fetch subjects");
      const data = await response.json();
      setSubjects(
        (data.subjects || []).map((s: { id: bigint | number; name: string }) => ({
          id: s.id.toString(),
          name: s.name,
        }))
      );
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setLoadingSubjects(false);
    }
  };

  // Fetch active academic year
  const fetchActiveAcademicYear = async () => {
    try {
      const response = await fetch("/api/teacher/tahun-ajaran");
      if (!response.ok) throw new Error("Failed to fetch academic year");
      const data = await response.json();
      if (data.success && data.academicYears) {
        const active = data.academicYears.find((y: { isActive: boolean }) => y.isActive);
        if (active) {
          setActiveAcademicYear(active.label);
          // Determine semester based on current date
          const now = new Date();
          const startDate = new Date(active.startDate);
          const endDate = new Date(active.endDate);
          const midPoint = new Date((startDate.getTime() + endDate.getTime()) / 2);
          setActiveSemester(now < midPoint ? 1 : 2);
        }
      }
    } catch (error) {
      console.error("Error fetching active academic year:", error);
    }
  };

  // Fetch tugas
  const fetchTugas = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status && filters.status !== "all") params.append("status", filters.status);
      if (filters.search) params.append("search", filters.search);
      if (filters.subjectId && filters.subjectId !== "all") params.append("subjectId", filters.subjectId);
      params.append("page", pageIndex.toString());
      params.append("pageSize", pageSize.toString());

      const response = await fetch(`/api/teacher/tugas?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch assignments");

      const data = await response.json();
      const items = data.items || data.assignments || [];
      
      // Parse dates
      const parsed = items.map((item: {
        id: number;
        title: string;
        description: string | null;
        dueDate: string;
        maxScore: number;
        subjectName: string;
        className: string;
        createdAt: string;
        updatedAt: string;
        submissionCount: number;
        totalStudents: number;
      }) => ({
        ...item,
        dueDate: new Date(item.dueDate),
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      }));

      setTugasData(parsed);
      setTotalCount(data.totalCount || parsed.length);
    } catch (error) {
      console.error("Error fetching tugas:", error);
      toast.error("Gagal memuat data tugas");
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.search, filters.subjectId, pageIndex, pageSize]);

  useEffect(() => {
    // Set breadcrumbs
    if (setBreadcrumbs) {
      setBreadcrumbs([
        { label: "Kelola Tugas", href: "/teacher/tugas" },
      ]);
    }
    fetchSubjects();
    fetchActiveAcademicYear();
  }, [setBreadcrumbs]);

  useEffect(() => {
    if (!loadingSubjects) {
      fetchTugas();
    }
  }, [loadingSubjects, fetchTugas]);

  const handleView = useCallback((id: number) => {
    router.push(`/teacher/tugas/${id}/pengumpulan`);
  }, [router]);

  const handleEdit = useCallback((id: number) => {
    router.push(`/teacher/tugas/edit/${id}`);
  }, [router]);

  const handleDelete = useCallback((id: number) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/teacher/tugas?id=${deleteId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete assignment");

      toast.success("Tugas berhasil dihapus");
      fetchTugas(); // Refresh data
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting tugas:", error);
      toast.error("Gagal menghapus tugas");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleClone = useCallback(async () => {
    // TODO: Implement clone functionality
    toast.info("Fitur duplikat tugas akan segera tersedia");
  }, []);

  const columns = useMemo(
    () =>
      createTugasColumns({
        onView: handleView,
        onEdit: handleEdit,
        onDelete: handleDelete,
        onClone: handleClone,
      }),
    [handleView, handleEdit, handleDelete, handleClone]
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Kelola Tugas Online</h1>
          <p className="text-muted-foreground">
            Overview semua tugas online dari semua kelas yang Anda ampu
          </p>
        </div>
        {activeAcademicYear && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 min-w-[200px]">
            <p className="text-xs text-gray-600 mb-1">Tahun Ajaran Aktif</p>
            <p className="text-base font-semibold text-blue-900">
              {activeAcademicYear}
              {activeSemester && ` - Semester ${activeSemester}`}
            </p>
          </div>
        )}
      </div>

      {/* Tambah Tugas Button */}
      <div className="flex justify-end mb-6">
        <Button onClick={() => router.push("/teacher/tugas/buat")}>
          <Plus className="h-4 w-4 mr-2" />
          Buat Tugas Online
        </Button>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Memuat data...</p>
          </div>
        ) : (
          <DataTable
          columns={columns}
          data={tugasData}
          searchKey="title"
          searchPlaceholder="Cari judul tugas atau deskripsi..."
          serverSide
          totalCount={totalCount}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={(p) => setPageIndex(p)}
          onPageSizeChange={(ps) => {
            setPageSize(ps);
            setPageIndex(0);
          }}
          onSearchChange={(value) => {
            setFilters((prev) => ({ ...prev, search: value }));
            setPageIndex(0);
          }}
          filterConfig={[
            {
              column: "subjectName",
              title: "Mata Pelajaran",
              options: subjects.map((s) => ({
                label: s.name,
                value: s.id,
              })),
            },
            {
              column: "status",
              title: "Status",
              options: [
                { label: "Akan Datang", value: "upcoming" },
                { label: "Sudah Lewat", value: "overdue" },
              ],
            },
          ]}
          externalFilters={{
            subjectName: filters.subjectId,
            status: filters.status,
          }}
          onFilterChange={(column, value) => {
            if (column === "status") {
              setFilters((prev) => ({
                ...prev,
                status: value || "all",
              }));
            }
            if (column === "subjectName") {
              setFilters((prev) => ({
                ...prev,
                subjectId: value || "all",
              }));
            }
            setPageIndex(0); // Reset ke halaman pertama saat filter berubah
          }}
        />
        )}
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Hapus Tugas"
        description="Apakah Anda yakin ingin menghapus tugas ini? Tindakan ini tidak dapat dibatalkan dan semua data pengumpulan tugas akan ikut terhapus."
        confirmText={isDeleting ? "Menghapus..." : "Hapus"}
        cancelText="Batal"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDeleteId(null);
        }}
      />
    </div>
  );
}
