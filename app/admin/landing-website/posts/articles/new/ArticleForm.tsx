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
  SelectValue
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { MediaPickerDialog, MediaItem } from "@/components/media/media-picker-dialog";
import { toast } from "sonner";

const articleSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  slug: z.string().min(1, "Slug wajib diisi"),
  excerpt: z.string().min(1, "Ringkasan wajib diisi"),
  content: z.string().min(1, "Konten wajib diisi"),
  category: z.enum(["Academic", "Achievement", "Announcement", "Other"]),
  isPublished: z.boolean(),
  image: z.string().nullable().optional()
});

type ArticleFormData = z.infer<typeof articleSchema>;

interface ArticleFormProps {
  initialData?: Partial<ArticleFormData> & { id?: string };
}

export function ArticleForm({ initialData }: ArticleFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState(initialData?.content || "");
  const [coverImage, setCoverImage] = useState<string | null>(initialData?.image || null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<"cover" | "content">("cover");
  const [contentResolver, setContentResolver] = useState<((url?: string | null) => void) | null>(
    null
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      excerpt: initialData?.excerpt || "",
      content: initialData?.content || "",
      category: initialData?.category || "Academic",
      isPublished: initialData?.isPublished || false,
      image: initialData?.image || null
    }
  });

  // Auto-generate slug from title
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

  const onSubmit = async (data: ArticleFormData) => {
    setIsSubmitting(true);
    try {
      const url = initialData?.id
        ? `/api/admin/landing-website/articles/${initialData.id}`
        : "/api/admin/landing-website/articles";
      const method = initialData?.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, content, image: coverImage })
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.message || "Gagal menyimpan artikel");
        return;
      }

      toast.success(initialData?.id ? "Artikel berhasil diperbarui" : "Artikel berhasil dibuat");
      router.push("/admin/landing-website/posts/articles");
      router.refresh();
    } catch (error) {
      console.error("Error saving article:", error);
      toast.error("Terjadi kesalahan saat menyimpan artikel");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPickerForContent = () =>
    new Promise<string | null | undefined>(resolve => {
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
          <CardTitle>Detail Artikel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul *</Label>
            <Input
              id="title"
              {...register("title")}
              onChange={handleTitleChange}
              placeholder="Masukkan judul artikel"
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input id="slug" {...register("slug")} placeholder="article-url-slug" />
            {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Kategori *</Label>
              <Select
                defaultValue={watch("category")}
                onValueChange={value =>
                  setValue(
                    "category",
                    value as "Academic" | "Achievement" | "Announcement" | "Other"
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Academic">Akademik</SelectItem>
                  <SelectItem value="Achievement">Prestasi</SelectItem>
                  <SelectItem value="Announcement">Pengumuman</SelectItem>
                  <SelectItem value="Other">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="isPublished">Status *</Label>
              <Select
                defaultValue={watch("isPublished") ? "true" : "false"}
                onValueChange={value => setValue("isPublished", value === "true")}
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Ringkasan *</Label>
            <Input id="excerpt" {...register("excerpt")} placeholder="Deskripsi singkat" />
            {errors.excerpt && <p className="text-sm text-destructive">{errors.excerpt.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Cover Image</Label>
            <input type="hidden" value={coverImage || ""} {...register("image")} readOnly />
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
            <p className="text-xs text-muted-foreground">
              Gambar akan tampil sebagai cover pada detail artikel.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Konten *</Label>
            <RichTextEditor
              content={content}
              onChange={(newContent: string) => {
                setContent(newContent);
                setValue("content", newContent);
              }}
              placeholder="Tulis konten artikel Anda..."
              onImagePick={openPickerForContent}
            />
            {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Link href="/admin/landing-website/posts/articles">
          <Button type="button" variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4 text-current" />
            Batal
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="mr-2 h-4 w-4 text-current" />
          {isSubmitting ? "Menyimpan..." : initialData?.id ? "Perbarui Artikel" : "Buat Artikel"}
        </Button>
      </div>

      <MediaPickerDialog
        open={mediaPickerOpen}
        onOpenChange={open => {
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
