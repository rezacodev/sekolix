"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { DatePicker } from "@/components/ui/date-picker";
import { NumberInput } from "@/components/ui/number-input";
import Link from "next/link";
import { toast } from "sonner";

type FormState = {
  name: string;
  nip?: string;
  niy?: string;
  nuptk?: string;
  nik?: string;
  statusKepegawaian?: string;
  nrg?: string;
  masaKerja: number | null;
  mkg: number | null;
  position?: string;
  department?: string;
  email?: string;
  phone?: string;
  placeOfBirth?: string;
  dateOfBirth?: string;
  gender?: string;
  religion?: string;
  maritalStatus?: string;
  address?: string;
  subjects?: string;
  workloadHours: number | null;
  gtkPosition?: string;
  trainingHistory?: string;
  familyInfo?: string;
  jenisPTK?: string;
  jabatanPTK?: string;
};

type GtkFormProps = { initialData?: Partial<FormState> & { id?: string; address?: string } };

export default function GtkForm({ initialData }: GtkFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    name: "",
    masaKerja: null,
    mkg: null,
    workloadHours: null
  });
  const [addressContent, setAddressContent] = useState<string>(form.address || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  // Known options for Jabatan PTK — used to render Select items and allow fallback display
  const jabatanOptions = [
    "Guru IPA",
    "Guru Matematika",
    "Guru Bahasa Indonesia",
    "Guru Bahasa Inggris",
    "Guru Agama",
    "Guru PPKn",
    "Guru Seni Budaya",
    "Guru Penjas",
    "Guru BK",
    "Guru Informatika",
    "Kepala Laboratorium",
    "Pustakawan",
    "Laboran",
    "Admin Sekolah",
    "Lainnya"
  ];

  useEffect(() => {
    if (initialData) {
      setForm(s => ({
        ...s,
        name: initialData.name ?? "",
        nip: initialData.nip ?? "",
        niy: initialData.niy ?? "",
        nuptk: initialData.nuptk ?? "",
        nik: initialData.nik ?? "",
        statusKepegawaian: initialData.statusKepegawaian
          ? String(initialData.statusKepegawaian)
          : "",
        nrg: initialData.nrg ?? "",
        masaKerja: initialData.masaKerja ?? null,
        mkg: initialData.mkg ?? null,
        position: initialData.position ?? "",
        department: initialData.department ?? "",
        email: initialData.email ?? "",
        phone: initialData.phone ?? "",
        placeOfBirth: initialData.placeOfBirth ?? "",
        dateOfBirth: initialData.dateOfBirth
          ? new Date(initialData.dateOfBirth).toISOString().slice(0, 10)
          : "",
        gender: initialData.gender ?? "",
        religion: initialData.religion ?? "",
        maritalStatus: initialData.maritalStatus ?? "",
        address: initialData.address ?? "",
        subjects: initialData.subjects ?? "",
        workloadHours: initialData.workloadHours ?? null,
        gtkPosition: initialData.gtkPosition ?? "",
        trainingHistory: initialData.trainingHistory ?? "",
        familyInfo: initialData.familyInfo ?? "",
        jenisPTK: initialData.jenisPTK ? String(initialData.jenisPTK) : "",
        jabatanPTK: initialData.jabatanPTK ? String(initialData.jabatanPTK) : ""
      }));
      setAddressContent(initialData.address ?? "");
    }
  }, [initialData]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    // client-side validation
    const errs: Record<string, string> = {};
    if (!form?.name || form.name.trim() === "") errs.name = "Nama wajib diisi";
    if (!form?.gender) errs.gender = "Jenis kelamin wajib dipilih";
    if (!addressContent || addressContent.trim() === "") errs.address = "Alamat wajib diisi";
    if (!form?.statusKepegawaian) errs.statusKepegawaian = "Status kepegawaian wajib dipilih";
    if (!form?.jenisPTK) errs.jenisPTK = "Jenis PTK wajib dipilih";
    if (!form?.jabatanPTK) errs.jabatanPTK = "Jabatan PTK wajib dipilih";

    // Validasi email jika diisi
    if (form?.email && form.email.trim() !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Format email tidak valid";
    }

    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      setIsSubmitting(false);
      return;
    }
    try {
      const isEdit = !!initialData?.id;
      const url = isEdit
        ? `/api/admin/manajemen-akademik/gtk/${initialData.id}`
        : "/api/admin/manajemen-akademik/gtk";
      const method = isEdit ? "PUT" : "POST";
      // Tentukan role berdasarkan jenisPTK
      const roleBasedOnJenisPTK =
        form.jenisPTK === "Guru"
          ? "TEACHER"
          : form.jenisPTK === "Tenaga Kependidikan"
            ? "STAFF"
            : "ADMIN";

      const payload = {
        ...form,
        role: roleBasedOnJenisPTK, // Tetapkan role berdasarkan jenis PTK
        masaKerja:
          form.masaKerja === undefined || form.masaKerja === null ? null : Number(form.masaKerja),
        mkg: form.mkg === undefined || form.mkg === null ? null : Number(form.mkg),
        workloadHours:
          form.workloadHours === undefined || form.workloadHours === null
            ? null
            : Number(form.workloadHours),
        address: addressContent,
        statusKepegawaian: form.statusKepegawaian || undefined,
        jenisPTK: form.jenisPTK || undefined,
        jabatanPTK: form.jabatanPTK || undefined
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setError(null);
        const successMsg = isEdit ? "Data GTK berhasil diperbarui" : "Data GTK berhasil dibuat";
        toast.success(successMsg);
        // ensure UI refresh
        void router.refresh();
        // navigate back to list if editing, otherwise stay
        if (isEdit) router.push("/admin/manajemen-akademik/gtk");
      } else {
        const data = await res.json();
        const msg = data?.error || "Gagal menyimpan data";
        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      console.error(err);
      if (err instanceof Error && err.message?.includes("P2002")) {
        setError("Data dengan NIP/NIY ini sudah ada. Silakan gunakan NIP/NIY yang berbeda.");
        toast.error("Data dengan NIP/NIY ini sudah ada.");
      } else {
        setError("Gagal menyimpan data");
        toast.error("Gagal menyimpan data");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Informasi Pribadi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nama Lengkap <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
              {fieldErrors.name && <p className="text-sm text-destructive">{fieldErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label>
                Jenis Kelamin <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.gender || ""}
                onValueChange={val => setForm({ ...form, gender: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis kelamin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Laki-laki</SelectItem>
                  <SelectItem value="FEMALE">Perempuan</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.gender && (
                <p className="text-sm text-destructive">{fieldErrors.gender}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Tempat Lahir</Label>
              <Input
                value={form.placeOfBirth || ""}
                onChange={e => setForm({ ...form, placeOfBirth: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tanggal Lahir</Label>
              <DatePicker
                value={form.dateOfBirth || ""}
                onChange={val => setForm({ ...form, dateOfBirth: val })}
                placeholder="Pilih tanggal lahir"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Kepegawaian</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>NIP</Label>
              <Input
                value={form.nip || ""}
                onChange={e => setForm({ ...form, nip: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>NUPTK</Label>
              <Input
                value={form.nuptk || ""}
                onChange={e => setForm({ ...form, nuptk: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>
                Status Kepegawaian <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.statusKepegawaian || ""}
                onValueChange={val => setForm({ ...form, statusKepegawaian: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PNS">PNS</SelectItem>
                  <SelectItem value="Non-PNS">Non-PNS</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.statusKepegawaian && (
                <p className="text-sm text-destructive">{fieldErrors.statusKepegawaian}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Masa Kerja (tahun)</Label>
              <NumberInput
                value={form.masaKerja}
                onChange={val => setForm({ ...form, masaKerja: val })}
                min={0}
                max={50}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <Label>MKG</Label>
              <NumberInput
                value={form.mkg}
                onChange={val => setForm({ ...form, mkg: val })}
                min={0}
                max={50}
                step={1}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detail GTK</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Jabatan GTK</Label>
              <Input
                value={form.gtkPosition || ""}
                onChange={e => setForm({ ...form, gtkPosition: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Mata Pelajaran (CSV/JSON)</Label>
              <Input
                value={form.subjects || ""}
                onChange={e => setForm({ ...form, subjects: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Beban Kerja (jam/minggu)</Label>
              <NumberInput
                value={form.workloadHours}
                onChange={val => setForm({ ...form, workloadHours: val })}
                min={0}
                max={50}
                step={1}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informasi PTK</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Jenis PTK <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.jenisPTK || ""}
                onValueChange={val => setForm({ ...form, jenisPTK: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis PTK" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kepala Sekolah">Kepala Sekolah</SelectItem>
                  <SelectItem value="Guru">Guru</SelectItem>
                  <SelectItem value="Tenaga Kependidikan">Tenaga Kependidikan</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.jenisPTK && (
                <p className="text-sm text-destructive">{fieldErrors.jenisPTK}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>
                Jabatan PTK <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.jabatanPTK || ""}
                onValueChange={val => setForm({ ...form, jabatanPTK: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jabatan PTK" />
                </SelectTrigger>
                <SelectContent>
                  {jabatanOptions.map(opt => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                  {/* If stored value is not one of the known options, include it so the select shows the current value */}
                  {form.jabatanPTK && !jabatanOptions.includes(form.jabatanPTK) && (
                    <SelectItem value={form.jabatanPTK}>{form.jabatanPTK}</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {fieldErrors.jabatanPTK && (
                <p className="text-sm text-destructive">{fieldErrors.jabatanPTK}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kontak & Tambahan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={form.email || ""}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
              {fieldErrors.email && <p className="text-sm text-destructive">{fieldErrors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label>Telepon</Label>
              <Input
                value={form.phone || ""}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Alamat</Label>
              <RichTextEditor
                content={addressContent}
                onChange={(val: string) => {
                  setAddressContent(val);
                  setForm({ ...form, address: val });
                }}
                placeholder="Masukkan alamat lengkap"
              />
              {fieldErrors.address && (
                <p className="text-sm text-destructive">{fieldErrors.address}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Link href="/admin/manajemen-akademik/gtk">
          <Button type="button" variant="outline">
            Batal
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </form>
  );
}
