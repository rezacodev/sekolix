"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type FormData = {
  // DATA PRIBADI
  fullName: string;
  gender: string;
  nisn: string;
  nik: string;
  noKK: string;
  placeOfBirth: string;
  dateOfBirth: string;
  nationality: string;
  religion: string;
  motherTongue: string;
  address: string;
  village: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;

  // DATA AYAH KANDUNG
  fatherName: string;
  fatherNik: string;
  fatherBirthYear: string;
  fatherEducation: string;
  fatherOccupation: string;
  fatherIncome: string;

  // DATA IBU KANDUNG
  motherName: string;
  motherNik: string;
  motherBirthYear: string;
  motherEducation: string;
  motherOccupation: string;
  motherIncome: string;

  // DATA WALI
  guardianName: string;
  guardianNik: string;
  guardianBirthYear: string;
  guardianEducation: string;
  guardianOccupation: string;
  guardianIncome: string;

  // KONTAK
  phone: string;
  mobile: string;
  email: string;

  // DATA RINCIAN PESERTA DIDIK
  livesWith: string;
  weight: string;
  height: string;
  distanceToSchool: string;
  transportationMode: string;
  anak_ke: string;
  jumlahSaudara: string;

  // PRESTASI
  achievements: string;
};

type SectionKey =
  | "dataPribadi"
  | "dataAyah"
  | "dataIbu"
  | "dataWali"
  | "kontak"
  | "dataRincian"
  | "prestasi";

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "dataPribadi", label: "Data Pribadi" },
  { key: "dataAyah", label: "Data Ayah" },
  { key: "dataIbu", label: "Data Ibu" },
  { key: "dataWali", label: "Data Wali" },
  { key: "kontak", label: "Kontak" },
  { key: "dataRincian", label: "Data Rincian" },
  { key: "prestasi", label: "Prestasi" }
];

// Stable, top-level input components to avoid remounts which cause focus loss
function InputField({
  label,
  field,
  type = "text",
  required = false,
  placeholder = "",
  form,
  onChange
}: {
  label: string;
  field: keyof FormData;
  type?: string;
  required?: boolean;
  placeholder?: string;
  form: FormData;
  onChange: (
    field: keyof FormData
  ) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="font-semibold text-slate-800">
        {label}
        {required && <span className="text-rose-600"> *</span>}
      </span>
      <input
        type={type}
        value={form[field] as string}
        onChange={onChange(field)}
        placeholder={placeholder}
        required={required}
        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
      />
    </label>
  );
}

