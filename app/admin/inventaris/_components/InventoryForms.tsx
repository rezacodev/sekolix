"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArchiveRestore, Boxes, ClipboardCheck, MapPin, QrCode, RefreshCcw, Send, Tags, Wrench } from "lucide-react";

type Option = { id: string; label: string };

async function submitJson(url: string, body: unknown, method = "POST") {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof payload.error === "string" ? payload.error : "Proses gagal");
  return payload;
}

function Message({ text }: { text: string }) {
  return text ? <span className="text-sm text-slate-600">{text}</span> : null;
}

export function AssetCategoryForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitJson("/api/admin/inventaris/categories", {
        code: form.get("code"),
        name: form.get("name"),
        description: form.get("description"),
      });
      event.currentTarget.reset();
      setMessage("Kategori tersimpan.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan kategori.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-3">
      <input name="code" placeholder="Kode" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="name" placeholder="Nama kategori" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="description" placeholder="Deskripsi" className="rounded-md border px-3 py-2 text-sm" />
      <div className="flex items-center gap-3 md:col-span-3">
        <button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-teal-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
          <Tags className="h-4 w-4" />
          {pending ? "Menyimpan..." : "Tambah Kategori"}
        </button>
        <Message text={message} />
      </div>
    </form>
  );
}

