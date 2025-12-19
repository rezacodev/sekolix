"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { createColumns, Event } from "./columns";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";

export default function EventActions() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/admin/website-landing/events");
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        toast.error("Gagal memuat acara");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Terjadi kesalahan saat memuat acara");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setConfirmDelete(id);
  };

  const confirmDeleteEvent = async () => {
    if (!confirmDelete) return;
    try {
      const response = await fetch(`/api/admin/website-landing/events/${confirmDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Acara berhasil dihapus");
        fetchEvents();
        setConfirmDelete(null);
      } else {
        const data = await response.json();
        toast.error(data.message || "Gagal menghapus acara");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Terjadi kesalahan saat menghapus acara");
      setConfirmDelete(null);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/website-landing/posts/events/${id}/edit`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Acara</h2>
          <p className="text-muted-foreground">
            Kelola acara dan kegiatan sekolah
          </p>
        </div>
        <Link href="/admin/website-landing/posts/events/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Tambah Acara
          </Button>
        </Link>
      </div>
      {isLoading ? (
        <div className="text-center py-10">Memuat...</div>
      ) : (
        <DataTable
          columns={createColumns({ onDelete: handleDelete, onEdit: handleEdit })}
          data={events}
          searchKey="title"
        />
      )}
      <ConfirmDialog
        open={!!confirmDelete}
        title="Hapus Acara"
        description="Apakah Anda yakin ingin menghapus acara ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus Acara"
        onConfirm={confirmDeleteEvent}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
