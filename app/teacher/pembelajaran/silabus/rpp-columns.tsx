"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

export type LessonPlanRow = {
  id: number;
  syllabusId: number;
  title: string;
  subjectName: string;
  className: string;
  meetingNumber: number | null;
  isApproved: boolean;
  academicYear?: string;
  semester?: number;
};

interface ColumnsProps {
  onDelete: (id: number) => void;
}

export function createLessonPlanColumns({ onDelete }: ColumnsProps): ColumnDef<LessonPlanRow>[] {
  return [
    {
      accessorKey: "title",
      header: "Judul RPP",
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
          {row.original.academicYear || "-"} {row.original.semester ? `/ Sem ${row.original.semester}` : ""}
        </div>
      )
    },
    {
      accessorKey: "meetingNumber",
      header: "Pertemuan",
      cell: ({ row }) => {
        const meeting = row.getValue("meetingNumber") as number | null;
        return meeting ? `Pertemuan ${meeting}` : "-";
      }
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
      id: "actions",
      header: () => <div className="text-right">Aksi</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Link href={`/teacher/pembelajaran/silabus/${row.original.syllabusId}/rpp/${row.original.id}`}>
            <Button variant="ghost" size="sm" title="Lihat Detail">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/teacher/pembelajaran/rpp/${row.original.id}/edit`}>
            <Button variant="ghost" size="sm" title="Edit RPP">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onDelete(row.original.id)}
            title="Hapus RPP"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];
}
