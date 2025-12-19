"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

const pageSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  slug: z.string().min(1, "Slug wajib diisi"),
  description: z.string().optional(),
  content: z.string().min(1, "Konten wajib diisi"),
  isPublished: z.boolean(),
});

type PageFormData = z.infer<typeof pageSchema>;

interface PageFormProps {
  initialData?: Partial<PageFormData> & { id?: string };
}

export function PageForm({ initialData }: PageFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState(initialData?.content || "");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PageFormData>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      content: initialData?.content || "",
      isPublished: initialData?.isPublished ?? false,
    },
  });

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setValue("title", newTitle);
    
    if (!initialData?.id) {
      const slug = newTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setValue("slug", slug);
    }
  };

  const onSubmit = async (data: PageFormData) => {
    setIsSubmitting(true);
    try {
      const url = initialData?.id
        ? `/api/admin/website-landing/pages/${initialData.id}`
        : "/api/admin/website-landing/pages";

      const response = await fetch(url, {
        method: initialData?.id ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          content,
        }),
      });

      if (response.ok) {
        toast.success(initialData?.id ? "Halaman berhasil diperbarui" : "Halaman berhasil dibuat");
        router.push("/admin/website-landing/pages");
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.error || error.message || "Gagal menyimpan halaman");
      }
    } catch (error) {
      console.error("Error saving page:", error);
      toast.error("Terjadi kesalahan saat menyimpan halaman");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link href="/admin/website-landing/pages">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          {initialData?.id ? "Sunting Halaman" : "Halaman Baru"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Judul *</Label>
            <Input
              id="title"
              {...register("title")}
              onChange={handleTitleChange}
              placeholder="Tentang Kami, Hubungi Kami, dll."
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">/</span>
              <Input
                id="slug"
                {...register("slug")}
                placeholder="tentang-kami, hubungi-kami, dll."
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Versi ramah-URL dari judul (dibuat secara otomatis)
            </p>
            {errors.slug && (
              <p className="text-sm text-red-500">{errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Input
              id="description"
              {...register("description")}
              placeholder="Deskripsi singkat untuk SEO (opsional)"
            />
            <p className="text-sm text-muted-foreground">
              Ini akan digunakan sebagai meta deskripsi untuk SEO
            </p>
          </div>

          <div className="space-y-2">
            <Label>Konten *</Label>
            <RichTextEditor
              content={content}
              onChange={(value: string) => {
                setContent(value);
                setValue("content", value);
              }}
              placeholder="Tulis konten halaman Anda di sini..."
            />
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPublished"
              checked={watch("isPublished")}
              onCheckedChange={(checked) =>
                setValue("isPublished", checked as boolean)
              }
            />
            <Label
              htmlFor="isPublished"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Publikasikan halaman ini
            </Label>
          </div>

          <div className="flex gap-4">
            <Link href="/admin/website-landing/pages">
              <Button type="button" variant="outline">
                Batal
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Menyimpan..." : "Simpan Halaman"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
