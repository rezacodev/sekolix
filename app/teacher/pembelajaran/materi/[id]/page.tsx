"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import {
  FileText,
  Video,
  Music,
  Image as ImageIcon,
  Link as LinkIcon,
  Download,
  Eye,
  Calendar,
  Book,
  Tag,
  Pencil,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { formatFileSize, getFileTypeLabel } from "@/lib/upload-utils";
import { useBreadcrumb } from "../../../BreadcrumbContext";

interface Material {
  id: number;
  teacherId: string;
  subjectId: number;
  classId: number | null;
  title: string;
  description: string | null;
  fileUrl: string | null;
  fileType: string | null;
  fileName: string | null;
  fileSize: number | null;
  externalLink: string | null;
  chapter: string | null;
  tags: string | null;
  publishedAt: string | null;
  views: number;
  downloads: number;
  createdAt: string;
  updatedAt: string;
  subject: {
    id: number;
    name: string;
    code: string | null;
  };
  class: {
    id: number;
    name: string;
  } | null;
  teacher: {
    id: string;
    name: string;
  };
}

export default function MaterialDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { setBreadcrumbs } = useBreadcrumb();
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const materialId = params?.id as string;

  // Fetch material detail
  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const response = await fetch(`/api/teacher/pembelajaran/materials?id=${materialId}`);
        if (!response.ok) throw new Error("Failed to fetch material");

        const data = await response.json();
        setMaterial(data);
        
        // Set breadcrumbs
        if (setBreadcrumbs) {
          setBreadcrumbs([
            { label: "Pembelajaran", href: "/teacher" },
            { label: "Materi Pembelajaran", href: "/teacher/pembelajaran/materi" },
            { label: data.title },
          ]);
        }
        
        // Track view
        await fetch(`/api/teacher/pembelajaran/materials/${materialId}/view`, {
          method: "POST",
        });
      } catch (error) {
        console.error("Error fetching material:", error);
        toast.error("Gagal memuat detail materi");
      } finally {
        setLoading(false);
      }
    };

    if (materialId) {
      fetchMaterial();
    }
  }, [materialId, router, setBreadcrumbs]);

  // Handle download
  const handleDownload = async () => {
    if (!material?.fileUrl) return;

    setDownloading(true);
    try {
      // Increment download counter
      await fetch(`/api/teacher/pembelajaran/materials/${materialId}/download`, {
        method: "POST",
      });

      // Trigger download
      const link = document.createElement("a");
      link.href = material.fileUrl;
      link.download = material.fileName || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Update local state
      setMaterial({
        ...material,
        downloads: material.downloads + 1,
      });

      toast.success("File berhasil didownload");
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Gagal mendownload file");
    } finally {
      setDownloading(false);
    }
  };

  // Get file icon
  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <FileText className="h-8 w-8" />;

    const type = fileType.toLowerCase();
    if (["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx"].includes(type)) {
      return <FileText className="h-8 w-8" />;
    }
    if (["mp4", "avi", "mkv", "mov", "wmv"].includes(type)) {
      return <Video className="h-8 w-8" />;
    }
    if (["mp3", "wav", "ogg", "m4a"].includes(type)) {
      return <Music className="h-8 w-8" />;
    }
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(type)) {
      return <ImageIcon className="h-8 w-8" />;
    }
    if (type === "link") {
      return <LinkIcon className="h-8 w-8" />;
    }
    return <FileText className="h-8 w-8" />;
  };

  // Render file preview
  const renderPreview = () => {
    if (!material) return null;

    if (material.externalLink) {
      // YouTube embed
      if (material.externalLink.includes("youtube.com") || material.externalLink.includes("youtu.be")) {
        const videoId = material.externalLink.includes("youtu.be")
          ? material.externalLink.split("youtu.be/")[1]
          : new URL(material.externalLink).searchParams.get("v");

        return (
          <div className="aspect-video">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}`}
              title={material.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-lg"
            />
          </div>
        );
      }

      // External link
      return (
        <div className="text-center py-12">
          <LinkIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">Link Eksternal</p>
          <a
            href={material.externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {material.externalLink}
          </a>
        </div>
      );
    }

    if (!material.fileUrl) return null;

    const fileType = material.fileType?.toLowerCase();

    // Image preview
    if (fileType && ["jpg", "jpeg", "png", "gif", "webp"].includes(fileType)) {
      return (
        <div className="flex justify-center">
          <Image
            src={material.fileUrl}
            alt={material.title}
            width={800}
            height={600}
            className="max-w-full h-auto rounded-lg"
          />
        </div>
      );
    }

    // PDF preview
    if (fileType === "pdf") {
      return (
        <div className="h-[600px]">
          <iframe
            src={material.fileUrl}
            className="w-full h-full rounded-lg border"
            title={material.title}
          />
        </div>
      );
    }

    // Video preview
    if (fileType && ["mp4", "mov", "avi", "wmv"].includes(fileType)) {
      return (
        <video controls className="w-full rounded-lg">
          <source src={material.fileUrl} type={`video/${fileType}`} />
          Browser Anda tidak mendukung video.
        </video>
      );
    }

    // Audio preview
    if (fileType && ["mp3", "wav", "ogg", "m4a"].includes(fileType)) {
      return (
        <div className="flex justify-center py-12">
          <audio controls>
            <source src={material.fileUrl} type={`audio/${fileType}`} />
            Browser Anda tidak mendukung audio.
          </audio>
        </div>
      );
    }

    // Default: Show download option
    return (
      <div className="text-center py-12">
        {getFileIcon(material.fileType)}
        <p className="text-lg font-medium mt-4 mb-2">
          {getFileTypeLabel(material.fileType || "")}
        </p>
        <p className="text-muted-foreground mb-4">
          {material.fileName}
          {material.fileSize && ` (${formatFileSize(material.fileSize)})`}
        </p>
        <Button onClick={handleDownload} disabled={downloading}>
          <Download className="h-4 w-4 mr-2" />
          {downloading ? "Mendownload..." : "Download File"}
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Memuat detail materi...</p>
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
        title={material.title}
        description={`${material.subject.name} ${material.class ? `- Kelas ${material.class.name}` : ""}`}
        backHref="/teacher/pembelajaran/materi"
        backLabel="Kembali ke Materi Pembelajaran"
      >
        <Link href={`/teacher/pembelajaran/materi/${material.id}/edit`}>
          <Button>
            <Pencil className="h-4 w-4 mr-2" />
            Edit Materi
          </Button>
        </Link>
      </PageHeader>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview Materi</CardTitle>
            </CardHeader>
            <CardContent>{renderPreview()}</CardContent>
          </Card>

          {/* Description */}
          {material.description && (
            <Card>
              <CardHeader>
                <CardTitle>Deskripsi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {material.description}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistik</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Views</span>
                </div>
                <span className="font-medium">{material.views}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Downloads</span>
                </div>
                <span className="font-medium">{material.downloads}</span>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Materi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Book className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Mata Pelajaran</span>
                </div>
                <p className="font-medium">{material.subject.name}</p>
              </div>

              {material.class && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Book className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Kelas</span>
                  </div>
                  <Badge variant="outline">Kelas {material.class.name}</Badge>
                </div>
              )}

              {material.chapter && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Book className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Bab/Topik</span>
                  </div>
                  <p className="font-medium">{material.chapter}</p>
                </div>
              )}

              {material.tags && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {material.tags.split(",").map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {material.publishedAt && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Dipublikasi</span>
                  </div>
                  <p className="font-medium">
                    {new Date(material.publishedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}

              {material.fileType && material.fileType !== "link" && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Tipe File</span>
                  </div>
                  <p className="font-medium">
                    {getFileTypeLabel(material.fileType)}
                  </p>
                </div>
              )}

              {material.fileSize && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Ukuran File</span>
                  </div>
                  <p className="font-medium">{formatFileSize(material.fileSize)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {material.fileUrl && material.fileType !== "link" && (
            <Button onClick={handleDownload} disabled={downloading} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              {downloading ? "Mendownload..." : "Download File"}
            </Button>
          )}

          {material.externalLink && (
            <Button asChild className="w-full">
              <a
                href={material.externalLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Buka Link
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
