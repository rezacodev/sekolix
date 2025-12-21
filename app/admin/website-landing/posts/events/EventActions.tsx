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
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    void fetchEvents(pageIndex, pageSize, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize, search]);

  const fetchEvents = async (p = 0, ps = 10, s = "") => {
    setIsLoading(true);
    try {
      const q = new URLSearchParams({ page: String(p), pageSize: String(ps) });
      if (s) q.set("search", s);
      const res = await fetch(`/api/admin/website-landing/events?${q.toString()}`);
      if (!res.ok) {
        toast.error("Gagal memuat acara");
        setEvents([]);
        setTotalCount(0);
        return;
      }
      const data = await res.json();
      setEvents(data.items || []);
      setTotalCount(data.totalCount ?? 0);
      setPageIndex(data.page ?? p);
      setPageSize(data.pageSize ?? ps);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Terjadi kesalahan saat memuat acara");
      setEvents([]);
      setTotalCount(0);
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
        void fetchEvents(pageIndex, pageSize, search);
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
        title="Hapus Acara"
        description="Apakah Anda yakin ingin menghapus acara ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus Acara"
        onConfirm={confirmDeleteEvent}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
