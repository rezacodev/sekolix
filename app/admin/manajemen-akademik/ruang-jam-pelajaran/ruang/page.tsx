"use client";

import { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import RoomForm from "./RoomForm";
import { useBreadcrumb } from "@/hooks/useBreadcrumb";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Plus } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";

type RoomType = "CLASSROOM" | "LABORATORY" | "LIBRARY" | "SPORTS_HALL" | "AUDITORIUM" | "OFFICE" | "OTHER";

interface Room {
  id: number;
  code?: string;
  name: string;
  type: RoomType;
  floor?: string;
  building?: string;
  capacity?: number;
  facilities?: string;
  description?: string;
  is_active: boolean;
}

const ROOM_TYPE_LABELS: Record<string, string> = {
  CLASSROOM: "Ruang Kelas",
  LABORATORY: "Laboratorium",
  LIBRARY: "Perpustakaan",
  SPORTS_HALL: "Gedung Olahraga",
  AUDITORIUM: "Auditorium",
  OFFICE: "Ruang Kantor",
  OTHER: "Lainnya"
};

export default function RuangPage() {
  const breadcrumbContext = useBreadcrumb();
  const { setBreadcrumbs } = breadcrumbContext || {};

  const [data, setData] = useState<Room[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string | undefined>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Room | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    if (setBreadcrumbs) {
      setBreadcrumbs([
        { label: "Manajemen Akademik", href: "/admin/manajemen-akademik" },
        { label: "Ruang & Jam Pelajaran", href: "/admin/manajemen-akademik/ruang-jam-pelajaran" },
        { label: "Ruang / Kelas / Lab", href: "/admin/manajemen-akademik/ruang-jam-pelajaran/ruang" }
      ]);
    }
  }, [setBreadcrumbs]);

  const filterConfig = [
    {
      column: "type",
      title: "Tipe Ruang",
      options: [
        { label: "Ruang Kelas", value: "CLASSROOM" },
        { label: "Laboratorium", value: "LABORATORY" },
        { label: "Perpustakaan", value: "LIBRARY" },
        { label: "Gedung Olahraga", value: "SPORTS_HALL" },
        { label: "Auditorium", value: "AUDITORIUM" },
        { label: "Ruang Kantor", value: "OFFICE" },
        { label: "Lainnya", value: "OTHER" }
      ]
    },
    {
      column: "is_active",
      title: "Status",
      options: [
        { label: "Aktif", value: "true" },
        { label: "Tidak Aktif", value: "false" }
      ]
    }
  ];

  const fetchData = useCallback(async () => {
    const q = new URLSearchParams({
      page: String(pageIndex),
      pageSize: String(pageSize),
      search,
      ...filters
    });
    const res = await fetch(
      `/api/admin/manajemen-akademik/ruang-jam-pelajaran/rooms?${q.toString()}`
    );
    const result = await res.json();
    setData(result.data);
    setTotalCount(result.totalCount);
  }, [pageIndex, pageSize, search, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = useCallback((item: Room) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback((id: number) => {
    setConfirmDelete(id);
  }, []);

  const confirmDeleteRoom = async () => {
    if (!confirmDelete) return;
    try {
      const response = await fetch(
        `/api/admin/manajemen-akademik/ruang-jam-pelajaran/rooms/${confirmDelete}`,
        {
          method: "DELETE"
        }
      );

      if (response.ok) {
        toast.success("Ruang berhasil dihapus");
        fetchData();
        setConfirmDelete(null);
      } else {
        const data = await response.json();
        toast.error(data.error || "Gagal menghapus ruang");
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      toast.error("Terjadi kesalahan saat menghapus ruang");
    } finally {
      setConfirmDelete(null);
    }
  };

  const columns = [
    { accessorKey: "code", header: "Kode" },
    { accessorKey: "name", header: "Nama Ruang" },
    { 
      accessorKey: "type", 
      header: "Tipe",
      cell: ({ row }: { row: { original: Room } }) => (
        <span>{ROOM_TYPE_LABELS[row.original.type] || row.original.type}</span>
      )
    },
    { accessorKey: "floor", header: "Lantai" },
    { accessorKey: "building", header: "Gedung" },
    { accessorKey: "capacity", header: "Kapasitas" },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }: { row: { original: Room } }) => (
        <span className={row.original.is_active ? "text-green-600" : "text-red-600"}>
          {row.original.is_active ? "Aktif" : "Tidak Aktif"}
        </span>
      )
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }: { row: { original: Room } }) => (
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
            title="Ruang / Kelas / Lab"
            description="Kelola data ruang kelas, laboratorium, dan fasilitas lainnya"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingItem(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Ruang
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <RoomForm
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
        searchPlaceholder="Cari nama atau kode ruang..."
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
        title="Hapus Ruang"
        description="Apakah Anda yakin ingin menghapus ruang ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus Ruang"
        onConfirm={confirmDeleteRoom}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
