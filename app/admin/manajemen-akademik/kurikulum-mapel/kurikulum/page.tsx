"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import CurriculumForm from "./CurriculumForm";
import { useBreadcrumb } from "@/hooks/useBreadcrumb";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Plus } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";

interface Curriculum {
  id: number;
  code?: string;
  name: string;
  description?: string;
}

export default function KurikulumPage() {
  const breadcrumbContext = useBreadcrumb();
  const { setBreadcrumbs } = breadcrumbContext || {};
  const router = useRouter();

  const [data, setData] = useState<Curriculum[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string | undefined>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Curriculum | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    if (setBreadcrumbs) {
      setBreadcrumbs([
        { label: "Manajemen Akademik", href: "/admin/manajemen-akademik" },
        { label: "Kurikulum & Mata Pelajaran", href: "/admin/manajemen-akademik/kurikulum-mapel" },
        { label: "Kurikulum", href: "/admin/manajemen-akademik/kurikulum-mapel/kurikulum" }
      ]);
    }
  }, [setBreadcrumbs]);

  const filterConfig: never[] = [];

  const fetchData = useCallback(async () => {
    const q = new URLSearchParams({
      page: String(pageIndex),
      pageSize: String(pageSize),
      search,
      ...filters
    });
    const res = await fetch(
      `/api/admin/manajemen-akademik/kurikulum-mapel/curriculums?${q.toString()}`
    );
    const result = await res.json();
    setData(result.data);
    setTotalCount(result.totalCount);
  }, [pageIndex, pageSize, search, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = useCallback((item: Curriculum) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  }, []);

  const handleViewDistribution = useCallback((curriculum: Curriculum) => {
    router.push(`/admin/manajemen-akademik/kurikulum-mapel/kurikulum/${curriculum.id}/distribusi`);
  }, [router]);

  const handleDelete = useCallback((id: number) => {
    setConfirmDelete(id);
  }, []);

  const confirmDeleteCurriculum = async () => {
    if (!confirmDelete) return;
    try {
      const response = await fetch(
        `/api/admin/manajemen-akademik/kurikulum-mapel/curriculums/${confirmDelete}`,
        {
          method: "DELETE"
        }
      );

      if (response.ok) {
        toast.success("Kurikulum berhasil dihapus");
        fetchData();
        setConfirmDelete(null);
      } else {
        const data = await response.json();
        toast.error(data.error || "Gagal menghapus kurikulum");
      }
    } catch (error) {
      console.error("Error deleting curriculum:", error);
      toast.error("Terjadi kesalahan saat menghapus kurikulum");
    } finally {
      setConfirmDelete(null);
    }
  };

  const columns = [
    { accessorKey: "code", header: "Kode" },
    { accessorKey: "name", header: "Nama Kurikulum" },
    { accessorKey: "description", header: "Deskripsi" },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }: { row: { original: Curriculum } }) => (
        <div className="flex gap-2">
          <Button variant="default" size="sm" onClick={() => handleViewDistribution(row.original)}>
            Lihat Distribusi Mata Pelajaran
          </Button>
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
            title="Kurikulum"
            description="Kelola kurikulum pendidikan"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingItem(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Kurikulum
            </Button>
          </DialogTrigger>
          <DialogContent>
            <CurriculumForm
              initialData={editingItem}
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
        title="Hapus Kurikulum"
        description="Apakah Anda yakin ingin menghapus kurikulum ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus Kurikulum"
        onConfirm={confirmDeleteCurriculum}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
