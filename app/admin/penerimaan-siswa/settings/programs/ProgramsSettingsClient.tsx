"use client";

import { useCallback, useMemo, useState } from "react";
import type { CellContext } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui";

interface Program {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  isActive: boolean;
}

export function ProgramsSettingsClient({ initialPrograms }: { initialPrograms: Program[] }) {
  const [programs, setPrograms] = useState<Program[]>(initialPrograms);
  const [isLoading, setIsLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  // Modal state for add/edit
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Program | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");

  const refreshPrograms = useCallback(async () => {
    const url = new URL("/api/admin/penerimaan-siswa/settings/programs", window.location.origin);
    url.searchParams.set("page", String(pageIndex));
    url.searchParams.set("pageSize", String(pageSize));
    if (search) url.searchParams.set("search", search);
    const res = await fetch(url.toString());
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        setPrograms(data);
        setTotalCount(undefined);
      } else {
        setPrograms(data.items || []);
        setTotalCount(typeof data.totalCount === "number" ? data.totalCount : undefined);
        setPageIndex(typeof data.page === "number" ? data.page : pageIndex);
        setPageSize(typeof data.pageSize === "number" ? data.pageSize : pageSize);
      }
    }
  }, [pageIndex, pageSize, search]);

  const openAdd = () => {
    setEditing(null);
    setName("");
    setCode("");
    setDescription("");
    setOpen(true);
  };

  const openEdit = (p: Program) => {
    setEditing(p);
    setName(p.name);
    setCode(p.code ?? "");
    setDescription(p.description ?? "");
    setOpen(true);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) return toast.error("Nama program wajib diisi.");
    setIsLoading(true);
    try {
      const method = editing ? "PATCH" : "POST";
      const body: Record<string, unknown> = {
        name,
        code: code || null,
        description: description || null
      };
      if (editing) body.programId = editing.id;

      const res = await fetch("/api/admin/penerimaan-siswa/settings/programs", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        toast.success(editing ? "Program diperbarui" : "Program berhasil ditambahkan");
        setOpen(false);
        await refreshPrograms();
      } else {
        const data = await res.json();
        toast.error(data.message || "Gagal menyimpan program");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat menyimpan program");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleProgram = useCallback(
    async (programId: string, currentStatus: boolean) => {
      setTogglingId(programId);
      try {
        const response = await fetch("/api/admin/penerimaan-siswa/settings/programs", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ programId, action: currentStatus ? "deactivate" : "activate" })
        });
        if (response.ok) {
          const data = await response.json();
          toast.success(data.message);
          await refreshPrograms();
        } else {
          const data = await response.json();
          toast.error(data.message || "Gagal mengubah status program");
        }
      } catch (error) {
        console.error(error);
        toast.error("Terjadi kesalahan saat mengubah status program");
      } finally {
        setTogglingId(null);
      }
    },
    [refreshPrograms]
  );

  const columns = useMemo(
    () => [
      { accessorKey: "name", header: "Nama" },
      {
        accessorKey: "code",
        header: "Kode",
        cell: (info: CellContext<Program, unknown>) => (info.getValue() as string | null) ?? "-"
      },
      {
        accessorKey: "description",
        header: "Deskripsi",
        cell: (info: CellContext<Program, unknown>) => (info.getValue() as string | null) ?? "-"
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }: { row: { original: Program } }) => (
          <span
            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${row.original.isActive ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`}
          >
            {row.original.isActive ? "Aktif" : "Tidak aktif"}
          </span>
        )
      },
      {
        id: "actions",
        header: "Aksi",
        cell: ({ row }: { row: { original: Program } }) => (
          <div className="flex items-center gap-2">
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    •••
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => openEdit(row.original)}>Edit</DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={togglingId === row.original.id}
                    onSelect={() => handleToggleProgram(row.original.id, row.original.isActive)}
                  >
                    {row.original.isActive ? "Nonaktifkan" : "Aktifkan"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )
      }
    ],
    [togglingId, handleToggleProgram]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Program</h2>
          <p className="text-muted-foreground">Tambahkan dan kelola pilihan studi yang tersedia.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openAdd}>Tambah Program</Button>
        </div>
      </div>

      <div>
        <DataTable
          columns={columns}
          data={programs}
          serverSide
          totalCount={totalCount}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={p => {
            setPageIndex(p);
            void refreshPrograms();
          }}
          onPageSizeChange={ps => {
            setPageSize(ps);
            void refreshPrograms();
          }}
          onSearchChange={s => {
            setSearch(s);
            setPageIndex(0);
            void refreshPrograms();
          }}
        />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <span />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Program" : "Tambah Program"}</DialogTitle>
            <DialogDescription>
              {editing ? "Perbarui detail program." : "Tambahkan program baru."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-semibold text-foreground">
              Nama Program
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                className="mt-2"
                required
              />
            </label>
            <label className="block text-sm font-semibold text-foreground">
              Kode (opsional)
              <Input value={code} onChange={e => setCode(e.target.value)} className="mt-2" />
            </label>
            <label className="block text-sm font-semibold text-foreground">
              Deskripsi (opsional)
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                className="mt-2"
              />
            </label>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
