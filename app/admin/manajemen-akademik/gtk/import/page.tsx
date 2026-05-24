"use client";

import { useState, useRef } from "react";
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
import { toast } from "sonner";
import { Upload, Download, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";

interface ImportData {
  nuptk?: string;
  nik?: string;
  nip?: string;
  niy?: string;
  name?: string;
  statusKepegawaian?: string;
  jenisPTK?: string;
  jabatanPTK?: string;
  placeOfBirth?: string;
  dateOfBirth?: string;
  gender?: string;
  religion?: string;
  maritalStatus?: string;
  address?: string;
  phone?: string;
  email?: string;
  educationHistory?: string;
  academicDegree?: string;
  subjects?: string;
  workloadHours?: number;
  masaKerja?: number;
  mkg?: number;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export default function ImportGtkPage() {
  const router = useRouter();
  const [data, setData] = useState<ImportData[]>([]);
  const [validations, setValidations] = useState<ValidationResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async e => {
      const csv = e.target?.result as string;
      const lines = csv.split("\n").filter(line => line.trim());
      const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));

      const parsedData: ImportData[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map(v => v.trim().replace(/"/g, ""));
        const row: Record<string, unknown> = {};
        headers.forEach((header, index) => {
          const value = values[index];
          if (header === "workloadHours" || header === "masaKerja" || header === "mkg") {
            row[header] = value ? parseInt(value) : undefined;
          } else {
            row[header] = value || undefined;
          }
        });
        parsedData.push(row as unknown as ImportData);
      }

      setData(parsedData);
      const validationResults = await validateData(parsedData);
      setValidations(validationResults);
    };
    reader.readAsText(file);
  };

  const validateData = async (data: ImportData[]): Promise<ValidationResult[]> => {
    const results: ValidationResult[] = [];

    // Check for existing records
    const nuptks = data.map(d => d.nuptk).filter(Boolean);
    const nikes = data.map(d => d.nik).filter(Boolean);
    const nips = data.map(d => d.nip).filter(Boolean);
    const niys = data.map(d => d.niy).filter(Boolean);

    let existingRecords: { nuptk?: string; nik?: string; nip?: string; niy?: string }[] = [];
    try {
      const existingRes = await fetch(
        `/api/admin/manajemen-akademik/gtk?checkExisting=true&nuptks=${nuptks.join(",")}&nikes=${nikes.join(",")}&nips=${nips.join(",")}&niys=${niys.join(",")}`
      );
      if (existingRes.ok) {
        existingRecords = await existingRes.json();
      } else {
        console.error("Failed to check existing GTK records:", existingRes.status);
      }
    } catch (error) {
      console.error("Error checking existing GTK records:", error);
    }

    // Check for duplicates within the file itself
    const nuptkMap = new Map<string, number[]>();
    const nikMap = new Map<string, number[]>();
    const nipMap = new Map<string, number[]>();
    const niyMap = new Map<string, number[]>();

    data.forEach((item, index) => {
      if (item.nuptk) {
        if (!nuptkMap.has(item.nuptk)) nuptkMap.set(item.nuptk, []);
        nuptkMap.get(item.nuptk)!.push(index);
      }
      if (item.nik) {
        if (!nikMap.has(item.nik)) nikMap.set(item.nik, []);
        nikMap.get(item.nik)!.push(index);
      }
      if (item.nip) {
        if (!nipMap.has(item.nip)) nipMap.set(item.nip, []);
        nipMap.get(item.nip)!.push(index);
      }
      if (item.niy) {
        if (!niyMap.has(item.niy)) niyMap.set(item.niy, []);
        niyMap.get(item.niy)!.push(index);
      }
    });

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const errors: string[] = [];
      const warnings: string[] = [];

      // Required fields validation
      if (!item.name?.trim()) errors.push("Nama wajib diisi");

      // At least one identifier required
      const hasIdentifier = item.nuptk || item.nik || item.nip || item.niy;
      if (!hasIdentifier)
        errors.push("Setidaknya satu identifier (NUPT, NIK, NIP, atau NIY) wajib diisi");

      // Duplicate check within file
      if (item.nuptk) {
        const duplicateNuptks = nuptkMap.get(item.nuptk) || [];
        if (duplicateNuptks.length > 1) {
          const firstIndex = duplicateNuptks[0];
          if (i !== firstIndex) {
            errors.push(`NUPT duplikat dalam file (baris ${firstIndex + 2})`);
          }
        }
      }

      if (item.nik) {
        const duplicateNiks = nikMap.get(item.nik) || [];
        if (duplicateNiks.length > 1) {
          const firstIndex = duplicateNiks[0];
          if (i !== firstIndex) {
            errors.push(`NIK duplikat dalam file (baris ${firstIndex + 2})`);
          }
        }
      }

      if (item.nip) {
        const duplicateNips = nipMap.get(item.nip) || [];
        if (duplicateNips.length > 1) {
          const firstIndex = duplicateNips[0];
          if (i !== firstIndex) {
            errors.push(`NIP duplikat dalam file (baris ${firstIndex + 2})`);
          }
        }
      }

      if (item.niy) {
        const duplicateNiys = niyMap.get(item.niy) || [];
        if (duplicateNiys.length > 1) {
          const firstIndex = duplicateNiys[0];
          if (i !== firstIndex) {
            errors.push(`NIY duplikat dalam file (baris ${firstIndex + 2})`);
          }
        }
      }

      // Duplicate check with existing records
      const existingByNuptk = item.nuptk && existingRecords.find(e => e.nuptk === item.nuptk);
      const existingByNik = item.nik && existingRecords.find(e => e.nik === item.nik);
      const existingByNip = item.nip && existingRecords.find(e => e.nip === item.nip);
      const existingByNiy = item.niy && existingRecords.find(e => e.niy === item.niy);

      if (existingByNuptk) warnings.push("NUPT sudah terdaftar di sistem - akan diupdate");
      if (existingByNik) warnings.push("NIK sudah terdaftar di sistem - akan diupdate");
      if (existingByNip) warnings.push("NIP sudah terdaftar di sistem - akan diupdate");
      if (existingByNiy) warnings.push("NIY sudah terdaftar di sistem - akan diupdate");

      // Email validation
      if (item.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email)) {
        errors.push("Format email tidak valid");
      }

      // Phone validation
      if (item.phone && !/^[\d+\-\s()]+$/.test(item.phone)) {
        warnings.push("Format telepon mungkin tidak valid");
      }

      results.push({
        isValid: errors.length === 0,
        errors,
        warnings
      });
    }

    return results;
  };

  const handleImport = async () => {
    if (!data.length) return;

    setIsProcessing(true);
    try {
      const res = await fetch("/api/admin/manajemen-akademik/gtk/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data })
      });

      if (res.ok) {
        toast.success("Data GTK berhasil diimpor");
        router.push("/admin/manajemen-akademik/gtk");
      } else {
        const error = await res.json();
        toast.error(error.error || "Gagal mengimpor data");
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Terjadi kesalahan saat mengimpor data");
    } finally {
      setIsProcessing(false);
    }
  };

  const hasErrors = validations.some(v => !v.isValid);
  const hasWarnings = validations.some(v => v.warnings.length > 0);

  return (
    <div className="p-6">
      <PageHeader
        title="Import Data GTK"
        description="Upload file CSV untuk mengimpor data Guru & Tenaga Kependidikan secara massal."
        backHref="/admin/manajemen-akademik/gtk"
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
                  <p className="text-sm text-muted-foreground">Lengkapi data GTK sesuai template</p>
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
            <CardTitle>Upload File CSV</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button variant="outline" asChild>
                <a href="/teacher-import-template.csv">
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </a>
              </Button>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Pilih File CSV
              </Button>
              {data.length > 0 && (
                <Button onClick={handleImport} disabled={hasErrors || isProcessing}>
                  {isProcessing ? "Memproses..." : "Impor Data"}
                </Button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleFileUpload}
            />
          </CardContent>
        </Card>

        {data.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {hasErrors ? (
                  <XCircle className="h-5 w-5 text-destructive" />
                ) : hasWarnings ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                Validasi Data ({data.length} baris)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Baris</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>NUPT</TableHead>
                    <TableHead>NIK</TableHead>
                    <TableHead>NIP</TableHead>
                    <TableHead>NIY</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Validasi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, index) => {
                    const validation = validations[index];
                    return (
                      <TableRow key={index}>
                        <TableCell>{index + 2}</TableCell>
                        <TableCell>{item.name || "-"}</TableCell>
                        <TableCell>{item.nuptk || "-"}</TableCell>
                        <TableCell>{item.nik || "-"}</TableCell>
                        <TableCell>{item.nip || "-"}</TableCell>
                        <TableCell>{item.niy || "-"}</TableCell>
                        <TableCell>
                          {validation?.isValid ? (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Valid
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="mr-1 h-3 w-3" />
                              Error
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {validation?.errors.map((error, i) => (
                              <div key={i} className="text-sm text-destructive">
                                {error}
                              </div>
                            ))}
                            {validation?.warnings.map((warning, i) => (
                              <div key={i} className="text-sm text-yellow-600">
                                {warning}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
