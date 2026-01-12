"use client";

import { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import LessonTimeForm from "./LessonTimeForm";
import { useBreadcrumb } from "@/hooks/useBreadcrumb";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Plus } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";

type DayOfWeek = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";

interface LessonTime {
  id: number;
  day: DayOfWeek;
  session: number;
  start_time: string;
  end_time: string;
  is_break: boolean;
  break_label?: string;
  is_active: boolean;
}

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Senin",
  TUESDAY: "Selasa",
  WEDNESDAY: "Rabu",
  THURSDAY: "Kamis",
  FRIDAY: "Jumat",
  SATURDAY: "Sabtu",
  SUNDAY: "Minggu"
};

export default function JamPelajaranPage() {
  const breadcrumbContext = useBreadcrumb();
  const { setBreadcrumbs } = breadcrumbContext || {};

  const [data, setData] = useState<LessonTime[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string | undefined>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LessonTime | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    if (setBreadcrumbs) {
      setBreadcrumbs([
        { label: "Manajemen Akademik", href: "/admin/manajemen-akademik" },
        { label: "Ruang & Jam Pelajaran", href: "/admin/manajemen-akademik/ruang-jam-pelajaran" },
        { label: "Jam Pelajaran", href: "/admin/manajemen-akademik/ruang-jam-pelajaran/jam-pelajaran" }
      ]);
    }
  }, [setBreadcrumbs]);

  const filterConfig = [
    {
      column: "day",
      title: "Hari",
      options: [
        { label: "Senin", value: "MONDAY" },
        { label: "Selasa", value: "TUESDAY" },
        { label: "Rabu", value: "WEDNESDAY" },
        { label: "Kamis", value: "THURSDAY" },
        { label: "Jumat", value: "FRIDAY" },
        { label: "Sabtu", value: "SATURDAY" },
        { label: "Minggu", value: "SUNDAY" }
      ]
    },
    {
      column: "is_break",
      title: "Jenis",
      options: [
        { label: "Jam Pelajaran", value: "false" },
        { label: "Istirahat", value: "true" }
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
      `/api/admin/manajemen-akademik/ruang-jam-pelajaran/lesson-times?${q.toString()}`
    );
    const result = await res.json();
    setData(result.data);
    setTotalCount(result.totalCount);
  }, [pageIndex, pageSize, search, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = useCallback((item: LessonTime) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback((id: number) => {
    setConfirmDelete(id);
  }, []);

  const confirmDeleteLessonTime = async () => {
    if (!confirmDelete) return;
    try {
      const response = await fetch(
        `/api/admin/manajemen-akademik/ruang-jam-pelajaran/lesson-times/${confirmDelete}`,
        {
          method: "DELETE"
        }
      );

      if (response.ok) {
        toast.success("Jam pelajaran berhasil dihapus");
        fetchData();
        setConfirmDelete(null);
      } else {
        const data = await response.json();
        toast.error(data.error || "Gagal menghapus jam pelajaran");
      }
    } catch (error) {
      console.error("Error deleting lesson time:", error);
      toast.error("Terjadi kesalahan saat menghapus jam pelajaran");
    } finally {
      setConfirmDelete(null);
    }
  };

  const columns = [
    {
      accessorKey: "day",
      header: "Hari",
      cell: ({ row }: { row: { original: LessonTime } }) => (
        <span>{DAY_LABELS[row.original.day] || row.original.day}</span>
      )
    },
    { 
      accessorKey: "session", 
      header: "Jam Ke-",
      cell: ({ row }: { row: { original: LessonTime } }) => (
        <span>{row.original.is_break ? "-" : row.original.session}</span>
      )
    },
    {
      id: "time",
      header: "Waktu",
      cell: ({ row }: { row: { original: LessonTime } }) => (
        <span>{row.original.start_time} - {row.original.end_time}</span>
      )
    },
    {
      accessorKey: "is_break",
      header: "Jenis",
      cell: ({ row }: { row: { original: LessonTime } }) => (
        <span>
          {row.original.is_break 
            ? <span className="text-orange-600">{row.original.break_label || "Istirahat"}</span>
            : <span className="text-blue-600">Jam Pelajaran</span>
          }
        </span>
      )
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }: { row: { original: LessonTime } }) => (
        <span className={row.original.is_active ? "text-green-600" : "text-red-600"}>
          {row.original.is_active ? "Aktif" : "Tidak Aktif"}
        </span>
      )
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }: { row: { original: LessonTime } }) => (
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
            title="Jam Pelajaran"
            description="Kelola pengaturan jam pelajaran dan istirahat untuk setiap hari"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingItem(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Jam Pelajaran
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <LessonTimeForm
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
        searchKey="break_label"
        searchPlaceholder="Cari label istirahat..."
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
        title="Hapus Jam Pelajaran"
        description="Apakah Anda yakin ingin menghapus jam pelajaran ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus Jam Pelajaran"
        onConfirm={confirmDeleteLessonTime}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
