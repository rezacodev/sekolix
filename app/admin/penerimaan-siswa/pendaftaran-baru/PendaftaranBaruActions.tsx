"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { createColumns, Applicant } from "./columns";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type DialogState = {
  type: "confirm" | null;
  id?: string;
};

export default function PendaftaranBaruActions() {
  const router = useRouter();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialog, setDialog] = useState<DialogState>({ type: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [years, setYears] = useState<{ id: string; label: string; isActive: boolean }[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/penerimaan-siswa/settings/years');
        if (!res.ok) {
          // fallback to fetching applicants without year filter
          await fetchApplicants();
          return;
        }
        const data = (await res.json()) as { id: string; label: string; isActive: boolean }[];
        setYears(data || []);
        const active = data.find((y) => y.isActive);
        const defaultYear = active ? active.id : (data && data[0] ? data[0].id : null);
        setSelectedYear(defaultYear);
        // fetch applicants after determining default year
        setIsLoading(true);
        await fetchApplicants(defaultYear);
      } catch (err) {
        console.error('Failed to fetch years', err);
        await fetchApplicants();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchApplicants = async (yearIdParam?: string | null, p?: number, ps?: number, s?: string) => {
    try {
      const url = new URL("/api/admin/penerimaan-siswa/applicant", window.location.origin);
      const yearToUse = yearIdParam ?? selectedYear;
      if (yearToUse) url.searchParams.set("yearId", yearToUse);
      // server-side pagination
      const usePage = typeof p === 'number' ? p : pageIndex;
      const usePageSize = typeof ps === 'number' ? ps : pageSize;
      const useSearch = typeof s === 'string' ? s : search;
      url.searchParams.set("page", String(usePage ?? 0));
      url.searchParams.set("pageSize", String(usePageSize ?? 10));
      if (useSearch) url.searchParams.set("search", useSearch);

      const response = await fetch(url.toString());
      if (response.ok) {
        const data = await response.json();
        // accept either paginated payload { items } or legacy array
        if (Array.isArray(data)) {
          setApplicants(data);
          setTotalCount(data.length);
        } else {
          setApplicants(data.items || []);
          setTotalCount(data.totalCount ?? 0);
          setPageIndex(data.page ?? 0);
          setPageSize(data.pageSize ?? pageSize);
        }
      }
    } catch (error) {
      console.error("Error fetching applicants:", error);
      toast.error("Gagal memuat data pendaftar");
    } finally {
      setIsLoading(false);
    }
  };

  // helper wrapper that matches our DataTable handler signature
  const fetchApplicantsPage = async (p = 0, ps = 10, s = "") => {
    setIsLoading(true);
    try {
      await fetchApplicants(selectedYear ?? undefined, p, ps, s);
    } finally {
      setIsLoading(false);
    }
  };

  // fetchYears moved into useEffect to satisfy exhaustive-deps

  const handleView = (id: string) => {
    router.push(`/admin/penerimaan-siswa/pendaftaran-baru/${id}`);
  };

  const handleDelete = (id: string) => {
    setDialog({
      type: "confirm",
      id,
    });
  };

  const confirmDeleteApplicant = async () => {
    if (!dialog.id) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/penerimaan-siswa/applicant/${dialog.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Data pendaftar berhasil dihapus");
        setDialog({ type: null });
        void fetchApplicantsPage(pageIndex, pageSize, search);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Tidak dapat menghapus calon");
      }
    } catch (error) {
      console.error("Error deleting applicant:", error);
      toast.error("Terjadi kesalahan saat menghapus calon");
    } finally {
      setIsDeleting(false);
    }
  };

  // Get unique programs and statuses from applicants for filter options
  const uniquePrograms = Array.from(
    new Set(
      applicants
        .map((a) => a.program?.name ?? a.programChoice ?? "")
        .filter(Boolean)
    )
  ).sort();

  const filterConfig = [
    {
      column: "status",
      title: "Status",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Review", value: "review" },
        { label: "Diterima", value: "accepted" },
        { label: "Ditolak", value: "rejected" },
      ],
    },
    {
      column: "programChoice",
      title: "Program/Jurusan",
      options: uniquePrograms.map((program) => ({
        label: program,
        value: program,
      })),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Daftar Pendaftaran Baru</h1>
        <p className="text-muted-foreground">Kelola dan verifikasi calon siswa baru.</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Tahun Ajaran</label>
          <div className="w-64">
            <Select
              value={selectedYear || undefined}
              onValueChange={(val) => {
                setSelectedYear(val);
                setIsLoading(true);
                // Call fetchApplicants with the selected value to avoid using stale state
                void fetchApplicants(val);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih tahun ajaran" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y.id} value={y.id}>{y.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      {isLoading ? (
        <div className="text-center py-10">Memuat...</div>
      ) : (
        <DataTable
          columns={createColumns({ onView: handleView, onDelete: handleDelete })}
          data={applicants}
          searchKey="fullName"
          filterConfig={filterConfig}
          serverSide
          totalCount={totalCount}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={(p) => { setPageIndex(p); void fetchApplicantsPage(p, pageSize, search); }}
          onPageSizeChange={(ps) => { setPageSize(ps); setPageIndex(0); void fetchApplicantsPage(0, ps, search); }}
          onSearchChange={(v) => { setSearch(v); setPageIndex(0); void fetchApplicantsPage(0, pageSize, v); }}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={dialog.type === "confirm"}
        title="Hapus Pendaftar"
        description="Apakah Anda yakin ingin menghapus data pendaftar ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        isLoading={isDeleting}
        onConfirm={confirmDeleteApplicant}
        onCancel={() => setDialog({ type: null })}
      />
    </div>
  );
}
