"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { createColumns, Article } from "./columns";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";

export default function ArticleActions() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch("/api/admin/website-landing/articles");
      if (response.ok) {
        const data = await response.json();
        setArticles(data);
      } else {
        toast.error("Gagal memuat artikel");
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast.error("Terjadi kesalahan saat memuat artikel");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setConfirmDelete(id);
  };

  const confirmDeleteArticle = async () => {
    if (!confirmDelete) return;
    try {
      const response = await fetch(`/api/admin/website-landing/articles/${confirmDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Artikel berhasil dihapus");
        fetchArticles();
        setConfirmDelete(null);
      } else {
        const data = await response.json();
        toast.error(data.message || "Gagal menghapus artikel");
      }
    } catch (error) {
      console.error("Error deleting article:", error);
      toast.error("Terjadi kesalahan saat menghapus artikel");
      setConfirmDelete(null);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/website-landing/posts/articles/${id}/edit`);
  };

  const filterConfig = [
    {
      column: "category",
      title: "Kategori",
      options: [
        { label: "Akademik", value: "Academic" },
        { label: "Prestasi", value: "Achievement" },
        { label: "Pengumuman", value: "Announcement" },
        { label: "Lainnya", value: "Other" },
      ],
    },
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Artikel</h2>
          <p className="text-muted-foreground">
            Kelola artikel blog dan konten Anda
          </p>
        </div>
        <Link href="/admin/website-landing/posts/articles/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Tambah Artikel
          </Button>
        </Link>
      </div>
      {isLoading ? (
        <div className="text-center py-10">Memuat...</div>
      ) : (
        <DataTable
          columns={createColumns({ onDelete: handleDelete, onEdit: handleEdit })}
          data={articles}
          searchKey="title"
          filterConfig={filterConfig}
        />
      )}
      <ConfirmDialog
        open={!!confirmDelete}
        title="Hapus Artikel"
        description="Apakah Anda yakin ingin menghapus artikel ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus Artikel"
        onConfirm={confirmDeleteArticle}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
