"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Trash2, Copy } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";

export interface TugasRow {
  id: number;
  title: string;
  description: string | null;
  dueDate: Date;
  maxScore: number;
  subjectName: string;
  rombelName: string;
  submissionCount: number;
  totalStudents: number;
  createdAt: Date;
  updatedAt: Date;
  status: "upcoming" | "overdue";
}

interface CreateTugasColumnsProps {
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onClone: (id: number) => void;
}

export function createTugasColumns({
  onView,
  onEdit,
  onDelete,
  onClone,
}: CreateTugasColumnsProps): ColumnDef<TugasRow>[] {
  return [
    {
      accessorKey: "title",
      header: "Judul Tugas",
      cell: ({ row }) => {
        const isOverdue = new Date(row.original.dueDate) < new Date();
        return (
          <div className="max-w-[300px]">
            <p className="font-medium truncate" title={row.original.title}>
              {row.original.title}
            </p>
            {row.original.description && (
              <p 
                className="text-sm text-muted-foreground line-clamp-2" 
                title={row.original.description}
              >
                {row.original.description}
              </p>
            )}
            {isOverdue && (
              <span className="text-xs text-destructive font-medium">
                Sudah Lewat Deadline
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "subjectName",
      header: "Mata Pelajaran",
    },
    {
      accessorKey: "rombelName",
      header: "Rombel",
    },
    {
      accessorKey: "dueDate",
      header: "Deadline",
      cell: ({ row }) => {
        const dueDate = new Date(row.original.dueDate);
        const isOverdue = dueDate < new Date();
        
        return (
          <div>
            <p className={isOverdue ? "text-destructive font-medium" : ""}>
              {dueDate.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(dueDate, {
                addSuffix: true,
                locale: localeId,
              })}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const isOverdue = status === "overdue";
        
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            isOverdue 
              ? "bg-red-100 text-red-800" 
              : "bg-green-100 text-green-800"
          }`}>
            {isOverdue ? "Sudah Lewat" : "Akan Datang"}
          </span>
        );
      },
    },
    {
      header: "Pengumpulan",
      cell: ({ row }) => {
        const submitted = row.original.submissionCount;
        const total = row.original.totalStudents;
        const percentage = total > 0 ? Math.round((submitted / total) * 100) : 0;
        
        return (
          <div>
            <p className="font-medium">
              {submitted}/{total}
            </p>
            <p className="text-xs text-muted-foreground">
              {percentage}% terkumpul
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "maxScore",
      header: "Nilai Maks",
      cell: ({ row }) => row.original.maxScore,
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onView(row.original.id)}
              title="Lihat & Koreksi Pengumpulan"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(row.original.id)}
              title="Edit Tugas"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onClone(row.original.id)}
              title="Duplikat Tugas"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(row.original.id)}
              title="Hapus Tugas"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}
