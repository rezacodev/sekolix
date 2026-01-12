"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export type Peserta = {
  id: string;
  nik: string;
  nisn?: string | null;
  fullName: string;
  phone?: string | null;
  mobile?: string | null;
  programChoice?: string | null;
  program?: { name?: string | null } | null;
  entryYear?: { label?: string | null } | null;
  email?: string | null;
  createdAt: Date;
  classGroup?: { name?: string | null; class?: { name?: string | null } } | null;
};

export const createColumns = ({
  onView,
  onDelete
}: {
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}): ColumnDef<Peserta>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    size: 50,
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: "nisn",
    header: "NISN",
    size: 140
  },
  {
    accessorKey: "fullName",
    header: "Nama"
  },
  {
    accessorKey: "program",
    header: "Program",
    cell: ({ row }) => {
      const p = row.original.program?.name ?? row.original.programChoice ?? "-";
      return p;
    }
  },
  {
    accessorKey: "classGroup",
    header: "Rombel",
    cell: ({ row }) => {
      const group = row.original.classGroup;
      if (!group) return <span className="text-muted-foreground">Belum assign</span>;
      return group.name;
    }
  },
  {
    accessorKey: "entryYear",
    header: "Tahun Masuk",
    cell: ({ row }) => row.original.entryYear?.label ?? "-"
  },
  {
    accessorKey: "phone",
    header: "No HP",
    size: 140,
    cell: ({ row }) => row.original.phone ?? row.original.mobile ?? "-"
  },
  {
    accessorKey: "email",
    header: "Email"
  },
  {
    accessorKey: "createdAt",
    header: "Dibuat",
    size: 160,
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return new Date(date).toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short"
      });
    }
  },
  {
    id: "actions",
    header: "Aksi",
    size: 100,
    cell: ({ row }) => {
      const item = row.original;
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
            <DropdownMenuItem onClick={() => onView(item.id)}>Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(item.id)} className="text-red-600">
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];
