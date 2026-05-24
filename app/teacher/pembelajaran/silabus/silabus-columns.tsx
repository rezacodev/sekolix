"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, Copy, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

export type SyllabusRow = {
  id: number;
  title: string;
  subjectName: string;
  className: string;
  academicYear: string;
  semester: number;
  isApproved: boolean;
  lessonPlansCount: number;
};

interface ColumnsProps {
  onDelete: (id: number) => void;
  onDuplicate: (id: number) => void;
}

export function createSyllabusColumns({ onDelete, onDuplicate }: ColumnsProps): ColumnDef<SyllabusRow>[] {
  return [
    {
      accessorKey: "title",
      header: "Judul Silabus",
      cell: ({ row }) => <div className="font-medium">{row.getValue("title")}</div>
    },
    {
      accessorKey: "subjectName",
      header: "Mata Pelajaran"
    },
    {
      accessorKey: "className",
      header: "Kelas",
      cell: ({ row }) => <div>Kelas {row.getValue("className")}</div>
    },
    {
      accessorKey: "academicYear",
      header: "Tahun/Semester",
      cell: ({ row }) => (
        <div>
          {row.getValue("academicYear")} / Sem {row.original.semester}
        </div>
      )
    },
    {
      accessorKey: "isApproved",
      header: "Status",
      cell: ({ row }) =>
        row.getValue("isApproved") ? (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Disetujui
          </Badge>
        ) : (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Menunggu
          </Badge>
        )
    },
    {
      accessorKey: "lessonPlansCount",
      header: "RPP",
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("lessonPlansCount")} RPP</Badge>
      )
    },
    {
      id: "actions",
      header: () => <div className="text-right">Aksi</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Link href={`/teacher/pembelajaran/silabus/${row.original.id}`}>
            <Button variant="ghost" size="sm" title="Lihat Detail">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onDuplicate(row.original.id)}
            title="Duplikasi Silabus"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Link href={`/teacher/pembelajaran/silabus/${row.original.id}/edit`}>
            <Button variant="ghost" size="sm" title="Edit Silabus">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onDelete(row.original.id)}
            title="Hapus Silabus"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];
}
