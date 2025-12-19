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

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await fetch("/api/admin/website-landing/pages");
      if (response.ok) {
        const data = await response.json();
        setPages(data);
      }
    } catch (error) {
      console.error("Error fetching pages:", error);
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
        fetchPages();
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
