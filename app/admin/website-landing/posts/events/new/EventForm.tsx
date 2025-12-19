"use client";

import Image from "next/image";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { MediaPickerDialog, MediaItem } from "@/components/media/media-picker-dialog";
import { toast } from "sonner";

const eventSchema = z
  .object({
    title: z.string().min(1, "Judul wajib diisi"),
    slug: z.string().min(1, "Slug wajib diisi"),
    description: z.string().min(1, "Deskripsi wajib diisi"),
    startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
    endDate: z.string().min(1, "Tanggal berakhir wajib diisi"),
    location: z.string().min(1, "Lokasi wajib diisi"),
    isPublished: z.boolean(),
    image: z.string().nullable().optional(),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "Tanggal berakhir harus setelah tanggal mulai",
    path: ["endDate"],
  });

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  initialData?: Partial<EventFormData> & { id?: string };
}

export function EventForm({ initialData }: EventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [description, setDescription] = useState(initialData?.description || "");
  const [coverImage, setCoverImage] = useState<string | null>(initialData?.image || null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<"cover" | "content">("cover");
  const [contentResolver, setContentResolver] = useState<((url?: string | null) => void) | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      startDate: initialData?.startDate
        ? new Date(initialData.startDate).toISOString().slice(0, 16)
        : "",
      endDate: initialData?.endDate
        ? new Date(initialData.endDate).toISOString().slice(0, 16)
        : "",
      location: initialData?.location || "",
      isPublished: initialData?.isPublished || false,
      image: initialData?.image || null,
    },
  });

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .trim();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setValue("title", newTitle);
    if (!initialData?.id) {
      setValue("slug", generateSlug(newTitle));
    }
  };

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    try {
      const url = initialData?.id
        ? `/api/admin/website-landing/events/${initialData.id}`
        : "/api/admin/website-landing/events";
      const method = initialData?.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, description, image: coverImage }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.message || "Gagal menyimpan acara");
        return;
      }

      toast.success(initialData?.id ? "Acara berhasil diperbarui" : "Acara berhasil dibuat");
      router.push("/admin/website-landing/posts/events");
      router.refresh();
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("Terjadi kesalahan saat menyimpan acara");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPickerForContent = () =>
    new Promise<string | null | undefined>((resolve) => {
      setPickerMode("content");
      setMediaPickerOpen(true);
      setContentResolver(() => resolve);
    });

  const handleMediaSelected = (item: MediaItem) => {
    if (pickerMode === "cover") {
      setCoverImage(item.url);
      setValue("image", item.url);
    } else {
      contentResolver?.(item.url);
      setContentResolver(null);
    }
    setMediaPickerOpen(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Detail Acara</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul *</Label>
            <Input
              id="title"
              {...register("title")}
              onChange={handleTitleChange}
              placeholder="Masukkan judul acara"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              {...register("slug")}
              placeholder="event-url-slug"
            />
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Tanggal & Waktu Mulai *</Label>
              <Input
                id="startDate"
                type="datetime-local"
                {...register("startDate")}
              />
              {errors.startDate && (
                <p className="text-sm text-destructive">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Tanggal & Waktu Berakhir *</Label>
              <Input
                id="endDate"
                type="datetime-local"
                {...register("endDate")}
              />
              {errors.endDate && (
                <p className="text-sm text-destructive">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Lokasi *</Label>
            <Input
              id="location"
              {...register("location")}
              placeholder="Lokasi acara"
            />
            {errors.location && (
              <p className="text-sm text-destructive">{errors.location.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="isPublished">Status *</Label>
            <Select
              defaultValue={watch("isPublished") ? "true" : "false"}
              onValueChange={(value) =>
                setValue("isPublished", value === "true")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Dipublikasikan</SelectItem>
                <SelectItem value="false">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Deskripsi *</Label>
            <RichTextEditor
              content={description}
              onChange={(newDescription: string) => {
                setDescription(newDescription);
                setValue("description", newDescription);
              }}
              placeholder="Tulis deskripsi acara..."
              onImagePick={openPickerForContent}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Cover Image</Label>
            <input type="hidden" value={coverImage || ""} {...register("image")}
              readOnly
            />
            {coverImage ? (
              <div className="relative h-40 w-full overflow-hidden rounded-md border bg-muted">
                <Image src={coverImage} alt="Cover" fill className="object-cover" />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute right-2 top-2"
                  onClick={() => {
                    setCoverImage(null);
                    setValue("image", null);
                  }}
                >
                  Hapus
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Belum ada cover.</p>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPickerMode("cover");
                  setMediaPickerOpen(true);
                }}
              >
                Pilih dari media
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setCoverImage(null);
                  setValue("image", null);
                }}
                disabled={!coverImage}
              >
                Kosongkan
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Cover akan tampil di daftar dan detail event.</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Link href="/admin/website-landing/posts/events">
          <Button type="button" variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Batal
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting
            ? "Menyimpan..."
            : initialData?.id
            ? "Perbarui Acara"
            : "Buat Acara"}
        </Button>
      </div>
      <MediaPickerDialog
        open={mediaPickerOpen}
        onOpenChange={(open) => {
          if (!open && pickerMode === "content") {
            contentResolver?.(null);
            setContentResolver(null);
          }
          setMediaPickerOpen(open);
        }}
        onSelect={handleMediaSelected}
        selectedId={undefined}
        title={pickerMode === "cover" ? "Pilih cover" : "Sisipkan gambar ke konten"}
      />
    </form>
  );
}
