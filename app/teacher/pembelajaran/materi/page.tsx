"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useBreadcrumb } from "../../BreadcrumbContext";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createMaterialColumns, MaterialRow } from "./materi-columns";

interface Subject {
  id: number;
  name: string;
  code: string | null;
}

interface Class {
  id: number;
  name: string;
}

export default function MateriPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setBreadcrumbs } = useBreadcrumb();
  
  // Data states
  const [materials, setMaterials] = useState<MaterialRow[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Filters - Initialize from query params immediately
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>(
    searchParams.get('subjectId') || undefined
  );
  const [selectedClass, setSelectedClass] = useState<string | undefined>(
    searchParams.get('classId') || undefined
  );
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();

  // Pagination
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

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
    }
  }, []);

  // Fetch materials
  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSubject) params.append("subjectId", selectedSubject);
      if (selectedClass) params.append("classId", selectedClass);
      if (selectedStatus) params.append("status", selectedStatus);
      params.append("page", pageIndex.toString());
      params.append("pageSize", pageSize.toString());

      const url = `/api/teacher/pembelajaran/materials?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error("Failed to fetch materials");

      const data = await response.json();
      const items = data.items || data.materials || [];
      const mapped: MaterialRow[] = items.map((m: unknown) => {
        const material = m as { id: number; title: string; subject: { name: string }; class?: { name: string }; fileType: string; fileName: string; fileSize?: number; fileUrl: string; externalLink?: string; publishedAt: string; views: number; downloads: number };
        return {
          id: material.id,
          title: material.title,
          subjectName: material.subject.name,
          className: material.class?.name || null,
          fileType: material.fileType,
          fileName: material.fileName,
          fileSize: material.fileSize,
          fileUrl: material.fileUrl,
          externalLink: material.externalLink,
          publishedAt: material.publishedAt,
          views: material.views,
          downloads: material.downloads,
        };
      });

      setMaterials(mapped);
      setTotalCount(data.totalCount || mapped.length);
      setBreadcrumbs([
        { label: "Pembelajaran", href: "/teacher" },
        { label: "Materi Pembelajaran" },
      ]);
    } catch (error) {
      console.error("Error fetching materials:", error);
      toast.error("Gagal memuat daftar materi");
    } finally {
      setLoading(false);
    }
  }, [selectedSubject, selectedClass, selectedStatus, pageIndex, pageSize, setBreadcrumbs]);

  // Delete material
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/teacher/pembelajaran/materials?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete material");

      toast.success("Materi berhasil dihapus");
      fetchMaterials();
    } catch (error) {
      console.error("Error deleting material:", error);
      toast.error("Gagal menghapus materi");
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchClasses();
  }, [fetchSubjects, fetchClasses]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Memuat data...</p>
      </div>
    );
  }

  const materialColumns = createMaterialColumns({
    onDelete: (id) => setDeleteConfirmId(id),
  });

  return (
    <div>
      <PageHeader
        title="Materi Pembelajaran"
        description="Kelola materi pembelajaran untuk siswa"
      >
        <Button onClick={() => router.push("/teacher/pembelajaran/materi/upload")}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Materi
        </Button>
      </PageHeader>

      <div className="mt-6">
        <DataTable
          columns={materialColumns}
          data={materials}
          searchKey="title"
          searchPlaceholder="Cari materi..."
          serverSide
          totalCount={totalCount}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={(p) => setPageIndex(p)}
          onPageSizeChange={(ps) => {
            setPageSize(ps);
            setPageIndex(0);
          }}
          onFilterChange={(column, value) => {
            if (column === "subjectName") setSelectedSubject(value);
            if (column === "className") setSelectedClass(value);
            if (column === "publishedAt") setSelectedStatus(value);
            setPageIndex(0); // Reset ke halaman pertama saat filter berubah
          }}
          externalFilters={{
            subjectName: selectedSubject,
            className: selectedClass,
            publishedAt: selectedStatus,
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
              column: "publishedAt",
              title: "Status",
              options: [
                { label: "Terbit", value: "published" },
                { label: "Draft", value: "draft" },
              ],
            },
          ]}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmId !== null}
        onCancel={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId) {
            handleDelete(deleteConfirmId);
            setDeleteConfirmId(null);
          }
        }}
        title="Hapus Materi"
        description="Apakah Anda yakin ingin menghapus materi ini? Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  );
}
