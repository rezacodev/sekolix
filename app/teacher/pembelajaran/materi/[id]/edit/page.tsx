"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useBreadcrumb } from "../../../../BreadcrumbContext";

interface Subject {
  id: number;
  name: string;
}

interface Class {
  id: number;
  name: string;
}

interface Material {
  id: number;
  title: string;
  description: string | null;
  subjectId: number;
  classId: number | null;
  chapter: string | null;
  tags: string | null;
  fileType: string | null;
  publishedAt: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  externalLink: string | null;
}

export default function EditMaterialPage() {
  const params = useParams();
  const router = useRouter();
  const { setBreadcrumbs } = useBreadcrumb();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [material, setMaterial] = useState<Material | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subjectId: "",
    classId: "",
    chapter: "",
    tags: "",
    externalLink: "",
    fileType: "",
    publishedAt: "",
  });

  const materialId = params?.id as string;

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch subjects
        const subjectsRes = await fetch("/api/teacher/subjects");
        if (subjectsRes.ok) {
          const subjectsData = await subjectsRes.json();
          setSubjects(subjectsData.subjects || []);
        }

        // Fetch classes
        const classesRes = await fetch("/api/teacher/classes");
        if (classesRes.ok) {
          const classesData = await classesRes.json();
          setClasses(classesData.classes || []);
        }

        // Fetch material
        const materialsRes = await fetch(`/api/teacher/pembelajaran/materials?id=${materialId}`);
        if (materialsRes.ok) {
          const found = await materialsRes.json();

          if (found) {
            setMaterial(found);
            
            // Normalize fileType to match Select options
            let normalizedFileType = "";
            if (found.fileType) {
              const ft = found.fileType.toLowerCase();
              // Map common variations to standard values
              if (ft === "pdf") normalizedFileType = "pdf";
              else if (ft.includes("doc")) normalizedFileType = "doc";
              else if (ft.includes("ppt")) normalizedFileType = "ppt";
              else if (ft.includes("xls")) normalizedFileType = "xls";
              else if (ft.includes("video") || ft === "mp4" || ft === "avi" || ft === "mkv") normalizedFileType = "video";
              else if (ft.includes("audio") || ft === "mp3" || ft === "wav") normalizedFileType = "audio";
              else if (ft.includes("image") || ft === "jpg" || ft === "png" || ft === "jpeg") normalizedFileType = "image";
              else if (ft === "link" || ft === "url") normalizedFileType = "link";
              else normalizedFileType = ft; // Keep original if no match
            }
            
            setFormData({
              title: found.title || "",
              description: found.description || "",
              subjectId: found.subjectId.toString(),
              classId: found.classId ? found.classId.toString() : "",
              chapter: found.chapter || "",
              tags: found.tags || "",
              externalLink: found.externalLink || "",
              fileType: normalizedFileType,
              publishedAt: found.publishedAt
                ? new Date(found.publishedAt).toISOString().slice(0, 16)
                : "",
            });
            
            // Set breadcrumbs
            if (setBreadcrumbs) {
              setBreadcrumbs([
                { label: "Pembelajaran", href: "/teacher" },
                { label: "Materi Pembelajaran", href: "/teacher/pembelajaran/materi" },
                { label: found.title, href: `/teacher/pembelajaran/materi/${materialId}` },
                { label: "Edit" },
              ]);
            }
          } else {
            toast.error("Materi tidak ditemukan");
            router.push("/teacher/pembelajaran/materi");
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Gagal memuat data");
      } finally {
        setLoading(false);
      }
    };

    if (materialId) {
      fetchData();
    }
  }, [materialId, router, setBreadcrumbs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Judul harus diisi");
      return;
    }

    if (!formData.subjectId) {
      toast.error("Mata pelajaran harus dipilih");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/teacher/pembelajaran/materials", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: materialId,
          title: formData.title,
          description: formData.description || null,
          subjectId: formData.subjectId,
          classId: formData.classId && formData.classId !== "none" ? formData.classId : null,
          chapter: formData.chapter || null,
          tags: formData.tags || null,
          fileType: formData.fileType || null,
          externalLink: formData.externalLink || null,
          publishedAt: formData.publishedAt || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update material");
      }

      toast.success("Materi berhasil diperbarui");
      router.push("/teacher/pembelajaran/materi");
    } catch (error: unknown) {
      console.error("Error updating material:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal memperbarui materi"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!material) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Materi tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Edit Materi Pembelajaran"
        description="Perbarui informasi materi pembelajaran"
        backHref="/teacher/pembelajaran/materi"
        backLabel="Kembali ke Materi Pembelajaran"
      />

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Materi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Judul Materi <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Contoh: Rangkaian Listrik - Materi Dasar"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                placeholder="Jelaskan isi materi pembelajaran ini..."
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Deskripsi singkat tentang isi materi
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">
                  Mata Pelajaran <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.subjectId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, subjectId: value })
                  }
                  required
                >
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Pilih Mata Pelajaran" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id.toString()}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="class">Kelas</Label>
                <Select
                  value={formData.classId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, classId: value })
                  }
                >
                  <SelectTrigger id="class">
                    <SelectValue placeholder="Semua Kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Semua Kelas</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        Kelas {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Kosongkan jika materi untuk semua kelas
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chapter">Bab/Topik</Label>
                <Input
                  id="chapter"
                  placeholder="Contoh: Bab 3 - Listrik Dinamis"
                  value={formData.chapter}
                  onChange={(e) =>
                    setFormData({ ...formData, chapter: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  placeholder="Contoh: fisika, listrik, rangkaian"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Pisahkan dengan koma untuk beberapa tags
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* External Link */}
        <Card>
          <CardHeader>
            <CardTitle>Link Materi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="externalLink">
                URL Link <span className="text-red-500">*</span>
              </Label>
              <Input
                id="externalLink"
                type="url"
                placeholder="https://youtube.com/watch?v=... atau https://drive.google.com/..."
                value={formData.externalLink}
                onChange={(e) =>
                  setFormData({ ...formData, externalLink: e.target.value })
                }
                required
              />
              <p className="text-xs text-muted-foreground">
                Link YouTube, Google Drive, atau sumber eksternal lainnya
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fileType">
                Jenis File <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.fileType}
                onValueChange={(value) =>
                  setFormData({ ...formData, fileType: value })
                }
                required
              >
                <SelectTrigger id="fileType">
                  <SelectValue placeholder="Pilih jenis file" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="doc">Word (DOC/DOCX)</SelectItem>
                  <SelectItem value="ppt">PowerPoint (PPT/PPTX)</SelectItem>
                  <SelectItem value="xls">Excel (XLS/XLSX)</SelectItem>
                  <SelectItem value="video">Video (MP4/AVI/MKV)</SelectItem>
                  <SelectItem value="audio">Audio (MP3/WAV)</SelectItem>
                  <SelectItem value="image">Gambar (JPG/PNG)</SelectItem>
                  <SelectItem value="link">Link/Website</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Pilih jenis file yang ada di link tersebut
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Publishing Options */}
        <Card>
          <CardHeader>
            <CardTitle>Opsi Publikasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="publishedAt">Jadwal Publikasi</Label>
              <Input
                id="publishedAt"
                type="datetime-local"
                value={formData.publishedAt}
                onChange={(e) =>
                  setFormData({ ...formData, publishedAt: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                <strong>Wajib diisi untuk publikasi.</strong> Jika kosong, status materi akan tetap <strong>Draft</strong>. Isi dengan tanggal publikasi untuk mengubah status menjadi <strong>Published</strong>.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={submitting}
          >
            Batal
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan Perubahan"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
