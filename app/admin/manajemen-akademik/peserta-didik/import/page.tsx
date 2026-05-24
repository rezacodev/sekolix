"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, Download, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";

interface ImportData {
  nik: string;
  fullName: string;
  nisn?: string;
  placeOfBirth?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  religion?: string;
  motherTongue?: string;
  address?: string;
  village?: string;
  district?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  phone: string;
  email?: string;
  mobile?: string;
  livesWith?: string;
  weight?: number;
  height?: number;
  distanceToSchool?: number;
  transportationMode?: string;
  anakKe?: number;
  jumlahSaudara?: number;
  achievements?: string;
  fatherName?: string;
  fatherNik?: string;
  fatherBirthYear?: number;
  fatherEducation?: string;
  fatherOccupation?: string;
  fatherIncome?: string;
  motherName?: string;
  motherNik?: string;
  motherBirthYear?: number;
  motherEducation?: string;
  motherOccupation?: string;
  motherIncome?: string;
  guardianName?: string;
  guardianNik?: string;
  guardianBirthYear?: number;
  guardianEducation?: string;
  guardianOccupation?: string;
  guardianIncome?: string;
}

interface Program {
  id: string;
  name: string;
  code?: string;
  isActive: boolean;
}

interface TahunAjaran {
  id: string;
  label: string;
  yearCode?: string;
  isActive: boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export default function ImportPesertaDidikPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importData, setImportData] = useState<ImportData[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);

  // Program and Year selection
  const [programs, setPrograms] = useState<Program[]>([]);
  const [years, setYears] = useState<TahunAjaran[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);
  const [isLoadingYears, setIsLoadingYears] = useState(false);

  // Load programs and years on mount
  useEffect(() => {
    const loadPrograms = async () => {
      setIsLoadingPrograms(true);
      try {
        const res = await fetch("/api/admin/penerimaan-siswa/settings/programs");
        if (res.ok) {
          const data = await res.json();
          setPrograms(data);
        }
      } catch (error) {
        console.error("Error loading programs:", error);
        toast.error("Gagal memuat data program");
      } finally {
        setIsLoadingPrograms(false);
      }
    };

    const loadYears = async () => {
      setIsLoadingYears(true);
      try {
        const res = await fetch("/api/admin/penerimaan-siswa/settings/years");
        if (res.ok) {
          const data = await res.json();
          setYears(data);
          // Auto-select active year if available
          const activeYear = data.find((year: TahunAjaran) => year.isActive);
          if (activeYear) {
            setSelectedYear(activeYear.id);
          }
        }
      } catch (error) {
        console.error("Error loading years:", error);
        toast.error("Gagal memuat data tahun ajaran");
      } finally {
        setIsLoadingYears(false);
      }
    };

    loadPrograms();
    loadYears();
  }, []);

  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/peserta-didik-import-template.csv";
    link.download = "peserta-didik-import-template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSV = (csvText: string): ImportData[] => {
    const lines = csvText.trim().split("\n");
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map(h => h.trim());
    const data: ImportData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim());
      if (values.length !== headers.length) continue;

      const row: Partial<ImportData> = {};
      headers.forEach((header, index) => {
        const value = values[index];
        if (value === "") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (row as any)[header] = undefined;
        } else if (
          [
            "weight",
            "height",
            "distanceToSchool",
            "anakKe",
            "jumlahSaudara",
            "fatherBirthYear",
            "motherBirthYear",
            "guardianBirthYear"
          ].includes(header)
        ) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (row as any)[header] = value ? parseFloat(value) : undefined;
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (row as any)[header] = value;
        }
      });

      data.push(row as ImportData);
    }

    return data;
  };

  const validateData = async (data: ImportData[]): Promise<ValidationResult[]> => {
    const results: ValidationResult[] = [];

    // Check for existing records
    const nikes = data.map(d => d.nik).filter(Boolean);
    const nisns = data.map(d => d.nisn).filter(Boolean);

    let existingRecords: { nik: string; nisn?: string }[] = [];
    try {
      const existingRes = await fetch(
        `/api/admin/manajemen-akademik/peserta-didik?checkExisting=true&nikes=${nikes.join(",")}&nisns=${nisns.join(",")}`
      );
      if (existingRes.ok) {
        existingRecords = await existingRes.json();
      } else {
        console.error("Failed to check existing records:", existingRes.status);
      }
    } catch (error) {
      console.error("Error checking existing records:", error);
    }

    // Check for duplicates within the file itself
    const nikMap = new Map<string, number[]>();
    const nisnMap = new Map<string, number[]>();

    data.forEach((item, index) => {
      if (item.nik) {
        if (!nikMap.has(item.nik)) nikMap.set(item.nik, []);
        nikMap.get(item.nik)!.push(index);
      }
      if (item.nisn) {
        if (!nisnMap.has(item.nisn)) nisnMap.set(item.nisn, []);
        nisnMap.get(item.nisn)!.push(index);
      }
    });

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const errors: string[] = [];
      const warnings: string[] = [];

      // Required fields validation
      if (!item.nik?.trim()) errors.push("NIK wajib diisi");
      if (!item.fullName?.trim()) errors.push("Nama lengkap wajib diisi");
      if (!item.phone?.trim()) errors.push("Telepon wajib diisi");

      // Duplicate check within file
      const duplicateNiks = nikMap.get(item.nik || "") || [];
      const duplicateNisns = item.nisn ? nisnMap.get(item.nisn) || [] : [];

      if (duplicateNiks.length > 1) {
        const firstIndex = duplicateNiks[0];
        if (i !== firstIndex) {
          errors.push(`NIK duplikat dalam file (baris ${firstIndex + 2})`);
        }
      }

      if (duplicateNisns.length > 1) {
        const firstIndex = duplicateNisns[0];
        if (i !== firstIndex) {
          errors.push(`NISN duplikat dalam file (baris ${firstIndex + 2})`);
        }
      }

      // Duplicate check with existing records
      const existingByNik = existingRecords.find(e => e.nik === item.nik);
      const existingByNisn = item.nisn && existingRecords.find(e => e.nisn === item.nisn);

      if (existingByNik) warnings.push("NIK sudah terdaftar di sistem - akan diupdate");
      if (existingByNisn) warnings.push("NISN sudah terdaftar di sistem - akan diupdate");

      // Email validation
      if (item.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email)) {
        errors.push("Format email tidak valid");
      }

      // Phone validation
      if (item.phone && !/^[\d+\-\s()]+$/.test(item.phone)) {
        warnings.push("Format telepon mungkin tidak valid");
      }

      // Numeric validations
      if (item.weight && (item.weight < 0 || item.weight > 200)) {
        warnings.push("Berat badan tidak realistis");
      }

      if (item.height && (item.height < 50 || item.height > 250)) {
        warnings.push("Tinggi badan tidak realistis");
      }

      results.push({
        isValid: errors.length === 0,
        errors,
        warnings
      });
    }

    return results;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("File harus berformat CSV");
      return;
    }

    setIsUploading(true);
    try {
      const text = await file.text();
      const data = parseCSV(text);

      if (data.length === 0) {
        toast.error("File CSV tidak berisi data valid");
        return;
      }

      const validations = await validateData(data);
      setImportData(data);
      setValidationResults(validations);

      toast.success(`Berhasil memproses ${data.length} baris data`);
    } catch (error) {
      console.error("Error parsing CSV:", error);
      toast.error("Gagal memproses file CSV");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleImport = async () => {
    if (importData.length === 0) return;

    // Check if all data is valid
    const hasErrors = validationResults.some(r => !r.isValid);
    if (hasErrors) {
      toast.error("Ada data yang tidak valid. Perbaiki terlebih dahulu.");
      return;
    }

    // Check if program and year are selected
    if (!selectedProgram || !selectedYear) {
      toast.error("Pilih program dan tahun ajaran terlebih dahulu.");
      return;
    }

    setIsImporting(true);
    try {
      // Send data as JSON with program and year IDs
      const payload = {
        items: importData,
        programId: selectedProgram,
        academicYearId: selectedYear
      };

      const res = await fetch("/api/admin/manajemen-akademik/peserta-didik/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Berhasil mengimpor ${data.created} peserta didik`);
        router.push("/admin/manajemen-akademik/peserta-didik");
      } else if (res.status === 207) {
        // Partial success - some records imported, some failed
        toast.warning(`Berhasil mengimpor ${data.created} data, ${data.failed} data gagal`, {
          duration: 5000
        });

        // Show specific errors
        if (data.errors && data.errors.length > 0) {
          data.errors.forEach((error: string) => {
            toast.error(error, { duration: 7000 });
          });
        }

        // Still redirect if at least some data was imported
        if (data.created > 0) {
          setTimeout(() => {
            router.push("/admin/manajemen-akademik/peserta-didik");
          }, 3000);
        }
      } else {
        toast.error(data.error || "Gagal mengimpor data");
      }
    } catch (error) {
      console.error("Error importing:", error);
      toast.error("Terjadi kesalahan saat mengimpor");
    } finally {
      setIsImporting(false);
    }
  };

  const getStatusBadge = (result: ValidationResult) => {
    if (!result.isValid) {
      return (
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          Error
        </Badge>
      );
    }
    if (result.warnings.some(w => w.includes("akan diupdate"))) {
      return (
        <Badge variant="secondary">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Update
        </Badge>
      );
    }
    if (result.warnings.length > 0) {
      return (
        <Badge variant="secondary">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Warning
        </Badge>
      );
    }
    return (
      <Badge variant="default">
        <CheckCircle className="w-3 h-3 mr-1" />
        Valid
      </Badge>
    );
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Import Peserta Didik"
        description="Upload file CSV untuk mengimpor data peserta didik secara massal."
        backHref="/admin/manajemen-akademik/peserta-didik"
      />

      <div className="space-y-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Langkah-langkah Import</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <h3 className="font-medium">Download Template</h3>
                  <p className="text-sm text-muted-foreground">
                    Unduh template CSV dengan format yang benar
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <h3 className="font-medium">Isi Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Lengkapi data peserta didik sesuai template
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <h3 className="font-medium">Upload & Import</h3>
                  <p className="text-sm text-muted-foreground">Upload file dan konfirmasi import</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pilih Program dan Tahun Ajaran</CardTitle>
            <p className="text-sm text-muted-foreground">
              Pilih program dan tahun ajaran untuk semua data yang akan diimpor
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="program-select">Program</Label>
                <Select
                  value={selectedProgram}
                  onValueChange={setSelectedProgram}
                  disabled={isLoadingPrograms}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={isLoadingPrograms ? "Memuat program..." : "Pilih program"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map(program => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.name} {program.code ? `(${program.code})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year-select">Tahun Ajaran</Label>
                <Select
                  value={selectedYear}
                  onValueChange={setSelectedYear}
                  disabled={isLoadingYears}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={isLoadingYears ? "Memuat tahun ajaran..." : "Pilih tahun ajaran"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.label} {year.isActive ? "(Aktif)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload File CSV</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button variant="outline" onClick={handleDownloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="mr-2 h-4 w-4" />
                {isUploading ? "Memproses..." : "Pilih File CSV"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {importData.length > 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                      File berhasil diproses. Periksa data di bawah sebelum mengimpor.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {importData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Preview Data ({importData.length} baris)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">
                      {
                        validationResults.filter(
                          r => r.isValid && !r.warnings.some(w => w.includes("akan diupdate"))
                        ).length
                      }{" "}
                      data baru,{" "}
                      {
                        validationResults.filter(r =>
                          r.warnings.some(w => w.includes("akan diupdate"))
                        ).length
                      }{" "}
                      data akan diupdate, {validationResults.filter(r => !r.isValid).length} data
                      error
                    </div>
                    {validationResults.some(r =>
                      r.errors.some(e => e.includes("duplikat dalam file"))
                    ) && (
                      <div className="text-xs text-red-600">
                        ⚠️ Ada data duplikat dalam file - perbaiki sebelum import
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={handleImport}
                    disabled={
                      isImporting ||
                      validationResults.some(r =>
                        r.errors.some(e => e.includes("duplikat dalam file"))
                      )
                    }
                  >
                    {isImporting ? "Mengimpor..." : "Import Data"}
                  </Button>
                </div>

                <div className="border rounded-lg max-h-96 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">#</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>NIK</TableHead>
                        <TableHead>Nama Lengkap</TableHead>
                        <TableHead>NISN</TableHead>
                        <TableHead>Telepon</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Validasi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importData.map((item, index) => {
                        const validation = validationResults[index];
                        return (
                          <TableRow key={index}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{getStatusBadge(validation)}</TableCell>
                            <TableCell>{item.nik}</TableCell>
                            <TableCell>{item.fullName}</TableCell>
                            <TableCell>{item.nisn || "-"}</TableCell>
                            <TableCell>{item.phone}</TableCell>
                            <TableCell>{item.email || "-"}</TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {validation.errors.map((error, i) => (
                                  <div key={i} className="text-xs text-red-600">
                                    • {error}
                                  </div>
                                ))}
                                {validation.warnings.map((warning, i) => (
                                  <div key={i} className="text-xs text-yellow-600">
                                    • {warning}
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
