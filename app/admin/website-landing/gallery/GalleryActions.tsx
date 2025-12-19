"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { createColumns, Gallery } from "./columns";
import { Plus, Image as ImageIcon, X, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const gallerySchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  image: z.string().url("Harus berupa URL yang valid").min(1, "URL gambar wajib diisi"),
  album: z.string().optional(),
  order: z.number().int().min(0, "Urutan harus 0 atau lebih besar"),
});

type GalleryFormValues = z.infer<typeof gallerySchema>;

interface Album {
  id: string;
  name: string;
  description?: string;
  _count?: {
    galleries: number;
  };
}

interface MediaItem {
  id: string;
  url: string;
  title: string;
  type: string;
  description?: string;
}

export default function GalleryActions() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [reorderList, setReorderList] = useState<Gallery[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Confirmation modals
  const [confirmDelete, setConfirmDelete] = useState<{ type: "album" | "gallery"; id: string } | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [mediaSearch, setMediaSearch] = useState("");
  
  // Album form states
  const [albumFormName, setAlbumFormName] = useState("");
  const [albumFormDesc, setAlbumFormDesc] = useState("");
  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null);
  const [isAlbumLoading, setIsAlbumLoading] = useState(false);

  const form = useForm<GalleryFormValues>({
    resolver: zodResolver(gallerySchema),
    defaultValues: {
      title: "",
      image: "",
      album: "none",
      order: 0,
    },
  });

  useEffect(() => {
    fetchGalleries();
    fetchAlbums();
  }, []);

  // ============= Media Selection =============
  const fetchMedia = async (search: string = "") => {
    setIsLoadingMedia(true);
    try {
      const url = new URL("/api/admin/website-landing/media", window.location.origin);
      url.searchParams.append("type", "image");
      if (search) url.searchParams.append("search", search);

      const response = await fetch(url.toString());
      if (response.ok) {
        const data = await response.json();
        setMediaItems(data);
      }
    } catch (error) {
      console.error("Failed to fetch media:", error);
    } finally {
      setIsLoadingMedia(false);
    }
  };

  const handleOpenMediaModal = () => {
    fetchMedia();
    setShowMediaModal(true);
  };

  const handleSelectMedia = (media: MediaItem) => {
    form.setValue("image", media.url);
    setImagePreview(media.url);
    setShowMediaModal(false);
  };

  const handleMediaSearch = (value: string) => {
    setMediaSearch(value);
    fetchMedia(value);
  };

  // ============= Album Operations =============
  const fetchAlbums = async () => {
    try {
      const response = await fetch("/api/admin/website-landing/gallery/albums");
      if (response.ok) {
        const data = await response.json();
        setAlbums(data);
      }
    } catch (error) {
      console.error("Failed to fetch albums:", error);
    }
  };

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumFormName.trim()) return;

    setIsAlbumLoading(true);
    try {
      const url = editingAlbumId 
        ? `/api/admin/website-landing/gallery/albums/${editingAlbumId}`
        : "/api/admin/website-landing/gallery/albums";
      
      const method = editingAlbumId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: albumFormName,
          description: albumFormDesc,
        }),
      });

      if (response.ok) {
        await fetchAlbums();
        setAlbumFormName("");
        setAlbumFormDesc("");
        setEditingAlbumId(null);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save album");
      }
    } catch (error) {
      console.error("Failed to save album:", error);
      alert("Failed to save album");
    } finally {
      setIsAlbumLoading(false);
    }
  };

  const handleEditAlbum = (album: Album) => {
    setEditingAlbumId(album.id);
    setAlbumFormName(album.name);
    setAlbumFormDesc(album.description || "");
  };

  const handleDeleteAlbum = async (id: string) => {
    setConfirmDelete({ type: "album", id });
  };

  const confirmDeleteAlbum = async () => {
    if (!confirmDelete || confirmDelete.type !== "album") return;

    try {
      const response = await fetch(`/api/admin/website-landing/gallery/albums/${confirmDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchAlbums();
        setConfirmDelete(null);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete album");
        setConfirmDelete(null);
      }
    } catch (error) {
      console.error("Failed to delete album:", error);
      alert("Failed to delete album");
      setConfirmDelete(null);
    }
  };

  const resetAlbumForm = () => {
    setAlbumFormName("");
    setAlbumFormDesc("");
    setEditingAlbumId(null);
  };

  // ============= Gallery Operations =============
  const fetchGalleries = async () => {
    try {
      const response = await fetch("/api/admin/website-landing/gallery");
      if (response.ok) {
        const data = await response.json();
        setGalleries(data);
        setReorderList(data);
      }
    } catch (error) {
      console.error("Failed to fetch galleries:", error);
    }
  };

  const onSubmit = async (values: GalleryFormValues) => {
    setIsLoading(true);
    try {
      const url = editingId ? `/api/admin/website-landing/gallery/${editingId}` : "/api/admin/website-landing/gallery";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        await fetchGalleries();
        setIsOpen(false);
        form.reset();
        setEditingId(null);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save gallery item");
      }
    } catch (error) {
      console.error("Failed to save gallery item:", error);
      alert("Failed to save gallery item");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (gallery: Gallery) => {
    setEditingId(gallery.id);
    setImagePreview(gallery.image);
    form.reset({
      title: gallery.title,
      image: gallery.image,
      album: gallery.albumId || "none",
      order: gallery.order,
    });
    setIsOpen(true);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload via media API (server-side Cloudinary config)
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", file.name);
    formData.append("description", "");
    formData.append("folder", "landing_media");

    try {
      const response = await fetch("/api/admin/website-landing/media", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        form.setValue("image", data.url, { shouldValidate: true, shouldDirty: true });
        setImagePreview(data.url);
      } else {
        let errText = await response.text();
        try {
          const parsed = JSON.parse(errText);
          errText = parsed.error || errText;
        } catch {
          // leave as text
        }
        console.error("Media upload failed:", errText);
        alert(`Upload failed: ${errText || "Please check your Cloudinary/server configuration."}`);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmDelete({ type: "gallery", id });
  };

  const confirmDeleteGallery = async () => {
    if (!confirmDelete || confirmDelete.type !== "gallery") return;

    setBusyId(confirmDelete.id);
    try {
      const response = await fetch(`/api/admin/website-landing/gallery/${confirmDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchGalleries();
        setConfirmDelete(null);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete gallery item");
        setConfirmDelete(null);
      }
    } catch (error) {
      console.error("Failed to delete gallery item:", error);
      alert("Failed to delete gallery item");
      setConfirmDelete(null);
    } finally {
      setBusyId(null);
    }
  };

  const handleOpenDialog = () => {
    setEditingId(null);
    setImagePreview("");
    setIsUploading(false);
    // Set default order to next available number
    const maxOrder = galleries.length > 0 ? Math.max(...galleries.map(g => g.order)) : 0;
    form.reset({
      title: "",
      image: "",
      album: "none",
      order: maxOrder + 1,
    });
    setIsOpen(true);
  };

  const columns = createColumns(handleEdit, handleDelete, busyId, { draggable: true, onPreview: setPreviewImage });

  const saveOrder = async (list: Gallery[]) => {
    try {
      const response = await fetch("/api/admin/website-landing/gallery/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: list.map((g) => g.id) }),
      });
      if (response.ok) {
        setGalleries(list);
      } else {
        const err = await response.json();
        alert(err.error || "Failed to save order");
      }
    } catch (error) {
      console.error("Failed to save order:", error);
      alert("Failed to save order");
    } finally {
      // finished
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Galeri</h2>
          <p className="text-muted-foreground">
            Kelola galeri foto dan gambar
          </p>
        </div>
        <Button onClick={handleOpenDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Gambar Baru
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={reorderList}
        searchKey="title"
        searchPlaceholder="Cari gambar..."
        enableRowOrdering
        getRowId={(row) => row.id}
        onReorder={(list) => {
          const withOrder = list.map((item, idx) => ({ ...item, order: idx + 1 }));
          setReorderList(withOrder);
          saveOrder(withOrder);
        }}
      />

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setEditingId(null);
            setImagePreview("");
            setIsUploading(false);
            form.reset({
              title: "",
              image: "",
              album: "none",
              order: form.getValues("order") || 0,
            });
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Sunting Item Galeri" : "Tambah Gambar Baru"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Perbarui detail item galeri di bawah."
                : "Tambahkan gambar baru ke galeri."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Gallery Item Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                    <FormLabel>Judul</FormLabel>
                    <FormControl>
                      <Input placeholder="Judul gambar atau keterangan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gambar</FormLabel>
                    <div className="space-y-3">
                      {/* Image Preview */}
                      {imagePreview && (
                        <div className="relative w-full h-40 bg-muted rounded-lg overflow-hidden border border-card">
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview("");
                              field.onChange("");
                            }}
                            className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1 rounded-full hover:bg-destructive-foreground"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Upload Input */}
                      <div className="flex gap-2">
                        <label className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full cursor-pointer"
                            onClick={(e) => {
                              e.preventDefault();
                              (e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement)?.click();
                            }}
                          >
                            <ImageIcon className="mr-2 h-4 w-4" />
                            Unggah dari PC
                          </Button>
                        </label>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleOpenMediaModal}
                          className="flex-1 whitespace-nowrap"
                        >
                          <ImageIcon className="mr-2 h-4 w-4" />
                          Dari Perpustakaan Media
                        </Button>
                      </div>
                      {/* Helper text */}
                      <p className="text-xs text-muted-foreground">
                        Jika Anda mengunggah dari PC atau memilih dari Perpustakaan, URL akan diisi secara otomatis.
                      </p>

                      {/* Manual URL Input */}
                      <FormControl>
                        <Input
                          placeholder="Atau tempel URL gambar"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                        />
                      </FormControl>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => {
                            const url = field.value?.trim();
                            if (!url) return;
                            try {
                              // Basic URL validity check before previewing
                              new URL(url);
                              setImagePreview(url);
                            } catch {
                              alert("Masukkan URL gambar yang valid untuk melihat pratinjau.");
                            }
                          }}
                          className="h-8 px-3 text-xs"
                        >
                          Pratinjau URL
                        </Button>
                        {isUploading && (
                          <span className="text-xs text-muted-foreground self-center">Uploading to Cloudinary...</span>
                        )}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="album"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Album (Opsional)</FormLabel>
                    <Select value={field.value || "none"} onValueChange={(val) => field.onChange(val === "none" ? null : val)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih album atau biarkan kosong" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Tanpa Album</SelectItem>
                        {albums.map((album) => (
                          <SelectItem key={album.id} value={album.id}>
                            {album.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Organisir foto berdasarkan album
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Urutan Tampilan</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Angka lebih kecil tampil terlebih dahulu
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false);
                    setImagePreview("");
                  }}
                  disabled={isLoading}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isLoading ||
                    isUploading ||
                    !form.getValues("image")
                  }
                >
                  {isLoading
                    ? "Menyimpan..."
                    : editingId
                      ? "Perbarui Gambar"
                      : "Tambah Gambar"}
                </Button>
              </DialogFooter>
              </form>
            </Form>

            {/* Album Management Section */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Manajemen Album</h3>

              {/* Create/Edit Album Form */}
              <div className="bg-muted p-4 rounded-lg mb-4">
                <form onSubmit={handleCreateAlbum} className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Nama Album</label>
                    <Input
                      value={albumFormName}
                      onChange={(e) => setAlbumFormName(e.target.value)}
                      placeholder="Contoh: Acara Sekolah"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Deskripsi (Opsional)</label>
                    <Input
                      value={albumFormDesc}
                      onChange={(e) => setAlbumFormDesc(e.target.value)}
                      placeholder="Deskripsi singkat album ini"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={isAlbumLoading || !albumFormName.trim()}
                      className="flex-1"
                    >
                      {isAlbumLoading ? "Menyimpan..." : editingAlbumId ? "Perbarui Album" : "Buat Album"}
                    </Button>
                    {editingAlbumId && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetAlbumForm}
                      >
                        Batal
                      </Button>
                    )}
                  </div>
                </form>
              </div>

              {/* Albums List */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Album yang Ada</h4>
                {albums.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Belum ada album. Buat satu di atas.</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {albums.map((album) => (
                      <div key={album.id} className="flex items-center justify-between bg-card border border-card rounded p-3">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{album.name}</p>
                          {album.description && <p className="text-xs text-muted-foreground">{album.description}</p>}
                          {album._count && <p className="text-xs text-muted-foreground">{album._count.galleries} foto</p>}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditAlbum(album)}
                          >
                            Sunting
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteAlbum(album.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Media Selection Modal */}
      <Dialog open={showMediaModal} onOpenChange={setShowMediaModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pilih dari Perpustakaan Media</DialogTitle>
            <DialogDescription>
              Pilih gambar dari perpustakaan media Anda
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search Input */}
            <Input
              placeholder="Cari media..."
              value={mediaSearch}
              onChange={(e) => handleMediaSearch(e.target.value)}
            />

            {/* Media Grid */}
            {isLoadingMedia ? (
              <div className="flex justify-center py-8">
                <div className="text-muted-foreground">Memuat media...</div>
              </div>
            ) : mediaItems.length === 0 ? (
              <div className="flex justify-center py-8">
                <div className="text-muted-foreground">Tidak ada media ditemukan</div>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                {mediaItems.map((media) => (
                  <button
                    key={media.id}
                    type="button"
                    onClick={() => handleSelectMedia(media)}
                    className="relative group overflow-hidden rounded-lg border-2 border-card hover:border-primary transition-all"
                  >
                    <div className="aspect-square bg-muted relative">
                      <Image
                        src={media.url}
                        alt={media.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-primary-foreground text-sm font-medium">Pilih</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-muted/70 text-primary-foreground text-xs p-2 truncate">
                      {media.title}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="w-full flex justify-center">
              <Image
                src={previewImage}
                alt="Preview"
                width={800}
                height={600}
                className="max-w-full max-h-[60vh] object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modals */}
      <ConfirmDialog
        open={confirmDelete?.type === "album" || false}
        title="Delete Album"
        description="Are you sure you want to delete this album? This action cannot be undone."
        confirmText="Delete Album"
        onConfirm={confirmDeleteAlbum}
        onCancel={() => setConfirmDelete(null)}
      />
      <ConfirmDialog
        open={confirmDelete?.type === "gallery" || false}
        title="Delete Gallery Item"
        description="Are you sure you want to delete this gallery item? This action cannot be undone."
        confirmText="Delete Item"
        onConfirm={confirmDeleteGallery}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
