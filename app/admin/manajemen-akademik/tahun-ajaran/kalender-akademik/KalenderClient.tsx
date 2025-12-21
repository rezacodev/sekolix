"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";

type Year = { id: string; name: string; start?: string; end?: string };
type EventItem = { id: string; title: string; description?: string; startDate: string; endDate?: string };

function EventTable({ events, onDeleteRequested, onEdit }: { events: EventItem[]; onDeleteRequested: (id: string) => void; onEdit: (ev: EventItem) => void }) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const columns: ColumnDef<EventItem>[] = [
    { accessorKey: "title", header: "Judul" },
    {
      accessorKey: "startDate",
      header: "Mulai",
      cell: (ctx) => <span>{new Date(ctx.row.original.startDate).toLocaleDateString()}</span>,
    },
    {
      accessorKey: "endDate",
      header: "Selesai",
      cell: (ctx) => <span>{ctx.row.original.endDate ? new Date(ctx.row.original.endDate).toLocaleDateString() : "—"}</span>,
    },
    {
      accessorKey: "description",
      header: "Deskripsi",
      cell: (ctx) => (
        <span className="text-sm text-muted-foreground">{ctx.row.original.description ? (ctx.row.original.description.length > 120 ? ctx.row.original.description.slice(0, 117) + "..." : ctx.row.original.description) : "-"}</span>
      ),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: (ctx) => {
        const row = ctx.row.original as EventItem;
        return (
          <div className="relative">
            <Button variant="ghost" size="sm" onClick={() => setOpenMenu((s) => (s === row.id ? null : row.id))}>⋯</Button>
            {openMenu === row.id && (
              <div className="absolute right-0 z-10 mt-2 w-36 rounded-md border bg-card p-1 shadow">
                <button
                  className="w-full text-left px-3 py-1 text-sm hover:bg-muted"
                  onClick={() => {
                    setOpenMenu(null);
                    onEdit(row);
                  }}
                >
                  Edit
                </button>
                <button
                  className="w-full text-left px-3 py-1 text-sm text-destructive hover:bg-muted"
                  onClick={async () => {
                    setOpenMenu(null);
                    onDeleteRequested(row.id);
                  }}
                >
                  Hapus
                </button>
              </div>
            )}
          </div>
        );
      },
    },
  ];

  return <DataTable columns={columns} data={events} searchKey="title" searchPlaceholder="Cari kegiatan..." />;
}

