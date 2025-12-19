"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { createColumns, News } from "./columns";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";

export default function NewsActions() {
  const router = useRouter();
  const [news, setNews] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch("/api/admin/website-landing/news");
      if (response.ok) {
        const data = await response.json();
        setNews(data);
      } else {
        toast.error("Gagal memuat berita");
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      toast.error("Terjadi kesalahan saat memuat berita");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setConfirmDelete(id);
  };

  const confirmDeleteNews = async () => {
    if (!confirmDelete) return;
    try {
      const response = await fetch(`/api/admin/website-landing/news/${confirmDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Berita berhasil dihapus");
        fetchNews();
        setConfirmDelete(null);
      } else {
        const data = await response.json();
        toast.error(data.message || "Gagal menghapus berita");
      }
    } catch (error) {
      console.error("Error deleting news:", error);
      toast.error("Terjadi kesalahan saat menghapus berita");
      setConfirmDelete(null);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/website-landing/posts/news/${id}/edit`);
  };

  const filterConfig = [
    {
      column: "category",
      title: "Kategori",
      options: [
        { label: "Berita Sekolah", value: "School News" },
        { label: "Prestasi", value: "Achievement" },
        { label: "Laporan Acara", value: "Event Report" },
        { label: "Pengumuman", value: "Announcement" },
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
          <h2 className="text-2xl font-bold tracking-tight">Berita</h2>
          <p className="text-muted-foreground">
            Kelola berita dan pengumuman sekolah
          </p>
        </div>
        <Link href="/admin/website-landing/posts/news/new">
          <Button>
            <Plus className="mr-2 h-4 w-4 text-current" /> Tambah Berita
          </Button>
        </Link>
      </div>
      {isLoading ? (
        <div className="text-center py-10">Memuat...</div>
      ) : (
        <DataTable
          columns={createColumns({ onDelete: handleDelete, onEdit: handleEdit })}
          data={news}
          searchKey="title"
          filterConfig={filterConfig}
        />
      )}
      <ConfirmDialog
        open={!!confirmDelete}
        title="Hapus Berita"
        description="Apakah Anda yakin ingin menghapus berita ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus Berita"
        onConfirm={confirmDeleteNews}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
