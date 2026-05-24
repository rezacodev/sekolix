"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import RombelForm from "./RombelForm";
import { useBreadcrumb } from "@/hooks/useBreadcrumb";
import { Plus, MoreHorizontal, Users, BookOpen, Pencil, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";

interface Rombel {
  id: number;
  class_id: number;
  program_id: string;
  name: string;
  capacity?: number;
  student_count: number;
  class: {
    id: number;
    name: string;
  };
  tahunAjaran?: {
    id: string;
    label: string;
  };
  program: {
    id: string;
    name: string;
  };
  students: Array<{
    id: number;
    fullName: string;
    nisn: string;
  }>;
  progress?: {
    totalSubjects: number;
    generatedSubjects: number;
    assignedTeachers: number;
    scheduledSubjects: number;
    teacherProgress: number;
    scheduleProgress: number;
  };
}

export default function RombelPage() {
  const breadcrumbContext = useBreadcrumb();
  const { setBreadcrumbs } = breadcrumbContext || {};

  const [data, setData] = useState<Rombel[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string | undefined>>({});
  const [years, setYears] = useState<{ id: string; label: string; isActive?: boolean }[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Rombel | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (setBreadcrumbs) {
      setBreadcrumbs([
        { label: "Manajemen Akademik", href: "/admin/manajemen-akademik" },
        { label: "Rombel, Pengampu & Jadwal", href: "/admin/manajemen-akademik/rombel" }
      ]);
    }
  }, [setBreadcrumbs]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const q = new URLSearchParams({
      page: String(pageIndex),
      pageSize: String(pageSize),
      search,
      ...filters
    });
    const res = await fetch(`/api/admin/manajemen-akademik/rombel?${q.toString()}`);
    const result = await res.json();
    setData(result.data);
    setTotalCount(result.totalCount);
    setIsLoading(false);
  }, [pageIndex, pageSize, search, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const loadYears = async () => {
      try {
        const res = await fetch("/api/admin/penerimaan-siswa/settings/years");
        if (res.ok) {
          const data = await res.json();
          setYears(data || []);
          const active = (data || []).find(
            (y: { id: string; label: string; isActive?: boolean }) => y.isActive
          );
          if (active && !selectedYear) {
            setSelectedYear(active.id);
            setFilters(prev => ({ ...prev, yearId: active.id }));
          }
        }
      } catch (e) {
        console.error("Failed to fetch years", e);
      }
    };
    loadYears();
  }, [selectedYear]);

  const handleEdit = useCallback((item: Rombel) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback((id: number) => {
    setConfirmDelete(id);
  }, []);

  const confirmDeleteClassGroup = async () => {
    if (!confirmDelete) return;
    try {
      const response = await fetch(`/api/admin/manajemen-akademik/rombel/${confirmDelete}`, {
        method: "DELETE"
      });

      if (response.ok) {
        toast.success("Rombel berhasil dihapus");
        fetchData();
        setConfirmDelete(null);
      } else {
        const data = await response.json();
        toast.error(data.error || "Gagal menghapus rombel");
      }
    } catch (error) {
      console.error("Error deleting class group:", error);
      toast.error("Terjadi kesalahan saat menghapus rombel");
    } finally {
      setConfirmDelete(null);
    }
  };

  const columns = [
    {
      accessorKey: "tahunAjaran.label",
      header: "Tahun Ajaran",
      cell: ({ row }: { row: { original: Rombel } }) =>
        row.original.tahunAjaran?.label ?? "-"
    },
    { accessorKey: "name", header: "Nama Rombel" },
    {
      accessorKey: "class.name",
      header: "Kelas",
      cell: ({ row }: { row: { original: Rombel } }) => row.original.class.name
    },
    {
      accessorKey: "program.name",
      header: "Program",
      cell: ({ row }: { row: { original: Rombel } }) => row.original.program.name
    },
    {
      accessorKey: "capacity",
      header: "Kapasitas",
      cell: ({ row }: { row: { original: Rombel } }) => row.original.capacity || "-"
    },
    {
      accessorKey: "student_count",
      header: "Jumlah Siswa",
      cell: ({ row }: { row: { original: Rombel } }) => `${row.original.student_count} siswa`
    },
    {
      id: "totalSubjects",
      header: "Jumlah Mapel",
      cell: ({ row }: { row: { original: Rombel } }) => {
        const generated = row.original.progress?.generatedSubjects || 0;
        return generated > 0 ? `${generated} mapel` : <span className="text-muted-foreground">-</span>;
      }
    },
    {
      id: "progress",
      header: "Progress Kelola",
      cell: ({ row }: { row: { original: Rombel } }) => {
        const { progress } = row.original;
        if (!progress || progress.totalSubjects === 0) {
          return <span className="text-muted-foreground text-sm">Belum generate</span>;
        }
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-12">Guru:</span>
              <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all" 
                  style={{ width: `${progress.teacherProgress}%` }}
                />
              </div>
              <span className="text-xs font-medium w-10 text-right">{progress.teacherProgress}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-12">Jadwal:</span>
              <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-green-500 h-full transition-all" 
                  style={{ width: `${progress.scheduleProgress}%` }}
                />
              </div>
              <span className="text-xs font-medium w-10 text-right">{progress.scheduleProgress}%</span>
            </div>
          </div>
        );
      }
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }: { row: { original: Rombel } }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/manajemen-akademik/rombel/detail/${row.original.id}`} className="cursor-pointer">
                <Users className="h-4 w-4 mr-2" />
                Kelola Siswa
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/manajemen-akademik/rombel/kelola/${row.original.id}`} className="cursor-pointer">
                <BookOpen className="h-4 w-4 mr-2" />
                Kelola Guru & Jadwal
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleDelete(row.original.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Rombel, Pengampu & Jadwal" description="Kelola rombongan belajar, penugasan guru pengampu mata pelajaran, dan jadwal pelajaran mingguan untuk setiap rombel dalam sistem pendidikan sekolah">
        <div className="flex items-center gap-2">
          <Select
            value={selectedYear ?? ""}
            onValueChange={val => {
              const y = val || undefined;
              setSelectedYear(y);
              setFilters(prev => ({ ...prev, yearId: y }));
              setPageIndex(0);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue>
                {selectedYear
                  ? (years.find(y => y.id === selectedYear)?.label ?? "Tahun Ajaran")
                  : "Tahun Ajaran"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {years.map(y => (
                <SelectItem key={y.id} value={y.id}>
                  {y.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingItem(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Rombel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogTitle>{editingItem ? "Edit Rombel" : "Tambah Rombel"}</DialogTitle>
              <RombelForm
                initialData={editingItem}
                onSubmit={() => {
                  setIsDialogOpen(false);
                  setEditingItem(null);
                  fetchData();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>

      <div className="mt-6">
        {isLoading ? (
          <div>Memuat...</div>
        ) : (
          <DataTable
            data={data}
            columns={columns}
            searchKey="name"
            searchValue={search}
            serverSide
            totalCount={totalCount}
            pageIndex={pageIndex}
            pageSize={pageSize}
            onPageChange={p => {
              setPageIndex(p);
            }}
            onPageSizeChange={ps => {
              setPageSize(ps);
              setPageIndex(0);
            }}
            onSearchChange={v => {
              const q = v ?? "";
              setSearch(q);
              setPageIndex(0);
            }}
            onFilterChange={(column, value) => {
              setFilters(prev => ({ ...prev, [column]: value }));
            }}
          />
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Hapus Rombel"
        description="Apakah Anda yakin ingin menghapus rombel ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={confirmDeleteClassGroup}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
