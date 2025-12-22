"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { createColumns, Page } from "./columns";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function PageActions() {
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    void fetchPages(pageIndex, pageSize, search);
  }, [pageIndex, pageSize, search]);

  const fetchPages = async (p = 0, ps = 10, s = "") => {
    setIsLoading(true);
    try {
      const q = new URLSearchParams({ page: String(p), pageSize: String(ps) });
      if (s) q.set("search", s);
      const res = await fetch(`/api/admin/website-landing/pages?${q.toString()}`);
      if (!res.ok) {
        setPages([]);
        setTotalCount(0);
        return;
      }
      const data = await res.json();
      setPages(data.items || []);
      setTotalCount(data.totalCount ?? 0);
      setPageIndex(data.page ?? p);
      setPageSize(data.pageSize ?? ps);
    } catch (error) {
      console.error("Error fetching pages:", error);
      setPages([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setConfirmDelete(id);
  };

  const confirmDeletePage = async () => {
    if (!confirmDelete) return;
    try {
      const response = await fetch(`/api/admin/website-landing/pages/${confirmDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        void fetchPages(pageIndex, pageSize, search);
        setConfirmDelete(null);
      } else {
        const error = await response.json();
        alert(`Tidak dapat menghapus halaman: ${error.error}`);
        setConfirmDelete(null);
      }
    } catch (error) {
      console.error("Error deleting page:", error);
      setConfirmDelete(null);
    }
  };

  const handleToggleVisibility = async (id: string, isVisible: boolean) => {
    try {
      const response = await fetch(`/api/admin/website-landing/pages/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isVisible: !isVisible }),
      });

      if (response.ok) {
        fetchPages();
      }
    } catch (error) {
      console.error("Error toggling visibility:", error);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/website-landing/pages/${id}/edit`);
  };

  const filterConfig = [
    {
      column: "isPublished",
      title: "Status",
      options: [
        { label: "Dipublikasikan", value: "true" },
        { label: "Draft", value: "false" },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Manajemen Halaman</h2>
        <p className="text-muted-foreground">
          Kelola 5 halaman profil: Sejarah, Visi & Misi, Struktur, Fasilitas, dan Program Keahlian.
        </p>
      </div>
      {isLoading ? (
        <div className="text-center py-10">Memuat...</div>
      ) : (
        <DataTable
          columns={createColumns({ onDelete: handleDelete, onEdit: handleEdit, onToggleVisibility: handleToggleVisibility })}
          data={pages}
          searchKey="title"
          filterConfig={filterConfig}
          serverSide
          totalCount={totalCount}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={(p) => setPageIndex(p)}
          onPageSizeChange={(ps) => { setPageSize(ps); setPageIndex(0); }}
          onSearchChange={(v) => { setSearch(v); setPageIndex(0); }}
        />
      )}
      <ConfirmDialog
        open={!!confirmDelete}
        title="Hapus Halaman"
        description="Apakah Anda yakin ingin menghapus halaman ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus Halaman"
        onConfirm={confirmDeletePage}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
