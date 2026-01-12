"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export type Gtk = {
  id: string;
  name: string;
  nip?: string | null;
  niy?: string | null;
  nuptk?: string | null;
  nik?: string | null;
  statusKepegawaian?: string | null;
  nrg?: string | null;
  masaKerja?: number | null;
  mkg?: number | null;
  position?: string | null;
  department?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  photo?: string | null;
  image?: string | null;
  bio?: string | null;
  placeOfBirth?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  religion?: string | null;
  maritalStatus?: string | null;
  address?: string | null;
  educationHistory?: string | null;
  academicDegree?: string | null;
  trainingHistory?: string | null;
  subjects?: string | null;
  workloadHours?: number | null;
  extraDuties?: string | null;
  gtkPosition?: string | null;
  professionalAllowanceStatus?: string | null;
  familyInfo?: string | null;
  userId?: string | null;
  isActive?: boolean | null;
  order?: number | null;
  jenisPTK?: string | null;
  jabatanPTK?: string | null;
};

export const createColumns = ({
  onDelete,
  onEdit
}: {
  onDelete: (id: string) => void;
  onEdit?: (t: Gtk) => void;
}): ColumnDef<Gtk>[] => [
  {
    accessorKey: "name",
    header: "Nama",
    cell: ({ row }) => {
      const name = row.original.name;
      return <div className="font-semibold">{name}</div>;
    }
  },
  {
    accessorKey: "nuptk",
    header: "NUPTK",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">{row.getValue("nuptk") ?? "-"}</div>
    )
  },
  {
    accessorKey: "nik",
    header: "NIK",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">{row.getValue("nik") ?? "-"}</div>
    )
  },
  {
    accessorKey: "nip",
    header: "NIP/NIY",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {row.getValue("nip") ?? row.getValue("niy") ?? "-"}
      </div>
    )
  },
  {
    accessorKey: "statusKepegawaian",
    header: "Status GTK",
    cell: ({ row }) => <div className="text-sm">{row.getValue("statusKepegawaian") ?? "-"}</div>
  },
  {
    accessorKey: "jenisPTK",
    header: "Jenis PTK",
    cell: ({ row }) => <div className="text-sm">{row.getValue("jenisPTK") ?? "-"}</div>
  },
  {
    accessorKey: "jabatanPTK",
    header: "Jabatan PTK",
    cell: ({ row }) => <div className="text-sm">{row.getValue("jabatanPTK") ?? "-"}</div>
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const t = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit && onEdit(t)}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(t.id)} className="text-red-600">
              <Trash className="mr-2 h-4 w-4" /> Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];
