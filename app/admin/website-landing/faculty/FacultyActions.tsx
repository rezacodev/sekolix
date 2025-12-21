"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { createColumns, Faculty } from "./columns";

export default function FacultyActions() {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchFaculty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFaculty = async (p = pageIndex, ps = pageSize, s = search) => {
    try {
      setIsLoading(true);
      const url = new URL("/api/admin/website-landing/faculty", window.location.origin);
      url.searchParams.set("page", String(p));
      url.searchParams.set("pageSize", String(ps));
      if (s) url.searchParams.set("search", s);
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setFaculty(data);
          setTotalCount(undefined);
        } else {
          setFaculty(data.items || []);
          setTotalCount(typeof data.totalCount === "number" ? data.totalCount : undefined);
          setPageIndex(typeof data.page === "number" ? data.page : p);
          setPageSize(typeof data.pageSize === "number" ? data.pageSize : ps);
        }
      }
    } catch (error) {
      console.error("Error fetching faculty:", error);
      setError("Gagal memuat data. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setConfirmDelete(id);
  };

  const confirmDeleteFaculty = async () => {
    if (!confirmDelete) return;
    try {
      const res = await fetch(`/api/admin/website-landing/faculty/${confirmDelete}`, {
        method: "DELETE",
      });

      if (res.ok) {
        void fetchFaculty(pageIndex, pageSize, search);
      } else {
        const data = await res.json();
        setError(data?.error || "Gagal menghapus data");
      }
    } catch (error) {
      console.error("Error deleting faculty:", error);
      setError("Gagal menghapus data. Silakan coba lagi.");
    } finally {
      setConfirmDelete(null);
    }
  };

  const columns = createColumns({ onDelete: handleDelete });

  const filterConfig = useMemo(() => {
    const departments = Array.from(
      new Set(
        faculty
          .map((f) => f.department)
          .filter((d): d is string => Boolean(d))
      )
    );

    return departments.length
      ? [
          {
            column: "department",
            title: "Departemen",
            options: departments.map((d) => ({ label: d, value: d })),
          },
        ]
      : [];
  }, [faculty]);

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Guru & Staf</h2>
          <p className="text-muted-foreground">
            Daftar guru, staf, dan pengelola sekolah.
          </p>
        </div>
        <Button variant="outline" disabled>
          Tambah (segera hadir)
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {isLoading ? (
        <div className="text-center py-10">Memuat data...</div>
      ) : (
        <DataTable
          columns={columns}
          data={faculty}
          searchKey="name"
          filterConfig={filterConfig}
          serverSide
          totalCount={totalCount}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={(p) => void fetchFaculty(p, pageSize, search)}
          onPageSizeChange={(ps) => void fetchFaculty(0, ps, search)}
          onSearchChange={(s) => {
            setSearch(s);
            void fetchFaculty(0, pageSize, s);
          }}
        />
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Hapus Data"
        description="Data akan dihapus permanen. Lanjutkan?"
        confirmText="Hapus"
        onConfirm={confirmDeleteFaculty}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
