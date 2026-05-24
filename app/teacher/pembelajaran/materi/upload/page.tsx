"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useBreadcrumb } from "../../../BreadcrumbContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Link as LinkIcon,
} from "lucide-react";
import { toast } from "sonner";

interface Subject {
  id: number;
  name: string;
  code: string | null;
}

interface Class {
  id: number;
  name: string;
}

export default function UploadMateriPage() {
  const router = useRouter();
  const { setBreadcrumbs } = useBreadcrumb();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
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

  // Fetch subjects
  const fetchSubjects = useCallback(async () => {
    try {
      const response = await fetch("/api/teacher/subjects");
      if (!response.ok) throw new Error("Failed to fetch subjects");
      const data = await response.json();
      setSubjects(data.subjects || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast.error("Gagal memuat daftar mata pelajaran");
    }
  }, []);

  // Fetch classes
  const fetchClasses = useCallback(async () => {
    try {
      const response = await fetch("/api/teacher/classes");
      if (!response.ok) throw new Error("Failed to fetch classes");
      const data = await response.json();
      setClasses(data.classes || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  }, []);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title) {
      toast.error("Judul materi harus diisi");
      return;
    }

    if (!formData.subjectId) {
      toast.error("Mata pelajaran harus dipilih");
      return;
    }

    if (!formData.externalLink) {
      toast.error("Link eksternal harus diisi");
      return;
    }

    if (!formData.fileType) {
      toast.error("Jenis file harus dipilih");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/teacher/pembelajaran/materials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          subjectId: parseInt(formData.subjectId),
          classId: formData.classId && formData.classId !== "none" ? parseInt(formData.classId) : null,
          chapter: formData.chapter || null,
          tags: formData.tags || null,
          externalLink: formData.externalLink,
          fileType: formData.fileType,
          publishedAt: formData.publishedAt || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add material");
      }

      toast.success("Materi berhasil ditambahkan");
      router.push("/teacher/pembelajaran/materi");
    } catch (error: unknown) {
      console.error("Error adding material:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal menambahkan materi"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchClasses();
    
    // Set breadcrumbs
    setBreadcrumbs([
      { label: "Pembelajaran", href: "/teacher" },
      { label: "Materi Pembelajaran", href: "/teacher/pembelajaran/materi" },
      { label: "Upload Materi" },
    ]);
  }, [fetchSubjects, fetchClasses, setBreadcrumbs]);

  return (
    <div>
      <PageHeader
        title="Tambah Materi Pembelajaran"
        description="Tambahkan link materi pembelajaran dari sumber eksternal"
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
                <strong>Wajib diisi untuk publikasi.</strong> Jika kosong, status materi akan menjadi <strong>Draft</strong>. Isi dengan tanggal publikasi untuk mengubah status menjadi <strong>Published</strong>.
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
            disabled={loading}
          >
            Batal
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Menambahkan...
              </>
            ) : (
              <>
                <LinkIcon className="h-4 w-4 mr-2" />
                Tambahkan Materi
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
