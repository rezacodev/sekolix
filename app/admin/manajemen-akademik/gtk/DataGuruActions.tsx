"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { createColumns, Gtk } from "./columns";

type FormState = {
  name: string;
  nip?: string;
  niy?: string;
  nuptk?: string;
  nik?: string;
  statusKepegawaian?: string;
  nrg?: string;
  masaKerja?: number | null;
  mkg?: number | null;
  position?: string;
  department?: string;
  email?: string;
  phone?: string;
  role?: string;
  photo?: string;
  bio?: string;
  subjects?: string;
  workloadHours?: number | null;
  extraDuties?: string;
  placeOfBirth?: string;
  dateOfBirth?: string;
  gender?: string;
  religion?: string;
  maritalStatus?: string;
  address?: string;
  educationHistory?: string;
  academicDegree?: string;
  trainingHistory?: string;
  gtkPosition?: string;
  professionalAllowanceStatus?: string;
  familyInfo?: string;
};

export default function GtkActions() {
  const router = useRouter();
  const [items, setItems] = useState<Gtk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [jenisFilter, setJenisFilter] = useState<string | undefined>(undefined);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing] = useState<Gtk | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    nip: "",
    niy: "",
    nuptk: "",
    nik: "",
    statusKepegawaian: "",
    nrg: "",
    masaKerja: null,
    mkg: null,
    position: "",
    department: "",
    email: "",
    phone: "",
    role: "TEACHER",
    bio: "",
    subjects: "",
    workloadHours: null,
    extraDuties: ""
  });

  const fetchItems = useCallback(async (
    p = pageIndex,
    ps = pageSize,
    s = search,
    status?: string | undefined,
    jenis?: string | undefined
  ) => {
    try {
      setIsLoading(true);
      const url = new URL("/api/admin/manajemen-akademik/gtk", window.location.origin);
      url.searchParams.set("page", String(p));
      url.searchParams.set("pageSize", String(ps));
      if (s) url.searchParams.set("search", s);
      if (status) url.searchParams.set("statusKepegawaian", status);
      if (jenis) url.searchParams.set("jenisPTK", jenis);
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setItems(data);
          setTotalCount(undefined);
        } else {
          setItems(data.items || []);
          setTotalCount(typeof data.totalCount === "number" ? data.totalCount : undefined);
          setPageIndex(typeof data.page === "number" ? data.page : p);
          setPageSize(typeof data.pageSize === "number" ? data.pageSize : ps);
        }
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      // Error handling removed - error state not used
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, search, pageIndex]);
   
  useEffect(() => {
    void fetchItems(0, pageSize, search, statusFilter, jenisFilter);
  }, [fetchItems, pageSize, search, statusFilter, jenisFilter]);

  const handleDelete = (id: string) => setConfirmDelete(id);
  const handleEdit = (t: Gtk) => {
    router.push(`/admin/manajemen-akademik/gtk/${t.id}/edit`);
  };

  // Note: 'Tambah' (add) now uses a separate page instead of modal.

  const submitForm = async () => {
    try {
      const payload = { ...form };
      const url = editing
        ? `/api/admin/manajemen-akademik/gtk/${editing.id}`
        : "/api/admin/manajemen-akademik/gtk";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsModalOpen(false);
        void fetchItems(0, pageSize, search, statusFilter, jenisFilter);
      } else {
        const data = await res.json();
        console.error("Failed to save:", data?.error || "Gagal menyimpan data");
      }
    } catch (err) {
      console.error(err);
      console.error("Gagal menyimpan data");
    }
  };

  const confirmDeleteItem = async () => {
    if (!confirmDelete) return;
    try {
      const res = await fetch(`/api/admin/manajemen-akademik/gtk/${confirmDelete}`, {
        method: "DELETE"
      });
      if (res.ok) {
        void fetchItems(pageIndex, pageSize, search, statusFilter, jenisFilter);
      } else {
        const data = await res.json();
        console.error("Failed to delete:", data?.error || "Gagal menghapus data");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      console.error("Gagal menghapus data.");
    } finally {
      setConfirmDelete(null);
    }
  };

  const columns = createColumns({ onDelete: handleDelete, onEdit: handleEdit });

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="text-center py-10">Memuat data...</div>
      ) : (
        <DataTable
          columns={columns}
          data={items}
          searchKey="name"
          serverSide
          totalCount={totalCount}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={p => void fetchItems(p, pageSize, search, statusFilter, jenisFilter)}
          onPageSizeChange={ps => void fetchItems(0, ps, search, statusFilter, jenisFilter)}
          onSearchChange={s => {
            setSearch(s);
            void fetchItems(0, pageSize, s, statusFilter, jenisFilter);
          }}
          filterConfig={[
            {
              column: "statusKepegawaian",
              title: "Status GTK",
              options: [
                { label: "PNS", value: "PNS" },
                { label: "Non-PNS", value: "Non-PNS" }
              ]
            },
            {
              column: "jenisPTK",
              title: "Jenis PTK",
              options: [
                { label: "Kepala Sekolah", value: "Kepala Sekolah" },
                { label: "Guru", value: "Guru" },
                { label: "Tenaga Kependidikan", value: "Tenaga Kependidikan" }
              ]
            }
          ]}
          onFilterChange={(column, value) => {
            if (column === "statusKepegawaian") {
              setStatusFilter(value);
              void fetchItems(0, pageSize, search, value, jenisFilter);
            }
            if (column === "jenisPTK") {
              setJenisFilter(value);
              void fetchItems(0, pageSize, search, statusFilter, value);
            }
          }}
          externalFilters={{ statusKepegawaian: statusFilter, jenisPTK: jenisFilter }}
        />
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Hapus Data"
        description="Data akan dihapus permanen. Lanjutkan?"
        confirmText="Hapus"
        onConfirm={confirmDeleteItem}
        onCancel={() => setConfirmDelete(null)}
      />
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit GTK" : "Tambah GTK"}</DialogTitle>
            <DialogDescription>
              {editing ? "Perbarui informasi GTK." : "Tambah GTK baru."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <label className="text-sm">Nama Lengkap</label>
            <input
              className="input"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />

            <label className="text-sm">NUPTK</label>
            <input
              className="input"
              value={form.nuptk}
              onChange={e => setForm({ ...form, nuptk: e.target.value })}
            />

            <label className="text-sm">NIK</label>
            <input
              className="input"
              value={form.nik}
              onChange={e => setForm({ ...form, nik: e.target.value })}
            />

            <label className="text-sm">NIP / NIY</label>
            <input
              className="input"
              value={form.nip}
              onChange={e => setForm({ ...form, nip: e.target.value })}
            />

            <label className="text-sm">Status Kepegawaian</label>
            <input
              className="input"
              value={form.statusKepegawaian}
              onChange={e => setForm({ ...form, statusKepegawaian: e.target.value })}
            />

            <label className="text-sm">NRG</label>
            <input
              className="input"
              value={form.nrg}
              onChange={e => setForm({ ...form, nrg: e.target.value })}
            />

            <label className="text-sm">Masa Kerja (tahun)</label>
            <input
              type="number"
              className="input"
              value={form.masaKerja ?? ""}
              onChange={e =>
                setForm({
                  ...form,
                  masaKerja: e.target.value === "" ? null : Number(e.target.value)
                })
              }
            />

            <label className="text-sm">MKG</label>
            <input
              type="number"
              className="input"
              value={form.mkg ?? ""}
              onChange={e =>
                setForm({ ...form, mkg: e.target.value === "" ? null : Number(e.target.value) })
              }
            />

            <label className="text-sm">Tempat Lahir</label>

            <label className="text-sm">MKG</label>
            <input
              type="number"
              className="input"
              value={form.mkg ?? ""}
              onChange={e =>
                setForm({ ...form, mkg: e.target.value === "" ? null : Number(e.target.value) })
              }
            />

            <label className="text-sm">Tempat Lahir</label>
            <input
              className="input"
              value={form.placeOfBirth}
              onChange={e => setForm({ ...form, placeOfBirth: e.target.value })}
            />

            <label className="text-sm">Tanggal Lahir</label>
            <input
              type="date"
              className="input"
              value={form.dateOfBirth || ""}
              onChange={e => setForm({ ...form, dateOfBirth: e.target.value })}
            />

            <label className="text-sm">Jenis Kelamin</label>
            <select
              className="input"
              value={form.gender || ""}
              onChange={e => setForm({ ...form, gender: e.target.value })}
            >
              <option value="">-</option>
              <option value="MALE">Laki-laki</option>
              <option value="FEMALE">Perempuan</option>
            </select>

            <label className="text-sm">Agama</label>
            <input
              className="input"
              value={form.religion}
              onChange={e => setForm({ ...form, religion: e.target.value })}
            />

            <label className="text-sm">Status Perkawinan</label>
            <input
              className="input"
              value={form.maritalStatus}
              onChange={e => setForm({ ...form, maritalStatus: e.target.value })}
            />

            <label className="text-sm">Alamat Lengkap</label>
            <textarea
              className="input"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
            />

            <label className="text-sm">Email</label>
            <input
              className="input"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />

            <label className="text-sm">Telepon</label>
            <input
              className="input"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
            />
            <label className="text-sm">Mata Pelajaran (JSON/CSV)</label>
            <input
              className="input"
              value={form.subjects}
              onChange={e => setForm({ ...form, subjects: e.target.value })}
            />

            <label className="text-sm">Beban Kerja (jam/minggu)</label>
            <input
              type="number"
              className="input"
              value={form.workloadHours ?? ""}
              onChange={e =>
                setForm({
                  ...form,
                  workloadHours: e.target.value === "" ? null : Number(e.target.value)
                })
              }
            />

            <label className="text-sm">Jabatan GTK</label>
            <label className="text-sm">Riwayat Diklat/Pelatihan (JSON)</label>
            <textarea
              className="input"
              value={form.trainingHistory || ""}
              onChange={e => setForm({ ...form, trainingHistory: e.target.value })}
            />

            <label className="text-sm">Mata Pelajaran (JSON/CSV)</label>
            <input
              className="input"
              value={form.subjects}
              onChange={e => setForm({ ...form, subjects: e.target.value })}
            />

            <label className="text-sm">Beban Kerja (jam/minggu)</label>
            <input
              type="number"
              className="input"
              value={form.workloadHours ?? ""}
              onChange={e =>
                setForm({
                  ...form,
                  workloadHours: e.target.value === "" ? null : Number(e.target.value)
                })
              }
            />

            <label className="text-sm">Jabatan GTK</label>
            <input
              className="input"
              value={form.gtkPosition}
              onChange={e => setForm({ ...form, gtkPosition: e.target.value })}
            />

            <label className="text-sm">Status Tunjangan Profesi</label>
            <input
              className="input"
              value={form.professionalAllowanceStatus}
              onChange={e => setForm({ ...form, professionalAllowanceStatus: e.target.value })}
            />

            <label className="text-sm">Informasi Keluarga (JSON)</label>
            <textarea
              className="input"
              value={form.familyInfo || ""}
              onChange={e => setForm({ ...form, familyInfo: e.target.value })}
            />
          </div>

          <DialogFooter>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button onClick={submitForm}>{editing ? "Simpan" : "Tambah"}</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
