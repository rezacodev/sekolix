"use client";

import { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import SubjectForm from "./SubjectForm";
import { useBreadcrumb } from "@/hooks/useBreadcrumb";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Plus } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Subject {
  id: number;
  code?: string;
  name: string;
  is_practice: boolean;
  curriculums: Array<{
    curriculum_id: number;
    curriculum: { id: number; name: string };
  }>;
  classes: Array<{
    class_id: number;
    class: { id: number; name: string };
  }>;
  programs: Array<{
    program_id: string;
    program: { id: string; name: string };
  }>;
}

interface CurriculumOption {
  id: number;
  name: string;
}

export default function MataPelajaranPage() {
  const breadcrumbContext = useBreadcrumb();
  const { setBreadcrumbs } = breadcrumbContext || {};

  const [data, setData] = useState<Subject[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string | undefined>>({});
  const [curriculumOptions, setCurriculumOptions] = useState<CurriculumOption[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Subject | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    if (setBreadcrumbs) {
      setBreadcrumbs([
        { label: "Manajemen Akademik", href: "/admin/manajemen-akademik" },
        { label: "Kurikulum & Mata Pelajaran", href: "/admin/manajemen-akademik/kurikulum-mapel" },
        {
          label: "Mata Pelajaran",
          href: "/admin/manajemen-akademik/kurikulum-mapel/mata-pelajaran"
        }
      ]);
    }
  }, [setBreadcrumbs]);

  const fetchData = useCallback(async () => {
    const q = new URLSearchParams({
      page: String(pageIndex),
      pageSize: String(pageSize),
      search,
      ...filters
    });
    const res = await fetch(
      `/api/admin/manajemen-akademik/kurikulum-mapel/mata-pelajaran?${q.toString()}`
    );
    const result = await res.json();
    setData(result.data);
    setTotalCount(result.totalCount);
  }, [pageIndex, pageSize, search, filters]);

  const fetchCurriculumOptions = useCallback(async () => {
    const res = await fetch(
      "/api/admin/manajemen-akademik/kurikulum-mapel/curriculums?page=0&pageSize=100"
    );
    const result = await res.json();
    setCurriculumOptions(result.data);
  }, []);

  useEffect(() => {
    fetchCurriculumOptions();
  }, [fetchCurriculumOptions]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = useCallback((item: Subject) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback((id: number) => {
    setConfirmDelete(id);
  }, []);

  const confirmDeleteSubject = async () => {
    if (!confirmDelete) return;
    try {
      const response = await fetch(
        `/api/admin/manajemen-akademik/kurikulum-mapel/mata-pelajaran/${confirmDelete}`,
        {
          method: "DELETE"
        }
      );

      if (response.ok) {
        toast.success("Mata pelajaran berhasil dihapus");
        fetchData();
        setConfirmDelete(null);
      } else {
        const data = await response.json();
        toast.error(data.error || "Gagal menghapus mata pelajaran");
      }
    } catch (error) {
      console.error("Error deleting subject:", error);
      toast.error("Terjadi kesalahan saat menghapus mata pelajaran");
    } finally {
      setConfirmDelete(null);
    }
  };

  const filterConfig: never[] = [];

  const columns = [
    { accessorKey: "code", header: "Kode" },
    { accessorKey: "name", header: "Nama Mata Pelajaran" },
    {
      accessorKey: "curriculums",
      header: "Kurikulum",
      cell: ({ row }: { row: { original: Subject } }) => (
        <div className="flex flex-wrap gap-1 max-w-64">
          {row.original.curriculums.map((sc, index) => (
            <Badge key={index} variant="secondary" className="text-xs truncate flex-shrink-0">
              {sc.curriculum.name}
            </Badge>
          ))}
        </div>
      )
    },
    {
      accessorKey: "classes",
      header: "Kelas",
      cell: ({ row }: { row: { original: Subject } }) => (
        <div className="flex flex-wrap gap-1 max-w-64">
          {row.original.classes.length > 0 ? (
            row.original.classes.map((sc, index) => (
              <Badge key={index} variant="outline" className="text-xs truncate flex-shrink-0">
                {sc.class.name}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          )}
        </div>
      )
    },
    {
      accessorKey: "programs",
      header: "Program",
      cell: ({ row }: { row: { original: Subject } }) => (
        <div className="flex flex-wrap gap-1 max-w-64">
          {row.original.programs.length > 0 ? (
            row.original.programs.map((sp, index) => (
              <Badge key={index} variant="outline" className="text-xs truncate flex-shrink-0">
                {sp.program.name}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          )}
        </div>
      )
    },
    {
      accessorKey: "is_practice",
      header: "Praktik",
      cell: ({ getValue }: { getValue: () => unknown }) =>
        (getValue() as boolean) ? "Ya" : "Tidak"
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }: { row: { original: Subject } }) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(row.original)}>
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => handleDelete(row.original.id)}>
            Hapus
          </Button>
        </div>
      )
    }
  ];

  const onFilterChange = (column: string, value?: string) => {
    setFilters(prev => ({ ...prev, [column]: value }));
    setPageIndex(0);
  };

  const onSearchChange = (value: string) => {
    setSearch(value);
    setPageIndex(0);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <AdminPageHeader
            title="Mata Pelajaran"
            description="Kelola mata pelajaran untuk setiap kurikulum"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingItem(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Mata Pelajaran
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>
              {editingItem ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}
            </DialogTitle>
            <SubjectForm
              initialData={editingItem}
              curriculumOptions={curriculumOptions}
              onSubmit={() => {
                setIsDialogOpen(false);
                fetchData();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      <DataTable
        columns={columns}
        data={data}
        searchKey="name"
        filterConfig={filterConfig}
        externalFilters={filters}
        onFilterChange={onFilterChange}
        onSearchChange={onSearchChange}
        serverSide
        totalCount={totalCount}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
      />
      <ConfirmDialog
        open={!!confirmDelete}
        title="Hapus Mata Pelajaran"
        description="Apakah Anda yakin ingin menghapus mata pelajaran ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus Mata Pelajaran"
        onConfirm={confirmDeleteSubject}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
