"use client";

import React, { useRef, useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function BackupRestorePage() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const downloadBackup = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings/backup-restore");
      if (!res.ok) throw new Error("Failed to fetch backup");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sekolix-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMessage("Backup downloaded");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessage(msg || "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setMessage("Pilih file backup (.json) terlebih dahulu");
      return;
    }
    // Ask for confirmation before restore
    setShowConfirm(true);
  };

  const [showConfirm, setShowConfirm] = useState(false);

  const doRestore = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setShowConfirm(false);
    setLoading(true);
    setMessage(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/settings/backup-restore", {
        method: "POST",
        body: form
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Restore failed");
      setMessage("Restore completed. Summary: " + JSON.stringify(data));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessage(msg || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Backup & Restore</h1>
          <p className="text-sm text-muted-foreground">
            Export database snapshots and restore from JSON backups.
          </p>
        </div>
      </header>

      <section className="p-4 bg-white border rounded-md">
        <h2 className="font-medium">Download Backup</h2>
        <p className="text-sm text-muted-foreground">Download a JSON export of core tables.</p>
        <div className="mt-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={downloadBackup}
            disabled={loading}
          >
            {loading ? "Processing..." : "Download Backup"}
          </button>
        </div>
      </section>

      <section className="p-4 bg-white border rounded-md">
        <h2 className="font-medium">Restore from Backup</h2>
        <p className="text-sm text-muted-foreground">
          Upload a JSON backup created by this tool to import data.
        </p>
        <form onSubmit={handleRestore} className="mt-4 flex items-center gap-3">
          <input ref={fileRef} type="file" accept="application/json" />
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            disabled={loading}
          >
            {loading ? "Restoring..." : "Restore"}
          </button>
        </form>
      </section>

      {message && (
        <div className="p-3 bg-gray-50 border rounded-md">
          <pre className="whitespace-pre-wrap text-sm">{message}</pre>
        </div>
      )}

      <ConfirmDialog
        open={showConfirm}
        title="Restore Backup"
        description="Proses restore akan memasukkan data ke database. Lanjutkan?"
        confirmText="Restore"
        cancelText="Batal"
        isDestructive={false}
        onConfirm={doRestore}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