export function KalenderClient({ initialYears }: { initialYears: Year[] }) {
  const [years] = useState<Year[]>(initialYears);
  const [yearId, setYearId] = useState<string | null>(initialYears[0]?.id ?? null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", startDate: "", endDate: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; startDate?: string }>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!yearId) return;
    fetch(`/api/admin/manajemen-akademik/academic-events?yearId=${yearId}`)
      .then((r) => r.json())
      .then((data) => setEvents(data || []))
      .catch((err) => console.error(err));
  }, [yearId]);

  const submit = async () => {
    if (!yearId) return;
    // client-side validation
    setErrors({});
    if (!form.title?.trim()) {
      setErrors({ title: "Judul kegiatan wajib diisi" });
      return;
    }
    if (!form.startDate) {
      setErrors({ startDate: "Tanggal mulai wajib diisi" });
      return;
    }

    setIsSubmitting(true);
    try {
      let res: Response;
      if (editingId) {
        res = await fetch(`/api/admin/manajemen-akademik/academic-events`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, tahunAjaranId: yearId, ...form }),
        });
      } else {
        res = await fetch(`/api/admin/manajemen-akademik/academic-events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tahunAjaranId: yearId, ...form }),
        });
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || "Gagal menyimpan kegiatan");
        return;
      }

      toast.success(editingId ? "Kegiatan diperbarui" : "Kegiatan ditambahkan");
      setShowAdd(false);
      setEditingId(null);
      setForm({ title: "", description: "", startDate: "", endDate: "" });
      setErrors({});

      // refresh
      const list = await fetch(`/api/admin/manajemen-akademik/academic-events?yearId=${yearId}`);
      setEvents(await list.json());
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat menyimpan kegiatan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Kalender Akademik</h2>
          <p className="text-muted-foreground">Kelola daftar kegiatan akademik per tahun ajaran.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setIsCalendarOpen((s) => !s)} variant="outline">{isCalendarOpen ? 'Tampilkan Daftar' : 'Tampilkan Kalender'}</Button>
          <Button onClick={() => { setEditingId(null); setForm({ title: "", description: "", startDate: "", endDate: "" }); setErrors({}); setShowAdd(true); }}>Tambah Kegiatan</Button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <label className="text-sm text-muted-foreground">Pilih Tahun:</label>
        <select
          value={yearId ?? undefined}
          onChange={(e) => setYearId(e.target.value)}
          className="inline-flex items-center rounded-md border px-3 py-1 text-sm"
        >
          {years.map((y) => (
            <option key={y.id} value={y.id}>{y.name}</option>
          ))}
        </select>
      </div>

      {!isCalendarOpen && (
        <div className="mt-4">
          <EventTable
            events={events}
            onEdit={(ev) => {
              setEditingId(ev.id);
              setForm({ title: ev.title, description: ev.description ?? "", startDate: ev.startDate.slice(0, 10), endDate: ev.endDate ? ev.endDate.slice(0, 10) : "" });
              setShowAdd(true);
            }}
            onDeleteRequested={(id: string) => {
              setConfirmDeleteId(id);
              setConfirmOpen(true);
            }}
          />
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Hapus Kegiatan"
        description="Kegiatan ini akan dihapus secara permanen. Lanjutkan?"
        confirmText="Hapus"
        cancelText="Batal"
        isDestructive={true}
        onConfirm={async () => {
          if (!confirmDeleteId) return;
          try {
            await fetch(`/api/admin/manajemen-akademik/academic-events?id=${confirmDeleteId}`, { method: "DELETE" });
            const res = await fetch(`/api/admin/manajemen-akademik/academic-events?yearId=${yearId}`);
            setEvents(await res.json());
          } catch (err) {
            console.error(err);
          } finally {
            setConfirmOpen(false);
            setConfirmDeleteId(null);
          }
        }}
        onCancel={() => {
          setConfirmOpen(false);
          setConfirmDeleteId(null);
        }}
      />

      {isCalendarOpen && (
        <div className="border rounded-md p-4">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={events.map((ev) => ({ id: ev.id, title: ev.title, start: ev.startDate, end: ev.endDate || undefined }))}
            selectable={true}
            select={(info) => {
              setEditingId(null);
              setForm((f) => ({ ...f, startDate: info.startStr, endDate: info.endStr || info.startStr }));
              setShowAdd(true);
            }}
            eventClick={(args) => {
              const ev = events.find((e) => e.id === args.event.id);
              if (ev) {
                alert(`${ev.title}\n${new Date(ev.startDate).toLocaleDateString()} - ${ev.endDate ? new Date(ev.endDate).toLocaleDateString() : ''}`);
              }
            }}
            height="auto"
          />
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Kegiatan" : "Tambah Kegiatan"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-2 mt-2">
            <div>
              <Input
                placeholder="Judul kegiatan"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={errors.title ? "border-destructive" : ""}
                aria-invalid={!!errors.title}
              />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
            </div>

            <Textarea placeholder="Deskripsi" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

            <div className="flex gap-2 items-start">
              <div className="flex-1">
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={errors.startDate ? "border-destructive" : ""} aria-invalid={!!errors.startDate} />
                {errors.startDate && <p className="text-sm text-destructive mt-1">{errors.startDate}</p>}
              </div>
              <div className="flex-1">
                <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Batal</Button>
            <Button onClick={submit} disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Simpan"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default KalenderClient;
