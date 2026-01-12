"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface AcademicYear {
  id: string;
  label: string;
  yearCode?: string | null;
  isActive: boolean;
}

export function RegistrationCodeSettingsClient({ initialYears }: { initialYears: AcademicYear[] }) {
  const [years] = useState<AcademicYear[]>(initialYears);
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<AcademicYear | null>(null);

  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [padLength, setPadLength] = useState(4);
  const [includeYearCode, setIncludeYearCode] = useState(true);
  const [nextNumber, setNextNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedYearId) {
      toast.error("Pilih tahun ajaran terlebih dahulu");
      return;
    }

    if (!prefix.trim()) {
      toast.error("Prefix kode registrasi wajib diisi.");
      return;
    }

    if (padLength < 1 || padLength > 10) {
      toast.error("Panjang padding harus antara 1-10.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/penerimaan-siswa/settings/registration-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          yearId: selectedYearId,
          prefix,
          suffix,
          padLength,
          includeYearCode
        })
      });

      if (response.ok) {
        toast.success("Pengaturan kode registrasi berhasil disimpan");
      } else {
        const result = await response.json();
        toast.error(result.message || "Gagal menyimpan pengaturan");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Terjadi kesalahan saat menyimpan pengaturan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetCounter = async () => {
    if (!selectedYearId) {
      toast.error("Pilih tahun ajaran terlebih dahulu");
      return;
    }

    if (!confirm("Apakah Anda yakin ingin mereset counter nomor urut ke 1?")) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/penerimaan-siswa/settings/registration-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          yearId: selectedYearId,
          resetCounter: 1
        })
      });

      if (response.ok) {
        setNextNumber(1);
        toast.success("Counter nomor urut berhasil direset ke 1");
      } else {
        const result = await response.json();
        toast.error(result.message || "Gagal mereset counter");
      }
    } catch (error) {
      console.error("Error resetting counter:", error);
      toast.error("Terjadi kesalahan saat mereset counter");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectYear = async (yearId: string) => {
    if (!yearId) {
      setSelectedYearId("");
      setSelectedYear(null);
      return;
    }

    setSelectedYearId(yearId);
    const year = years.find(y => y.id === yearId) || null;
    setSelectedYear(year);

    // Load settings untuk tahun yang dipilih
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/penerimaan-siswa/settings/registration-code?yearId=${yearId}`
      );

      if (response.ok) {
        const settings = await response.json();
        setPrefix(settings.prefix);
        setSuffix(settings.suffix);
        setPadLength(settings.padLength);
        setIncludeYearCode(settings.includeYearCode);
        setNextNumber(settings.nextNumber);
      } else {
        toast.error("Gagal memuat pengaturan kode registrasi");
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Terjadi kesalahan saat memuat pengaturan");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate preview code
  const previewCode = `${prefix}${includeYearCode ? selectedYear?.yearCode || "XX" : ""}${String(
    nextNumber
  ).padStart(padLength, "0")}${suffix}`;

  return (
    <div className="rounded-3xl border border-card bg-card p-8 shadow space-y-6">
      {/* Header */}
      <section>
        <h2 className="text-2xl font-bold tracking-tight">Pengaturan Kode Registrasi</h2>
        <p className="text-muted-foreground">
          Kelola format dan nomor urut kode registrasi untuk setiap tahun ajaran secara independen
        </p>
      </section>

      {/* Main Section */}
      <section className="rounded-3xl border border-card bg-card p-6 shadow">
        <div className="space-y-6">
          {/* Pilih Tahun Ajaran */}
          <label className="block">
            <span className="text-sm font-semibold text-foreground">Pilih Tahun Ajaran</span>
            <select
              value={selectedYearId}
              onChange={e => handleSelectYear(e.target.value)}
              disabled={isLoading}
              className="mt-2 w-full rounded-lg border border-card bg-card px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none disabled:bg-muted"
            >
              <option value="">-- Pilih Tahun Ajaran --</option>
              {years.map(year => (
                <option key={year.id} value={year.id}>
                  {year.label} {year.isActive && "(Aktif)"}
                </option>
              ))}
            </select>
          </label>

          {selectedYear && (
            <>
              {/* Preview Kode */}
              <div className="rounded-lg border border-card bg-card p-4">
                <h4 className="font-semibold text-foreground mb-2">Preview Kode Registrasi:</h4>
                <div className="flex items-center gap-4">
                  <div className="inline-flex items-center gap-3">
                    <code className="text-2xl font-mono font-bold text-foreground bg-muted px-3 py-1 rounded-lg">
                      {previewCode}
                    </code>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Contoh kode berikutnya akan digunakan saat ada pendaftar baru
                  </div>
                </div>
              </div>

              {/* Form Settings */}
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Prefix */}
                  <label className="block">
                    <span className="text-sm font-semibold text-foreground">Prefix (Awalan)</span>
                    <Input
                      type="text"
                      value={prefix}
                      onChange={e => setPrefix(e.target.value)}
                      placeholder="Contoh: DAFTAR, PMB, REG"
                      disabled={isLoading}
                      required
                      className="mt-2"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Awalan yang akan digunakan di setiap kode registrasi
                    </p>
                  </label>

                  {/* Suffix */}
                  <label className="block">
                    <span className="text-sm font-semibold text-foreground">Suffix (Akhiran)</span>
                    <Input
                      type="text"
                      value={suffix}
                      onChange={e => setSuffix(e.target.value)}
                      placeholder="Contoh: -NEW, -2025 (opsional)"
                      disabled={isLoading}
                      className="mt-2"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Akhiran kode registrasi (opsional)
                    </p>
                  </label>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Pad Length */}
                  <label className="block">
                    <span className="text-sm font-semibold text-foreground">
                      Panjang Padding Nomor Urut
                    </span>
                    <select
                      value={padLength}
                      onChange={e => setPadLength(parseInt(e.target.value))}
                      disabled={isLoading}
                      className="mt-2 w-full rounded-lg border border-card bg-card px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none disabled:bg-muted"
                    >
                      <option value={1}>1 digit (1, 2, 3...)</option>
                      <option value={2}>2 digit (01, 02, 03...)</option>
                      <option value={3}>3 digit (001, 002, 003...)</option>
                      <option value={4}>4 digit (0001, 0002, 0003...)</option>
                      <option value={5}>5 digit (00001, 00002...)</option>
                      <option value={6}>6 digit (000001, 000002...)</option>
                    </select>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Jumlah digit untuk nomor urut (akan di-pad dengan 0)
                    </p>
                  </label>

                  {/* Include Year Code */}
                  <label className="block">
                    <div className="flex items-center gap-2 mt-2">
                      <Checkbox
                        id="includeYearCode"
                        checked={includeYearCode}
                        onCheckedChange={v => setIncludeYearCode(Boolean(v))}
                        disabled={isLoading}
                      />
                      <span className="text-sm font-semibold text-foreground">
                        Sertakan Kode Tahun Ajaran
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Kode tahun: {selectedYear.yearCode || "belum diatur"} - akan ditambahkan
                      setelah prefix
                    </p>
                  </label>
                </div>

                {/* Next Number */}
                <label className="block">
                  <span className="text-sm font-semibold text-foreground">
                    Nomor Urut Berikutnya
                  </span>
                  <Input
                    type="number"
                    value={nextNumber}
                    onChange={e => setNextNumber(Number(e.target.value))}
                    min={1}
                    disabled={isLoading}
                    className="mt-2"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Nomor yang akan digunakan untuk kode registrasi berikutnya
                  </p>
                </label>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    variant="default"
                    size="default"
                    className="flex-1"
                  >
                    {isLoading ? "Menyimpan..." : "Simpan Pengaturan"}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleResetCounter}
                    disabled={isLoading}
                    variant="outline"
                    size="default"
                  >
                    Reset Counter
                  </Button>
                </div>
              </form>
            </>
          )}

          {!selectedYearId && (
            <div className="rounded-lg border border-card bg-muted p-4 text-sm text-muted-foreground">
              <p className="font-semibold">Pilih tahun ajaran terlebih dahulu</p>
              <p className="mt-1 text-xs">
                Setiap tahun ajaran memiliki pengaturan kode registrasi yang terpisah dan independen
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Info Box */}
      <section className="rounded-3xl border border-card bg-card p-6 shadow">
        <h3 className="text-lg font-semibold text-foreground mb-4">ℹ️ Informasi</h3>
        <ul className="space-y-3 text-sm text-foreground">
          <li className="flex items-start gap-3">
            <span className="text-accent font-semibold mt-0.5">•</span>
            <span>
              Setiap tahun ajaran memiliki pengaturan kode registrasi yang{" "}
              <strong>independen</strong>
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-accent font-semibold mt-0.5">•</span>
            <span>Nomor urut di tahun A tidak akan mempengaruhi nomor urut tahun B</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-accent font-semibold mt-0.5">•</span>
            <span>Klik &quot;Reset Counter&quot; untuk mengembalikan nomor urut ke 1</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-accent font-semibold mt-0.5">•</span>
            <span>Preview kode akan membantu Anda melihat format sebelum menyimpan</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-accent font-semibold mt-0.5">•</span>
            <span>
              Pastikan kode tahun ajaran sudah diatur di menu Tahun Ajaran terlebih dahulu
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
