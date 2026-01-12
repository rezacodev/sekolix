"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { Trash2, Upload, ExternalLink, Copy, Eye } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

type MediaItem = {
  id: string;
  title: string | null;
  description?: string | null;
  url: string;
  publicId: string;
  type: string;
  folder?: string | null;
  size?: number | null;
  width?: number | null;
  height?: number | null;
  format?: string | null;
  createdAt: string | Date;
};

const formatBytes = (bytes?: number | null) => {
  if (!bytes || bytes <= 0) return "-";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[exponent]}`;
};

export default function MediaActions() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadForm, setUploadForm] = useState<{ name: string; description: string }>({
    name: "",
    description: ""
  });

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async (query: string = "") => {
    try {
      setIsLoading(true);
      const url = new URL("/api/admin/landing-website/media", window.location.origin);
      if (query) url.searchParams.set("search", query);
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setMediaItems(data);
      }
    } catch (err) {
      console.error("Error fetching media:", err);
      setError("Gagal memuat media. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setConfirmDelete(id);
  };

  const confirmDeleteMedia = async () => {
    if (!confirmDelete) return;
    try {
      const res = await fetch(`/api/admin/landing-website/media/${confirmDelete}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setError(null);
        fetchMedia(search);
      } else {
        const data = await res.json();
        setError(data?.error || "Gagal menghapus media");
      }
    } catch (err) {
      console.error("Error deleting media:", err);
      setError("Gagal menghapus media. Silakan coba lagi.");
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setError(null);
    } catch {
      setError("Gagal menyalin URL");
    }
  };

  const triggerUpload = () => {
    setError(null);
    setShowUploadModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi tipe file - hanya gambar
    if (!file.type.startsWith("image/")) {
      setError("Hanya file gambar yang diizinkan");
      e.target.value = "";
      return;
    }

    // Validasi ukuran file - maksimal 1 MB
    const maxSize = 1 * 1024 * 1024; // 1 MB dalam bytes
    if (file.size > maxSize) {
      setError("Ukuran file maksimal 1 MB");
      e.target.value = "";
      return;
    }

    setError(null);
    setSelectedFile(file);
    setUploadForm({ name: file.name, description: "" });
    e.target.value = "";
  };

  const uploadFile = async () => {
    if (!selectedFile) return;
    try {
      setIsUploading(true);
      setError(null);
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("title", uploadForm.name || selectedFile.name);
      if (uploadForm.description) formData.append("description", uploadForm.description);

      const res = await fetch("/api/admin/landing-website/media", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err?.error || "Upload gagal");
        return;
      }

      await fetchMedia(search);
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadForm({ name: "", description: "" });
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Upload gagal. Periksa konfigurasi Cloudinary/server.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <AdminPageHeader
            title="Perpustakaan Media"
            description="Kelola gambar dari Cloudinary."
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex gap-2">
            <Input
              placeholder="Cari judul atau deskripsi..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") fetchMedia(e.currentTarget.value);
              }}
            />
            <Button onClick={() => fetchMedia(search)}>Cari</Button>
          </div>
          <div className="flex gap-2">
            <Button onClick={triggerUpload} disabled={isUploading}>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Memuat media...</div>
      ) : mediaItems.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">Belum ada media.</div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {mediaItems.map(item => {
            const isImage = item.type === "image";
            return (
              <div
                key={item.id}
                className="group rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden"
              >
                <div className="relative h-56 bg-muted">
                  {isImage ? (
                    <Image
                      src={item.url}
                      alt={item.title || "Media"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
                      {item.type?.toUpperCase()}
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button size="sm" variant="secondary" onClick={() => setPreviewItem(item)}>
                      <Eye className="mr-1.5 h-4 w-4" /> Pratinjau
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleCopy(item.url)}>
                      <Copy className="mr-1.5 h-4 w-4" /> Copy
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="mr-1.5 h-4 w-4" /> Hapus
                    </Button>
                  </div>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <p className="text-sm font-medium line-clamp-1" title={item.title || undefined}>
                    {item.title || "Tanpa judul"}
                  </p>
                  <Badge variant="secondary" className="capitalize">
                    {item.type}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Hapus Media"
        description="Media akan dihapus permanen dari database dan Cloudinary. Lanjutkan?"
        confirmText="Hapus"
        onConfirm={confirmDeleteMedia}
        onCancel={() => setConfirmDelete(null)}
      />

      <Dialog
        open={showUploadModal}
        onOpenChange={open => {
          if (!open) {
            setShowUploadModal(false);
            setSelectedFile(null);
            setUploadForm({ name: "", description: "" });
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Unggah Media</DialogTitle>
            <DialogDescription>Pilih file gambar (maksimal 1 MB)</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">File</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              {selectedFile && (
                <p className="text-xs text-muted-foreground mt-1">
                  File dipilih: {selectedFile.name}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Nama</label>
              <Input
                placeholder="Nama file"
                value={uploadForm.name}
                onChange={e => setUploadForm(f => ({ ...f, name: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Deskripsi (opsional)</label>
              <Textarea
                placeholder="Deskripsi file"
                value={uploadForm.description}
                onChange={e => setUploadForm(f => ({ ...f, description: e.target.value }))}
                className="mt-1"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setShowUploadModal(false)}>
                Batal
              </Button>
              <Button onClick={uploadFile} disabled={!selectedFile || isUploading}>
                {isUploading ? "Mengunggah..." : "Upload"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewItem} onOpenChange={open => !open && setPreviewItem(null)}>
        <DialogContent className="sm:max-w-xl">
          {previewItem && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>{previewItem.title || "Tanpa judul"}</DialogTitle>
                <DialogDescription>Detail media</DialogDescription>
              </DialogHeader>
              <div className="rounded-md overflow-hidden border bg-muted h-64 flex items-center justify-center">
                {previewItem.type === "image" ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={previewItem.url}
                      alt={previewItem.title || "Media"}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    Pratinjau tidak tersedia untuk tipe ini.
                  </div>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-[100px_auto_1fr] gap-x-3 gap-y-2">
                  <span className="text-muted-foreground">Nama</span>
                  <span className="text-muted-foreground">:</span>
                  <span className="font-medium">{previewItem.title || "Tanpa judul"}</span>

                  <span className="text-muted-foreground">Tipe</span>
                  <span className="text-muted-foreground">:</span>
                  <span className="font-medium capitalize">{previewItem.type}</span>

                  <span className="text-muted-foreground">Ukuran</span>
                  <span className="text-muted-foreground">:</span>
                  <span className="font-medium">{formatBytes(previewItem.size)}</span>

                  <span className="text-muted-foreground">Tanggal</span>
                  <span className="text-muted-foreground">:</span>
                  <span className="font-medium">{formatDate(previewItem.createdAt)}</span>

                  <span className="text-muted-foreground">URL</span>
                  <span className="text-muted-foreground">:</span>
                  <a
                    href={previewItem.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline break-all"
                  >
                    {previewItem.url}
                  </a>

                  {previewItem.description && (
                    <>
                      <span className="text-muted-foreground">Deskripsi</span>
                      <span className="text-muted-foreground">:</span>
                      <span className="font-medium">{previewItem.description}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" onClick={() => handleCopy(previewItem.url)}>
                  <Copy className="mr-1.5 h-4 w-4" /> Salin URL
                </Button>
                <Button variant="outline" asChild>
                  <a href={previewItem.url} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-1.5 h-4 w-4" /> Buka
                  </a>
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(previewItem.id)}>
                  <Trash2 className="mr-1.5 h-4 w-4" /> Hapus
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
