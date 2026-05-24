"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Video,
  Music,
  Image as ImageIcon,
  Link as LinkIcon,
  Eye,
  Pencil,
  Trash2,
  CheckCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";

export interface MaterialRow {
  id: number;
  title: string;
  subjectName: string;
  className: string | null;
  fileType: string | null;
  fileName: string | null;
  fileSize: number | null;
  fileUrl: string | null;
  externalLink: string | null;
  publishedAt: string | null;
  views: number;
  downloads: number;
}

// Get file icon helper
const getFileIcon = (fileType: string | null) => {
  if (!fileType) return <FileText className="h-4 w-4" />;

  const type = fileType.toLowerCase();
  if (["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx"].includes(type)) {
    return <FileText className="h-4 w-4" />;
  }
  if (["mp4", "avi", "mkv", "mov", "wmv"].includes(type)) {
    return <Video className="h-4 w-4" />;
  }
  if (["mp3", "wav", "ogg", "m4a"].includes(type)) {
    return <Music className="h-4 w-4" />;
  }
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(type)) {
    return <ImageIcon className="h-4 w-4" />;
  }
  if (type === "link") {
    return <LinkIcon className="h-4 w-4" />;
  }
  return <FileText className="h-4 w-4" />;
};

interface CreateMaterialColumnsOptions {
  onDelete: (id: number) => void;
}

export function createMaterialColumns({
  onDelete,
}: CreateMaterialColumnsOptions): ColumnDef<MaterialRow>[] {
  return [
    {
      accessorKey: "title",
      header: "Judul Materi",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {getFileIcon(row.original.fileType)}
          <span className="font-medium">{row.getValue("title")}</span>
        </div>
      ),
    },
    {
      accessorKey: "subjectName",
      header: "Mata Pelajaran",
    },
    {
      accessorKey: "className",
      header: "Kelas",
      cell: ({ row }) => {
        const className = row.getValue("className") as string | null;
        return className ? `Kelas ${className}` : "Semua Kelas";
      },
    },
    {
      accessorKey: "publishedAt",
      header: "Status",
      cell: ({ row }) => {
        const publishedAt = row.getValue("publishedAt") as string | null;
        if (publishedAt) {
          return (
            <Badge variant="default" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              Terbit
            </Badge>
          );
        }
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Draft
          </Badge>
        );
      },
    },
    {
      accessorKey: "views",
      header: "Views",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue("views")}x
        </span>
      ),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const material = row.original;

        return (
          <div className="flex items-center gap-2">
            <Link href={`/teacher/pembelajaran/materi/${material.id}`}>
              <Button variant="ghost" size="sm" title="Lihat Detail">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={`/teacher/pembelajaran/materi/${material.id}/edit`}>
              <Button variant="ghost" size="sm" title="Edit Materi">
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(material.id)}
              title="Hapus Materi"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}