export function AssetLocationForm({ rooms }: { rooms: Option[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitJson("/api/admin/inventaris/locations", {
        code: form.get("code"),
        name: form.get("name"),
        roomId: form.get("roomId") || null,
        building: form.get("building"),
        floor: form.get("floor"),
        description: form.get("description"),
      });
      event.currentTarget.reset();
      setMessage("Lokasi tersimpan.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan lokasi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-3">
      <input name="code" placeholder="Kode lokasi" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="name" placeholder="Nama lokasi" className="rounded-md border px-3 py-2 text-sm" required />
      <select name="roomId" className="rounded-md border px-3 py-2 text-sm">
        <option value="">Tanpa ruang</option>
        {rooms.map((room) => <option key={room.id} value={room.id}>{room.label}</option>)}
      </select>
      <input name="building" placeholder="Gedung" className="rounded-md border px-3 py-2 text-sm" />
      <input name="floor" placeholder="Lantai" className="rounded-md border px-3 py-2 text-sm" />
      <input name="description" placeholder="Catatan lokasi" className="rounded-md border px-3 py-2 text-sm" />
      <div className="flex items-center gap-3 md:col-span-3">
        <button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-teal-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
          <MapPin className="h-4 w-4" />
          {pending ? "Menyimpan..." : "Tambah Lokasi"}
        </button>
        <Message text={message} />
      </div>
    </form>
  );
}

export function AssetForm({ categories, locations, rooms, staff }: { categories: Option[]; locations: Option[]; rooms: Option[]; staff: Option[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitJson("/api/admin/inventaris/assets", {
        assetCode: form.get("assetCode") || null,
        name: form.get("name"),
        categoryId: form.get("categoryId") || null,
        locationId: form.get("locationId") || null,
        roomId: form.get("roomId") || null,
        responsibleStaffId: form.get("responsibleStaffId") || null,
        brand: form.get("brand"),
        model: form.get("model"),
        serialNumber: form.get("serialNumber"),
        purchaseDate: form.get("purchaseDate") || null,
        purchasePrice: form.get("purchasePrice") || null,
        source: form.get("source"),
        condition: form.get("condition"),
        status: form.get("status"),
        imageUrl: form.get("imageUrl") || null,
        notes: form.get("notes"),
      });
      event.currentTarget.reset();
      setMessage("Aset tersimpan.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan aset.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-3">
      <input name="assetCode" placeholder="Kode aset opsional" className="rounded-md border px-3 py-2 text-sm" />
      <input name="name" placeholder="Nama aset" className="rounded-md border px-3 py-2 text-sm md:col-span-2" required />
      <select name="categoryId" className="rounded-md border px-3 py-2 text-sm"><option value="">Kategori</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <select name="locationId" className="rounded-md border px-3 py-2 text-sm"><option value="">Lokasi</option>{locations.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <select name="roomId" className="rounded-md border px-3 py-2 text-sm"><option value="">Ruang</option>{rooms.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <select name="responsibleStaffId" className="rounded-md border px-3 py-2 text-sm"><option value="">Penanggung jawab</option>{staff.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <input name="brand" placeholder="Merek" className="rounded-md border px-3 py-2 text-sm" />
      <input name="model" placeholder="Model/tipe" className="rounded-md border px-3 py-2 text-sm" />
      <input name="serialNumber" placeholder="Serial number" className="rounded-md border px-3 py-2 text-sm" />
      <input name="purchaseDate" type="date" className="rounded-md border px-3 py-2 text-sm" />
      <input name="purchasePrice" type="number" min="0" placeholder="Harga perolehan" className="rounded-md border px-3 py-2 text-sm" />
      <input name="source" placeholder="Sumber dana/perolehan" className="rounded-md border px-3 py-2 text-sm" />
      <select name="condition" defaultValue="GOOD" className="rounded-md border px-3 py-2 text-sm">
        <option value="GOOD">Baik</option>
        <option value="FAIR">Cukup</option>
        <option value="DAMAGED">Rusak</option>
        <option value="BROKEN">Berat</option>
      </select>
      <select name="status" defaultValue="ACTIVE" className="rounded-md border px-3 py-2 text-sm">
        <option value="ACTIVE">Aktif</option>
        <option value="MAINTENANCE">Pemeliharaan</option>
        <option value="LOST">Hilang</option>
        <option value="DISPOSED">Dihapuskan</option>
      </select>
      <input name="imageUrl" type="url" placeholder="URL foto opsional" className="rounded-md border px-3 py-2 text-sm" />
      <textarea name="notes" placeholder="Catatan" className="rounded-md border px-3 py-2 text-sm md:col-span-3" />
      <div className="flex items-center gap-3 md:col-span-3">
        <button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-teal-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
          <Boxes className="h-4 w-4" />
          {pending ? "Menyimpan..." : "Tambah Aset"}
        </button>
        <Message text={message} />
      </div>
    </form>
  );
}

export function AssetConditionForm({ assets }: { assets: Option[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const assetId = String(form.get("assetId") ?? "");
    try {
      await submitJson(`/api/admin/inventaris/assets/${assetId}/condition`, {
        condition: form.get("condition"),
        status: form.get("status") || undefined,
        description: form.get("description"),
        photoUrl: form.get("photoUrl") || null,
      }, "PATCH");
      event.currentTarget.reset();
      setMessage("Kondisi aset diperbarui.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal memperbarui kondisi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-3">
      <select name="assetId" className="rounded-md border px-3 py-2 text-sm md:col-span-2" required><option value="">Pilih aset</option>{assets.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <select name="condition" defaultValue="GOOD" className="rounded-md border px-3 py-2 text-sm">
        <option value="GOOD">Baik</option><option value="FAIR">Cukup</option><option value="DAMAGED">Rusak</option><option value="BROKEN">Berat</option>
      </select>
      <select name="status" className="rounded-md border px-3 py-2 text-sm">
        <option value="">Status tetap</option><option value="ACTIVE">Aktif</option><option value="MAINTENANCE">Pemeliharaan</option><option value="LOST">Hilang</option><option value="DISPOSED">Dihapuskan</option>
      </select>
      <input name="photoUrl" type="url" placeholder="URL foto bukti" className="rounded-md border px-3 py-2 text-sm" />
      <input name="description" placeholder="Keterangan pemeriksaan" className="rounded-md border px-3 py-2 text-sm" />
      <div className="flex items-center gap-3 md:col-span-3">
        <button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-teal-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
          <ClipboardCheck className="h-4 w-4" />
          {pending ? "Menyimpan..." : "Update Kondisi"}
        </button>
        <Message text={message} />
      </div>
    </form>
  );
}

export function AssetMoveForm({ assets, locations, rooms }: { assets: Option[]; locations: Option[]; rooms: Option[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const assetId = String(form.get("assetId") ?? "");
    try {
      await submitJson(`/api/admin/inventaris/assets/${assetId}/move`, {
        locationId: form.get("locationId") || null,
        roomId: form.get("roomId") || null,
        reason: form.get("reason"),
        notes: form.get("notes"),
      }, "PATCH");
      event.currentTarget.reset();
      setMessage("Mutasi aset tercatat.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal mencatat mutasi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2">
      <select name="assetId" className="rounded-md border px-3 py-2 text-sm" required><option value="">Pilih aset</option>{assets.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <select name="locationId" className="rounded-md border px-3 py-2 text-sm"><option value="">Lokasi tujuan</option>{locations.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <select name="roomId" className="rounded-md border px-3 py-2 text-sm"><option value="">Ruang tujuan</option>{rooms.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <input name="reason" placeholder="Alasan mutasi" className="rounded-md border px-3 py-2 text-sm" />
      <textarea name="notes" placeholder="Catatan" className="rounded-md border px-3 py-2 text-sm md:col-span-2" />
      <div className="flex items-center gap-3 md:col-span-2">
        <button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-teal-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
          <ArchiveRestore className="h-4 w-4" />
          {pending ? "Menyimpan..." : "Catat Mutasi"}
        </button>
        <Message text={message} />
      </div>
    </form>
  );
}

export function AssetLoanForm({ assets, rooms }: { assets: Option[]; rooms: Option[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitJson("/api/admin/inventaris/loans", {
        assetId: form.get("assetId"),
        roomId: form.get("roomId") || null,
        borrowerName: form.get("borrowerName"),
        borrowerType: form.get("borrowerType"),
        purpose: form.get("purpose"),
        startAt: form.get("startAt") || undefined,
        dueAt: form.get("dueAt") || undefined,
        notes: form.get("notes"),
      });
      event.currentTarget.reset();
      setMessage("Peminjaman tercatat.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal mencatat peminjaman.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2">
      <select name="assetId" className="rounded-md border px-3 py-2 text-sm" required><option value="">Pilih aset aktif</option>{assets.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <select name="roomId" className="rounded-md border px-3 py-2 text-sm"><option value="">Ruang terkait</option>{rooms.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <input name="borrowerName" placeholder="Nama peminjam" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="borrowerType" defaultValue="STAFF" placeholder="Tipe peminjam" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="startAt" type="datetime-local" className="rounded-md border px-3 py-2 text-sm" />
      <input name="dueAt" type="datetime-local" className="rounded-md border px-3 py-2 text-sm" />
      <input name="purpose" placeholder="Keperluan" className="rounded-md border px-3 py-2 text-sm md:col-span-2" required />
      <textarea name="notes" placeholder="Catatan" className="rounded-md border px-3 py-2 text-sm md:col-span-2" />
      <div className="flex items-center gap-3 md:col-span-2">
        <button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-teal-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
          <Send className="h-4 w-4" />
          {pending ? "Menyimpan..." : "Catat Pinjam"}
        </button>
        <Message text={message} />
      </div>
    </form>
  );
}

export function AssetReturnButton({ loanId }: { loanId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function returnLoan() {
    setPending(true);
    try {
      await submitJson(`/api/admin/inventaris/loans/${loanId}/return`, { condition: "GOOD" }, "PATCH");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button onClick={returnLoan} disabled={pending} className="inline-flex items-center gap-1 rounded-md bg-teal-700 px-2 py-1 text-xs font-semibold text-white disabled:opacity-60">
      <RefreshCcw className="h-3 w-3" />
      Kembali
    </button>
  );
}

export function MaintenanceForm({ assets }: { assets: Option[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitJson("/api/admin/inventaris/maintenances", {
        assetId: form.get("assetId"),
        title: form.get("title"),
        description: form.get("description"),
        scheduledAt: form.get("scheduledAt"),
        cost: form.get("cost") || null,
      });
      event.currentTarget.reset();
      setMessage("Jadwal pemeliharaan tersimpan.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan pemeliharaan.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2">
      <select name="assetId" className="rounded-md border px-3 py-2 text-sm" required><option value="">Pilih aset</option>{assets.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
      <input name="title" placeholder="Judul pemeliharaan" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="scheduledAt" type="datetime-local" className="rounded-md border px-3 py-2 text-sm" required />
      <input name="cost" type="number" min="0" placeholder="Estimasi biaya" className="rounded-md border px-3 py-2 text-sm" />
      <textarea name="description" placeholder="Deskripsi pekerjaan" className="rounded-md border px-3 py-2 text-sm md:col-span-2" />
      <div className="flex items-center gap-3 md:col-span-2">
        <button disabled={pending} className="inline-flex items-center gap-2 rounded-md bg-teal-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
          <Wrench className="h-4 w-4" />
          {pending ? "Menyimpan..." : "Jadwalkan"}
        </button>
        <Message text={message} />
      </div>
    </form>
  );
}

export function CompleteMaintenanceButton({ maintenanceId }: { maintenanceId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function complete() {
    setPending(true);
    try {
      await submitJson(`/api/admin/inventaris/maintenances/${maintenanceId}/complete`, { condition: "GOOD", resultNote: "Selesai." }, "PATCH");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button onClick={complete} disabled={pending} className="inline-flex items-center gap-1 rounded-md bg-teal-700 px-2 py-1 text-xs font-semibold text-white disabled:opacity-60">
      <QrCode className="h-3 w-3" />
      Selesai
    </button>
  );
}

