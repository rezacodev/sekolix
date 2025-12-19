"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ImageIcon, Loader2, Search, Upload } from "lucide-react";

export type MediaItem = {
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

type MediaPickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (item: MediaItem) => void;
  selectedId?: string | null;
  title?: string;
};

const formatBytes = (bytes?: number | null) => {
  if (!bytes || bytes <= 0) return "-";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[exponent]}`;
};

export function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
  selectedId,
  title = "Pilih gambar",
}: MediaPickerDialogProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(selectedId || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadForm, setUploadForm] = useState<{ name: string; description: string }>({ name: "", description: "" });

  useEffect(() => {
    if (open) {
      fetchMedia();
    }
  }, [open]);

  useEffect(() => {
    if (selectedId !== undefined) {
      setSelectedMediaId(selectedId || null);
    }
  }, [selectedId]);

  const fetchMedia = async (query: string = "") => {
    try {
      setIsLoading(true);
      const url = new URL("/api/admin/website-landing/media", window.location.origin);
      if (query) url.searchParams.set("search", query);
      const res = await fetch(url.toString());
      if (res.ok) {
        const data: MediaItem[] = await res.json();
        const imagesOnly = data.filter((item) => item.type === "image");
        setMediaItems(imagesOnly);
      } else {
        setError("Gagal memuat media.");
      }
    } catch (err) {
      console.error("Error fetching media:", err);
      setError("Gagal memuat media. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Hanya file gambar yang diizinkan");
      e.target.value = "";
      return;
    }

    const maxSize = 1 * 1024 * 1024;
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

      const res = await fetch("/api/admin/website-landing/media", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err?.error || "Upload gagal");
        return;
      }

      const newMedia: MediaItem = await res.json();
      await fetchMedia(search);
      setSelectedMediaId(newMedia.id);
      onSelect(newMedia);
      onOpenChange(false);
      setSelectedFile(null);
      setUploadForm({ name: "", description: "" });
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Upload gagal. Periksa konfigurasi server.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelect = () => {
    const media = mediaItems.find((item) => item.id === selectedMediaId);
    if (media) {
      onSelect(media);
      onOpenChange(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setError(null);
          setSelectedFile(null);
          setUploadForm({ name: "", description: "" });
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Pilih gambar dari perpustakaan atau unggah baru (maks 1 MB).</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-2 w-full md:w-auto">
              <Input
                placeholder="Cari judul atau deskripsi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") fetchMedia(e.currentTarget.value);
                }}
              />
              <Button variant="outline" onClick={() => fetchMedia(search)}>
                <Search className="mr-2 h-4 w-4" /> Cari
              </Button>
            </div>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                <Upload className="mr-2 h-4 w-4" /> Upload
              </Button>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat media...
            </div>
          ) : mediaItems.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">Belum ada gambar.</div>
          ) : (
            <ScrollArea className="h-80 rounded-md border p-3">
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                {mediaItems.map((item) => {
                  const isSelected = item.id === selectedMediaId;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setSelectedMediaId(item.id)}
                      className={`group overflow-hidden rounded-lg border text-left transition focus:outline-none ${
                        isSelected ? "ring-2 ring-primary" : "hover:border-primary/60"
                      }`}
                    >
                      <div className="relative h-44 w-full bg-muted">
                        {item.type === "image" ? (
                          <Image
                            src={item.url}
                            alt={item.title || "Media"}
                            fill
                            className="object-cover"
                            priority={false}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        )}
                        <div className="absolute left-2 top-2">
                          <Badge variant="secondary" className="capitalize">
                            {item.format || item.type}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-3 space-y-1">
                        <p className="text-sm font-medium line-clamp-1" title={item.title || undefined}>
                          {item.title || "Tanpa judul"}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{item.description || "Tanpa deskripsi"}</p>
                        <p className="text-xs text-muted-foreground">{formatBytes(item.size)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          )}

          {selectedFile && (
            <div className="rounded-md border p-3 space-y-3">
              <p className="text-sm font-medium">Siap diupload: {selectedFile.name}</p>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Nama</label>
                  <Input
                    value={uploadForm.name}
                    onChange={(e) => setUploadForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Nama file"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Deskripsi (opsional)</label>
                  <Textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Deskripsi singkat"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setSelectedFile(null); setUploadForm({ name: "", description: "" }); }}>
                  Batal
                </Button>
                <Button onClick={uploadFile} disabled={isUploading}>
                  {isUploading ? "Mengunggah..." : "Upload & pilih"}
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Tutup
            </Button>
            <Button onClick={handleSelect} disabled={!selectedMediaId}>
              Pilih gambar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
