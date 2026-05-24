"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { createTugasColumns, TugasRow } from "@/app/teacher/tugas/tugas-columns";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { useBreadcrumb } from "@/app/teacher/BreadcrumbContext";

interface TugasApiResponse {
  items: Array<{
    id: number;
    title: string;
    description: string | null;
    dueDate: string;
    maxScore: number;
    subjectName: string;
    rombelName: string;
    submissionCount: number;
    totalStudents: number;
    createdAt: string;
    updatedAt: string;
    status: "upcoming" | "overdue";
  }>;
  totalCount: number;
  page: number;
  pageSize: number;
}

interface ClassInfo {
  className: string;
  rombelName: string;
  subjectName: string;
}

export default function KelasTugasPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const rombelId = params.rombelId as string;
  const subjectId = searchParams.get("subjectId");

  const breadcrumbContext = useBreadcrumb();
  const { setBreadcrumbs } = breadcrumbContext || {};

  const [tugasData, setTugasData] = useState<TugasRow[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (classInfo && setBreadcrumbs) {
      setBreadcrumbs([
        { label: "Kelas Saya", href: "/teacher/kelas" },
        { 
          label: `${classInfo.className} ${classInfo.rombelName}`, 
          href: `/teacher/kelas/${rombelId}/siswa` 
        },
        { 
          label: `Tugas Online ${classInfo.subjectName}`, 
          href: `/teacher/kelas/${rombelId}/tugas${subjectId ? `?subjectId=${subjectId}` : ''}` 
        },
      ]);
    }
  }, [classInfo, setBreadcrumbs, rombelId, subjectId]);

  const fetchTugas = useCallback(async () => {
    try {
      
      // Fetch class info first if not loaded
      if (!classInfo) {
        const classResponse = await fetch(`/api/teacher/kelas/${rombelId}`);
        if (classResponse.ok) {
          const classData = await classResponse.json();
          
          // Fetch subject name if subjectId provided
          let subjectName = "";
          if (subjectId) {
            const subjectResponse = await fetch(`/api/subjects/${subjectId}`);
            if (subjectResponse.ok) {
              const subjectData = await subjectResponse.json();
              subjectName = subjectData.name || "";
            }
          }
          
          setClassInfo({
            className: classData.className || "",
            rombelName: classData.rombelName || "",
            subjectName: subjectName,
          });
        }
      }
      
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter);
      if (subjectId) params.append("subjectId", subjectId);
      if (rombelId) params.append("rombelId", rombelId);

      const response = await fetch(`/api/teacher/tugas?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch assignments");

      const data: TugasApiResponse = await response.json();
      
      // Parse dates
      const parsed = data.items.map((item) => ({
        ...item,
        dueDate: new Date(item.dueDate),
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
        status: item.status,
      }));

      setTugasData(parsed);
    } catch (error) {
      console.error("Error fetching tugas:", error);
      toast.error("Gagal memuat data tugas");
    }
  }, [classInfo, rombelId, subjectId, statusFilter]);

  useEffect(() => {
    if (subjectId) {
      fetchTugas();
    }
  }, [statusFilter, subjectId, fetchTugas]);

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
    [handleEdit, handleView, handleDelete, handleClone]
  );

  const handleCreateTugas = () => {
    // Navigate to create form with pre-filled rombelId and subjectId
    const queryParams = new URLSearchParams();
    if (subjectId) queryParams.append("subjectId", subjectId);
    queryParams.append("rombelId", rombelId);
    
    router.push(`/teacher/tugas/buat?${queryParams.toString()}`);
  };

  if (!subjectId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-muted-foreground">Pilih mata pelajaran terlebih dahulu</p>
        <Button onClick={() => router.push("/teacher/kelas")}>
          Kembali ke Kelas
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={classInfo ? `Tugas Online - ${classInfo.subjectName}` : "Tugas Online"}
        description={classInfo ? `Kelola tugas online untuk ${classInfo.className} ${classInfo.rombelName}` : "Kelola tugas online untuk kelas ini"}
        backHref={`/teacher/kelas/${rombelId}/siswa`}
        backLabel={classInfo ? `Kembali ke ${classInfo.className} ${classInfo.rombelName}` : "Kembali"}
      >
        <Button onClick={handleCreateTugas}>
          <Plus className="h-4 w-4 mr-2" />
          Buat Tugas Online
        </Button>
      </PageHeader>

      <div className="mt-6">
        <DataTable
          columns={columns}
          data={tugasData}
          searchKey="title"
          searchPlaceholder="Cari judul tugas atau deskripsi..."
          filterConfig={[
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
            status: statusFilter,
          }}
          onFilterChange={(column, value) => {
            if (column === "status") {
              setStatusFilter(value || "all");
            }
          }}
        />
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
