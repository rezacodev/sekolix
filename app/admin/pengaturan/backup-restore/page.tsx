"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { Download, Upload, DatabaseBackup, AlertTriangle, Loader2, FileJson } from "lucide-react";

type RestoreSummary = Record<string, { created?: number; upserted?: number; skipped?: string; error?: string }>;

export default function BackupRestorePage() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [restoreSummary, setRestoreSummary] = useState<RestoreSummary | null>(null);

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch("/api/admin/pengaturan/backup-restore");
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sekolix-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Backup berhasil diunduh");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengunduh backup");
    } finally {
      setDownloading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSelectedFile(e.target.files?.[0] ?? null);
    setRestoreSummary(null);
  }

  function handleRestoreClick(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) {
      toast.warning("Pilih file backup (.json) terlebih dahulu");
      return;
    }
    setShowConfirm(true);
  }

  async function doRestore() {
    if (!selectedFile) return;
    setShowConfirm(false);
    setRestoring(true);
    setRestoreSummary(null);
    try {
      const form = new FormData();
      form.append("file", selectedFile);
      const res = await fetch("/api/admin/pengaturan/backup-restore", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? data.message ?? "Restore gagal");
      setRestoreSummary(data.summary ?? {});
      toast.success("Restore berhasil diselesaikan");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal melakukan restore");
    } finally {
      setRestoring(false);
    }
  }

  const loading = downloading || restoring;

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <DatabaseBackup className="w-6 h-6" />
          Backup &amp; Restore
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ekspor snapshot database dan pulihkan data dari file backup JSON.
        </p>
      </div>

      {/* Download Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="w-4 h-4" />
            Unduh Backup
          </CardTitle>
          <CardDescription>
            Ekspor data inti (pengguna, tahun ajaran, program, galeri, identitas sekolah, artikel, dll.) ke dalam satu file JSON.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleDownload} disabled={loading}>
            {downloading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mengunduh...</>
            ) : (
              <><Download className="w-4 h-4 mr-2" /> Unduh Backup</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Restore */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Restore dari Backup
          </CardTitle>
          <CardDescription>
            Upload file JSON backup yang dibuat oleh tools ini untuk mengimpor data kembali ke database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-3 rounded-lg border-2 border-dashed bg-muted/30 mb-4">
            <FileJson className="w-5 h-5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              {selectedFile ? (
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada file dipilih</p>
              )}
              {selectedFile && (
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => fileRef.current?.click()}
            >
              Pilih File
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg border border-amber-200 bg-amber-50 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              Proses restore akan memasukkan data ke database menggunakan mode <em>skip duplicates</em>. Data yang sudah ada tidak akan ditimpa. Pastikan file backup valid sebelum melanjutkan.
            </p>
          </div>

          <form onSubmit={handleRestoreClick}>
            <Button
              type="submit"
              variant="secondary"
              disabled={loading || !selectedFile}
            >
              {restoring ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memulihkan...</>
              ) : (
                <><Upload className="w-4 h-4 mr-2" /> Restore</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Restore Summary */}
      {restoreSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ringkasan Restore</CardTitle>
            <CardDescription>Hasil proses restore per tabel data.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Tabel</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-right p-3 font-medium">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(restoreSummary).map(([key, val], i) => (
                    <tr key={key} className={i % 2 === 1 ? "bg-muted/20" : ""}>
                      <td className="p-3 font-mono text-xs">{key}</td>
                      <td className="p-3">
                        {val.error ? (
                          <span className="text-destructive text-xs">Error: {val.error}</span>
                        ) : val.skipped ? (
                          <span className="text-muted-foreground text-xs">Dilewati</span>
                        ) : (
                          <span className="text-green-600 text-xs">Berhasil</span>
                        )}
                      </td>
                      <td className="p-3 text-right text-xs text-muted-foreground">
                        {val.created != null && `${val.created} dibuat`}
                        {val.upserted != null && `${val.upserted} diperbarui`}
                        {val.skipped && "—"}
                        {val.error && "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={showConfirm}
        title="Konfirmasi Restore"
        description={`File "${selectedFile?.name}" akan diimpor ke database. Proses ini tidak dapat dibatalkan. Lanjutkan?`}
        confirmText="Ya, Restore"
        cancelText="Batal"
        isDestructive={false}
        onConfirm={doRestore}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
