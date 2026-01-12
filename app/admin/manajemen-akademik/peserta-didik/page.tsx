"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { createColumns, Peserta } from "./columns";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Upload, Users } from "lucide-react";
import { PageHeader } from "@/components/admin";
import AssignmentModal from "./AssignmentModal";
import { PesertaDidik, Rombel } from "@prisma/client";

type StudentWithRombels = PesertaDidik & {
  rombels?: (Rombel & {
    class?: {
      name: string;
    };
  })[];
};

export default function DataSiswaAktifPage() {
  const router = useRouter();
  const [items, setItems] = useState<Peserta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialog, setDialog] = useState<{ type: "confirm" | null; id?: string }>({ type: null });
  const [totalCount, setTotalCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [years, setYears] = useState<{ id: string; label: string; isActive?: boolean }[]>([]);
  const [programs, setPrograms] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [appliedYear, setAppliedYear] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const fetchingRef = useRef(false);
  const handleOpenAssignmentModal = useCallback(() => {
    setAssignmentModalOpen(true);
  }, []);

  const handleRowSelectionChange = useCallback(
    (
      updater: Record<string, boolean> | ((old: Record<string, boolean>) => Record<string, boolean>)
    ) => {
      const newSelection = typeof updater === "function" ? updater(rowSelection) : updater;
      console.log(
        "Row selection changed:",
        newSelection,
        "count:",
        Object.keys(newSelection).filter(k => newSelection[k]).length
      );
      setRowSelection(newSelection);
    },
    [rowSelection]
  );

  const fetchPage = useCallback(
    async (p = 0, ps = 10, s = "", yearParam?: string | null, programParam?: string | null) => {
      setIsLoading(true);
      // prevent overlapping fetches which can cause looped requests
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      try {
        const year = typeof yearParam === "undefined" ? appliedYear : yearParam;
        const program = typeof programParam === "undefined" ? selectedProgram : programParam;
        const url = new URL("/api/admin/manajemen-akademik/peserta-didik", window.location.origin);
        url.searchParams.set("page", String(p));
        url.searchParams.set("pageSize", String(ps));
        if (s) url.searchParams.set("search", s);
        if (year) url.searchParams.set("yearId", year);
        if (program) url.searchParams.set("program", program);

        console.log("Fetching peserta-didik:", url.toString());
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error("Fetch failed");
        const data = await res.json();
        console.log(
          "Peserta-didik response items:",
          (data.items || []).length,
          "totalCount:",
          data.totalCount
        );
        setItems(
          Array.isArray(data.items)
            ? (data.items as StudentWithRombels[]).map(it => ({
                ...it,
                classGroup: it.rombels?.[0]
                  ? {
                      name: it.rombels[0].name,
                      class: it.rombels[0].class ? { name: it.rombels[0].class.name } : undefined
                    }
                  : undefined
              }))
            : []
        );
        setTotalCount(data.totalCount ?? data.items?.length ?? 0);
        setPageIndex(data.page ?? p);
        setPageSize(data.pageSize ?? ps);
      } catch (err) {
        console.error(err);
        toast.error("Gagal memuat peserta didik");
      } finally {
        setIsLoading(false);
        fetchingRef.current = false;
      }
    },
    [appliedYear, selectedProgram]
  );

  const fetchYears = async () => {
    try {
      const res = await fetch("/api/admin/penerimaan-siswa/settings/years");
      if (res.ok) {
        const data = await res.json();
        console.log("Years data:", data);
        setYears(data || []);
        const activeYear = (data || []).find(
          (y: { id?: string; label?: string; isActive?: boolean }) => y.isActive
        );
        if (activeYear) {
          setSelectedYear(activeYear.id);
          setAppliedYear(activeYear.id);
        } else {
          // If no active year, set appliedYear to null to trigger fetch without year filter
          setAppliedYear(null);
        }
      } else {
        console.error("Failed to fetch years:", res.status, res.statusText);
        setAppliedYear(null); // Allow fetch without year filter
      }
    } catch (e) {
      console.error("Failed fetching years", e);
      setAppliedYear(null); // Allow fetch without year filter
    }
  };

  const fetchPrograms = async () => {
    try {
      const res = await fetch("/api/admin/penerimaan-siswa/settings/programs");
      if (res.ok) {
        const pdata = await res.json();
        const programsList = (pdata || [])
          .map((p: { name?: string }) => p.name)
          .filter(Boolean) as string[];
        setPrograms(programsList);
      }
    } catch (e) {
      console.error("Failed fetching programs", e);
    }
  };

  useEffect(() => {
    void fetchYears();
    void fetchPrograms();
  }, []);

  useEffect(() => {
    if (appliedYear) {
      void fetchPage(0, pageSize, search, appliedYear);
    } else {
      // If no year is applied yet, still try to fetch without year filter
      void fetchPage(0, pageSize, search, null);
    }
  }, [appliedYear, pageSize, search, fetchPage]);

  const handleView = (id: string) => router.push(`/admin/manajemen-akademik/peserta-didik/${id}`);

  const handleDelete = (id: string) => setDialog({ type: "confirm", id });

  const confirmDelete = async () => {
    if (!dialog.id) return;
    try {
      const res = await fetch(`/api/admin/manajemen-akademik/peserta-didik?id=${dialog.id}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.message || "Gagal menghapus");
      } else {
        toast.success("Peserta didik dihapus");
        void fetchPage(pageIndex, pageSize, search, appliedYear, selectedProgram);
      }
    } catch (e) {
      console.error(e);
      toast.error("Terjadi kesalahan saat menghapus");
    } finally {
      setDialog({ type: null });
    }
  };

  return (
    <div className="p-6">
      <PageHeader title="Peserta Didik" description="Kelola data peserta didik aktif.">
        <div className="flex items-center gap-2">
          <div>
            <Select
              value={selectedYear ?? ""}
              onValueChange={val => {
                const newYear = val || null;
                setSelectedYear(newYear);
                setAppliedYear(newYear);
                // clear program filter when year changes to avoid stale filtering
                setSelectedProgram(null);
                setPageIndex(0);
              }}
            >
              <SelectTrigger className="w-52">
                <SelectValue>
                  {selectedYear
                    ? `Tahun Masuk: ${years.find(y => y.id === selectedYear)?.label ?? "Tahun Masuk"}`
                    : "Tahun Masuk"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {years.map(y => (
                  <SelectItem key={y.id} value={y.id}>
                    Tahun Masuk: {y.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/manajemen-akademik/peserta-didik/import">
                <Upload className="mr-2 h-4 w-4" />
                Import Data
              </Link>
            </Button>
            <Button onClick={() => router.push("/admin/manajemen-akademik/peserta-didik/new")}>
              Tambah
            </Button>
          </div>
        </div>
      </PageHeader>

      {Object.keys(rowSelection).filter(k => rowSelection[k]).length > 0 && (
        <div className="mt-4">
          <Button
            variant="default"
            onClick={handleOpenAssignmentModal}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Users className="mr-2 h-4 w-4" />
            Assign ke Rombel ({Object.keys(rowSelection).filter(k => rowSelection[k]).length})
          </Button>
        </div>
      )}

      <div className="mt-6">
        {isLoading ? (
          <div>Memuat...</div>
        ) : (
          <DataTable
            columns={createColumns({
              onView: handleView,
              onDelete: handleDelete
            })}
            data={items}
            searchKey="fullName"
            searchValue={search}
            serverSide
            totalCount={totalCount}
            pageIndex={pageIndex}
            pageSize={pageSize}
            getRowId={row => row.id}
            externalFilters={{ program: selectedProgram ?? undefined }}
            filterConfig={[
              {
                column: "program",
                title: "Program",
                options: programs.map(p => ({ label: p, value: p }))
              }
            ]}
            onPageChange={p => {
              setPageIndex(p);
              void fetchPage(p, pageSize, search, appliedYear, selectedProgram);
            }}
            onPageSizeChange={ps => {
              setPageSize(ps);
              setPageIndex(0);
              void fetchPage(0, ps, search, appliedYear, selectedProgram);
            }}
            onSearchChange={v => {
              const q = v ?? "";
              setSearch(q);
              setPageIndex(0);
              void fetchPage(0, pageSize, q, appliedYear, selectedProgram);
            }}
            onFilterChange={(column, value) => {
              if (column === "program") {
                const newProgram = value ?? null;
                setSelectedProgram(newProgram);
                setPageIndex(0);
                void fetchPage(0, pageSize, search, appliedYear, newProgram);
              }
            }}
            rowSelection={rowSelection}
            onRowSelectionChange={handleRowSelectionChange}
          />
        )}
      </div>

      <AssignmentModal
        open={assignmentModalOpen}
        onOpenChange={setAssignmentModalOpen}
        selectedStudents={(() => {
          // Directly compute from rowSelection and items for modal
          const selectedIds = Object.keys(rowSelection).filter(k => rowSelection[k]);
          return items
            .filter(item => selectedIds.includes(item.id))
            .map(item => ({
              id: item.id,
              fullName: item.fullName,
              classGroup: item.classGroup
            }));
        })()}
        onSuccess={() => {
          setRowSelection({});
          void fetchPage(pageIndex, pageSize, search, appliedYear, selectedProgram);
        }}
      />

      <ConfirmDialog
        open={dialog.type === "confirm"}
        title="Hapus Peserta"
        description="Apakah Anda yakin ingin menghapus peserta didik ini?"
        confirmText="Hapus"
        isLoading={false}
        onConfirm={confirmDelete}
        onCancel={() => setDialog({ type: null })}
      />
    </div>
  );
}