function SelectField({
  label,
  field,
  options,
  required = false,
  form,
  onChange
}: {
  label: string;
  field: keyof FormData;
  options: { value: string; label: string }[];
  required?: boolean;
  form: FormData;
  onChange: (
    field: keyof FormData
  ) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="font-semibold text-slate-800">
        {label}
        {required && <span className="text-rose-600"> *</span>}
      </span>
      <select
        value={form[field] as string}
        onChange={onChange(field)}
        required={required}
        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
      >
        <option value="">-- Pilih --</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ProfileCompletionForm({ applicantId }: { applicantId: string }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<FormData>({
    fullName: "",
    gender: "",
    nisn: "",
    nik: "",
    noKK: "",
    placeOfBirth: "",
    dateOfBirth: "",
    nationality: "Indonesia",
    religion: "",
    motherTongue: "",
    address: "",
    village: "",
    district: "",
    city: "",
    province: "",
    postalCode: "",
    fatherName: "",
    fatherNik: "",
    fatherBirthYear: "",
    fatherEducation: "",
    fatherOccupation: "",
    fatherIncome: "",
    motherName: "",
    motherNik: "",
    motherBirthYear: "",
    motherEducation: "",
    motherOccupation: "",
    motherIncome: "",
    guardianName: "",
    guardianNik: "",
    guardianBirthYear: "",
    guardianEducation: "",
    guardianOccupation: "",
    guardianIncome: "",
    phone: "",
    mobile: "",
    email: "",
    livesWith: "",
    weight: "",
    height: "",
    distanceToSchool: "",
    transportationMode: "",
    anak_ke: "",
    jumlahSaudara: "",
    achievements: ""
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  // autosave removed; saving happens when user clicks the Save buttons

  useEffect(() => {
    // fetch basic applicant data to prefill certain fields (nik, phone, email, fullName)
    let mounted = true;
    async function load() {
      try {
        const res = await fetch(
          `/api/penerimaan-siswa/spmb/applicant?applicantId=${encodeURIComponent(applicantId)}`
        );
        if (!res.ok) return;
        const payload = await res.json();
        if (!mounted) return;
        const a = payload.applicant;
        if (a) {
          setForm(prev => ({
            ...prev,
            fullName: prev.fullName || (a.fullName ?? "") || "",
            gender: prev.gender || (a.gender ?? "") || "",
            nisn: prev.nisn || (a.nisn ?? "") || "",
            nik: prev.nik || (a.nik ?? "") || "",
            noKK: prev.noKK || (a.noKK ?? "") || "",
            placeOfBirth: prev.placeOfBirth || (a.placeOfBirth ?? "") || "",
            dateOfBirth:
              prev.dateOfBirth ||
              (a.dateOfBirth ? new Date(a.dateOfBirth).toISOString().slice(0, 10) : "") ||
              "",
            nationality: prev.nationality || (a.nationality ?? "Indonesia") || "Indonesia",
            religion: prev.religion || (a.religion ?? "") || "",
            motherTongue: prev.motherTongue || (a.motherTongue ?? "") || "",
            address: prev.address || (a.address ?? "") || "",
            village: prev.village || (a.village ?? "") || "",
            district: prev.district || (a.district ?? "") || "",
            city: prev.city || (a.city ?? "") || "",
            province: prev.province || (a.province ?? "") || "",
            postalCode: prev.postalCode || (a.postalCode ?? "") || "",

            fatherName: prev.fatherName || (a.fatherName ?? "") || "",
            fatherNik: prev.fatherNik || (a.fatherNik ?? "") || "",
            fatherBirthYear:
              prev.fatherBirthYear || (a.fatherBirthYear ? String(a.fatherBirthYear) : "") || "",
            fatherEducation: prev.fatherEducation || (a.fatherEducation ?? "") || "",
            fatherOccupation: prev.fatherOccupation || (a.fatherOccupation ?? "") || "",
            fatherIncome: prev.fatherIncome || (a.fatherIncome ?? "") || "",

            motherName: prev.motherName || (a.motherName ?? "") || "",
            motherNik: prev.motherNik || (a.motherNik ?? "") || "",
            motherBirthYear:
              prev.motherBirthYear || (a.motherBirthYear ? String(a.motherBirthYear) : "") || "",
            motherEducation: prev.motherEducation || (a.motherEducation ?? "") || "",
            motherOccupation: prev.motherOccupation || (a.motherOccupation ?? "") || "",
            motherIncome: prev.motherIncome || (a.motherIncome ?? "") || "",

            guardianName: prev.guardianName || (a.guardianName ?? "") || "",
            guardianNik: prev.guardianNik || (a.guardianNik ?? "") || "",
            guardianBirthYear:
              prev.guardianBirthYear ||
              (a.guardianBirthYear ? String(a.guardianBirthYear) : "") ||
              "",
            guardianEducation: prev.guardianEducation || (a.guardianEducation ?? "") || "",
            guardianOccupation: prev.guardianOccupation || (a.guardianOccupation ?? "") || "",
            guardianIncome: prev.guardianIncome || (a.guardianIncome ?? "") || "",

            // contact
            phone: prev.phone || (a.phone ?? "") || "",
            mobile: prev.mobile || (a.mobile ?? a.phone ?? "") || "",
            email: prev.email || (a.email ?? "") || "",

            livesWith: prev.livesWith || (a.livesWith ?? "") || "",
            weight: prev.weight || (a.weight ? String(a.weight) : "") || "",
            height: prev.height || (a.height ? String(a.height) : "") || "",
            distanceToSchool:
              prev.distanceToSchool || (a.distanceToSchool ? String(a.distanceToSchool) : "") || "",
            transportationMode: prev.transportationMode || (a.transportationMode ?? "") || "",
            anak_ke: prev.anak_ke || (a.anakKe ? String(a.anakKe) : "") || "",
            jumlahSaudara:
              prev.jumlahSaudara || (a.jumlahSaudara ? String(a.jumlahSaudara) : "") || "",

            achievements: prev.achievements || (a.achievements ?? "") || ""
          }));
        }
      } catch {
        // ignore
      }
    }
    if (applicantId) load();
    return () => {
      mounted = false;
    };
  }, [applicantId]);

  const calculateProgress = () => {
    const filledFields = Object.values(form).filter(value => value !== "" && value !== null).length;
    const totalFields = Object.keys(form).length;
    return Math.round((filledFields / totalFields) * 100);
  };

  const handleInputChange =
    (field: keyof FormData) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);
    setLoading(true);
    try {
      const response = await fetch("/api/penerimaan-siswa/spmb/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicantId, ...form })
      });

      const payload = await response.json();
      if (!response.ok) {
        setFeedback({ type: "error", message: payload.message ?? "Gagal menyimpan data." });
      } else {
        setFeedback({
          type: "success",
          message: payload.message ?? "Data profil berhasil disimpan."
        });
        // keep currentStep as-is (do not reset)
      }
    } catch (error) {
      console.error(error);
      setFeedback({ type: "error", message: "Tidak dapat terhubung ke server." });
    } finally {
      setLoading(false);
    }
  };

  // Clear feedback flash after 5 seconds
  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 5000);
    return () => clearTimeout(t);
  }, [feedback]);

  // Use the stable top-level InputField and SelectField above

  const renderSection = () => {
    const step = SECTIONS[currentStep];

    switch (step.key) {
      case "dataPribadi":
        return (
          <div className="space-y-4">
            <div className="grid gap-3 lg:grid-cols-3">
              <InputField
                label="Nama Lengkap"
                field="fullName"
                required
                form={form}
                onChange={handleInputChange}
              />
              <SelectField
                label="Jenis Kelamin"
                field="gender"
                required
                form={form}
                onChange={handleInputChange}
                options={[
                  { value: "L", label: "Laki-laki" },
                  { value: "P", label: "Perempuan" }
                ]}
              />
              <InputField
                label="NISN"
                field="nisn"
                placeholder="10 digit"
                form={form}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              <InputField
                label="NIK"
                field="nik"
                required
                placeholder="16 digit"
                form={form}
                onChange={handleInputChange}
              />
              <InputField
                label="No. Kartu Keluarga"
                field="noKK"
                form={form}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-3 lg:grid-cols-3">
              <InputField
                label="Tempat Lahir"
                field="placeOfBirth"
                required
                form={form}
                onChange={handleInputChange}
              />
              <InputField
                label="Tanggal Lahir"
                field="dateOfBirth"
                type="date"
                required
                form={form}
                onChange={handleInputChange}
              />
              <SelectField
                label="Kebangsaan"
                field="nationality"
                form={form}
                onChange={handleInputChange}
                options={[
                  { value: "Indonesia", label: "Indonesia" },
                  { value: "Asing", label: "Asing" }
                ]}
              />
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              <SelectField
                label="Agama"
                field="religion"
                required
                form={form}
                onChange={handleInputChange}
                options={[
                  { value: "Islam", label: "Islam" },
                  { value: "Kristen", label: "Kristen" },
                  { value: "Katolik", label: "Katolik" },
                  { value: "Hindu", label: "Hindu" },
                  { value: "Buddha", label: "Buddha" },
                  { value: "Konghucu", label: "Konghucu" }
                ]}
              />
              <InputField
                label="Bahasa Ibu"
                field="motherTongue"
                form={form}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-3 lg:grid-cols-3">
              <InputField
                label="Alamat"
                field="address"
                required
                form={form}
                onChange={handleInputChange}
              />
              <InputField
                label="Desa/Kelurahan"
                field="village"
                form={form}
                onChange={handleInputChange}
              />
              <InputField
                label="Kecamatan"
                field="district"
                form={form}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-3 lg:grid-cols-3">
              <InputField label="Kota" field="city" form={form} onChange={handleInputChange} />
              <InputField
                label="Provinsi"
                field="province"
                form={form}
                onChange={handleInputChange}
              />
              <InputField
                label="Kode Pos"
                field="postalCode"
                form={form}
                onChange={handleInputChange}
              />
            </div>
          </div>
        );

      case "dataAyah":
        return (
          <div className="space-y-4">
            <div className="grid gap-3 lg:grid-cols-3">
              <InputField
                label="Nama Lengkap"
                field="fatherName"
                form={form}
                onChange={handleInputChange}
              />
              <InputField
                label="NIK"
                field="fatherNik"
                placeholder="16 digit"
                form={form}
                onChange={handleInputChange}
              />
              <InputField
                label="Tahun Lahir"
                field="fatherBirthYear"
                type="number"
                form={form}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              <SelectField
                label="Pendidikan Terakhir"
                field="fatherEducation"
                form={form}
                onChange={handleInputChange}
                options={[
                  { value: "SD", label: "SD" },
                  { value: "SMP", label: "SMP" },
                  { value: "SMA", label: "SMA" },
                  { value: "Diploma", label: "Diploma" },
                  { value: "Sarjana", label: "Sarjana" },
                  { value: "Pasca Sarjana", label: "Pasca Sarjana" }
                ]}
              />
              <InputField
                label="Pekerjaan"
                field="fatherOccupation"
                form={form}
                onChange={handleInputChange}
              />
            </div>
            <SelectField
              label="Penghasilan Bulanan"
              field="fatherIncome"
              form={form}
              onChange={handleInputChange}
              options={[
                { value: "< 1 juta", label: "< 1 juta" },
                { value: "1 - 2 juta", label: "1 - 2 juta" },
                { value: "2 - 3 juta", label: "2 - 3 juta" },
                { value: "3 - 5 juta", label: "3 - 5 juta" },
                { value: "> 5 juta", label: "> 5 juta" }
              ]}
            />
          </div>
        );

      case "dataIbu":
        return (
          <div className="space-y-4">
            <div className="grid gap-3 lg:grid-cols-3">
              <InputField
                label="Nama Lengkap"
                field="motherName"
                form={form}
                onChange={handleInputChange}
              />
              <InputField
                label="NIK"
                field="motherNik"
                placeholder="16 digit"
                form={form}
                onChange={handleInputChange}
              />
              <InputField
                label="Tahun Lahir"
                field="motherBirthYear"
                type="number"
                form={form}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              <SelectField
                label="Pendidikan Terakhir"
                field="motherEducation"
                form={form}
                onChange={handleInputChange}
                options={[
                  { value: "SD", label: "SD" },
                  { value: "SMP", label: "SMP" },
                  { value: "SMA", label: "SMA" },
                  { value: "Diploma", label: "Diploma" },
                  { value: "Sarjana", label: "Sarjana" },
                  { value: "Pasca Sarjana", label: "Pasca Sarjana" }
                ]}
              />
              <InputField
                label="Pekerjaan"
                field="motherOccupation"
                form={form}
                onChange={handleInputChange}
              />
            </div>
            <SelectField
              label="Penghasilan Bulanan"
              field="motherIncome"
              form={form}
              onChange={handleInputChange}
              options={[
                { value: "< 1 juta", label: "< 1 juta" },
                { value: "1 - 2 juta", label: "1 - 2 juta" },
                { value: "2 - 3 juta", label: "2 - 3 juta" },
                { value: "3 - 5 juta", label: "3 - 5 juta" },
                { value: "> 5 juta", label: "> 5 juta" }
              ]}
            />
          </div>
        );

      case "dataWali":
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Isi jika ada wali, jika tidak bisa dikosongkan</p>
            <div className="grid gap-3 lg:grid-cols-3">
              <InputField
                label="Nama Lengkap"
                field="guardianName"
                form={form}
                onChange={handleInputChange}
              />
              <InputField
                label="NIK"
                field="guardianNik"
                placeholder="16 digit"
                form={form}
                onChange={handleInputChange}
              />
              <InputField
                label="Tahun Lahir"
                field="guardianBirthYear"
                type="number"
                form={form}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              <SelectField
                label="Pendidikan Terakhir"
                field="guardianEducation"
                form={form}
                onChange={handleInputChange}
                options={[
                  { value: "SD", label: "SD" },
                  { value: "SMP", label: "SMP" },
                  { value: "SMA", label: "SMA" },
                  { value: "Diploma", label: "Diploma" },
                  { value: "Sarjana", label: "Sarjana" },
                  { value: "Pasca Sarjana", label: "Pasca Sarjana" }
                ]}
              />
              <InputField
                label="Pekerjaan"
                field="guardianOccupation"
                form={form}
                onChange={handleInputChange}
              />
            </div>
            <SelectField
              label="Penghasilan Bulanan"
              field="guardianIncome"
              form={form}
              onChange={handleInputChange}
              options={[
                { value: "< 1 juta", label: "< 1 juta" },
                { value: "1 - 2 juta", label: "1 - 2 juta" },
                { value: "2 - 3 juta", label: "2 - 3 juta" },
                { value: "3 - 5 juta", label: "3 - 5 juta" },
                { value: "> 5 juta", label: "> 5 juta" }
              ]}
            />
          </div>
        );

      case "kontak":
        return (
          <div className="space-y-4">
            <div className="grid gap-3 lg:grid-cols-3">
              <InputField
                label="Telepon Rumah"
                field="phone"
                placeholder="0212345"
                form={form}
                onChange={handleInputChange}
              />
              <InputField
                label="Nomor HP"
                field="mobile"
                required
                placeholder="08123456789"
                form={form}
                onChange={handleInputChange}
              />
              <InputField
                label="Email"
                field="email"
                type="email"
                placeholder="(opsional)"
                form={form}
                onChange={handleInputChange}
              />
            </div>
          </div>
        );

      case "dataRincian":
        return (
          <div className="space-y-4">
            <div className="grid gap-3 lg:grid-cols-3">
              <SelectField
                label="Tinggal Bersama"
                field="livesWith"
                form={form}
                onChange={handleInputChange}
                options={[
                  { value: "Orang Tua", label: "Orang Tua" },
                  { value: "Salah Satu Orang Tua", label: "Salah Satu Orang Tua" },
                  { value: "Wali", label: "Wali" },
                  { value: "Lainnya", label: "Lainnya" }
                ]}
              />
              <InputField
                label="Berat Badan (kg)"
                field="weight"
                type="number"
                form={form}
                onChange={handleInputChange}
              />
              <InputField
                label="Tinggi Badan (cm)"
                field="height"
                type="number"
                form={form}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              <InputField
                label="Jarak ke Sekolah (km)"
                field="distanceToSchool"
                type="number"
                form={form}
                onChange={handleInputChange}
              />
              <SelectField
                label="Moda Transportasi"
                field="transportationMode"
                form={form}
                onChange={handleInputChange}
                options={[
                  { value: "Jalan kaki", label: "Jalan kaki" },
                  { value: "Sepeda", label: "Sepeda" },
                  { value: "Motor", label: "Motor" },
                  { value: "Mobil", label: "Mobil" },
                  { value: "Angkutan Umum", label: "Angkutan Umum" }
                ]}
              />
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              <InputField
                label="Anak ke-"
                field="anak_ke"
                type="number"
                form={form}
                onChange={handleInputChange}
              />
              <InputField
                label="Jumlah Saudara"
                field="jumlahSaudara"
                type="number"
                form={form}
                onChange={handleInputChange}
              />
            </div>
          </div>
        );

      case "prestasi":
        return (
          <div className="space-y-4">
            <label className="block text-sm">
              <span className="font-semibold text-slate-800">Daftar Prestasi (jika ada)</span>
              <textarea
                value={form.achievements}
                onChange={handleInputChange("achievements")}
                placeholder="Sertifikat, penghargaan, atau prestasi lainnya"
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
                rows={6}
              />
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Progress Section */}
      <div className="mb-3 rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 p-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Progress Pengisian Data</h3>
            <p className="mt-0 text-xs text-slate-600">
              Langkah {currentStep + 1} dari {SECTIONS.length}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-slate-900">{calculateProgress()}%</div>
            <p className="text-xs text-slate-500">Selesai</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-slate-900 transition-all duration-300"
            style={{ width: `${calculateProgress()}%` }}
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-4 border-b border-slate-200 overflow-x-auto">
        <div className="flex gap-2 pb-3 min-w-full">
          {SECTIONS.map((section, index) => (
            <button
              key={section.key}
              type="button"
              onClick={() => setCurrentStep(index)}
              className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold transition ${
                currentStep === index
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
        <div className="h-0.5 w-full bg-slate-200">
          <div
            className="h-full bg-slate-900 transition-all duration-300"
            style={{
              width: `${((currentStep + 1) / SECTIONS.length) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Feedback Message */}
      {feedback && (
        <div
          className={`mb-3 rounded-lg px-4 py-2 text-xs font-semibold ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Form Content */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-3">
          <h3 className="text-sm font-bold text-slate-900">{SECTIONS[currentStep].label}</h3>
        </div>

        <div>{renderSection()}</div>

        {/* Navigation Buttons */}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-3 w-3" />
            Sebelumnya
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "💾 Simpan Progress"}
          </button>

          {currentStep === SECTIONS.length - 1 ? (
            <button
              type="submit"
              disabled={loading}
              className="ml-auto inline-flex items-center justify-center rounded-md bg-slate-900 px-5 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "✓ Simpan & Selesai"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => Math.min(SECTIONS.length - 1, prev + 1))}
              className="ml-auto inline-flex items-center gap-1 rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
            >
              Selanjutnya
              <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
