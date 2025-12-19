"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export type Applicant = {
  id: string;
  registrationCode?: string | null;
  fullName: string;
  nik: string;
  phone: string;
  programChoice?: string | null;
  status: string;
  createdAt: Date;
  program?: { name: string } | null;
  academicYear?: { label: string } | null;
};

const statusStyles: Record<string, { bg: string; label: string }> = {
  pending: { bg: "bg-accent text-accent-foreground", label: "Pending" },
  review: { bg: "bg-muted text-muted-foreground", label: "Review" },
  accepted: { bg: "bg-success text-success-foreground", label: "Diterima" },
  rejected: { bg: "bg-destructive text-destructive-foreground", label: "Ditolak" },
};

export const createColumns = ({
  onView,
  onDelete,
}: {
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}): ColumnDef<Applicant>[] => [
  {
    accessorKey: "registrationCode",
    header: "Kode Registrasi",
    size: 130,
    cell: ({ row }) => {
      const code = row.getValue("registrationCode") as string | null;
      return code ? (
        <code className="rounded bg-muted px-2 py-1 font-mono text-xs font-semibold text-foreground">
          {code}
        </code>
      ) : (
        <span className="text-xs text-muted-foreground">-</span>
      );
    },
  },
  // ID column removed per UX request (not shown in table)
  {
    accessorKey: "fullName",
    header: "Nama",
  },
  {
    accessorKey: "nik",
    header: "NIK",
    size: 150,
  },
  {
    accessorKey: "phone",
    header: "HP",
    size: 150,
  },
  {
    accessorKey: "programChoice",
    header: "Program",
    cell: ({ row }) =>
      row.original.program?.name ??
      (row.original.programChoice ?? "-"),
    filterFn: (row, id, value) => {
      const programName = (row.original.program?.name ?? row.original.programChoice ?? "").toLowerCase();
      if (Array.isArray(value)) {
        return value.some((v) => programName.includes(String(v).toLowerCase()));
      }
      if (typeof value === "string" && value.length > 0) {
        return programName.includes(value.toLowerCase());
      }
      return true;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 120,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const style = statusStyles[status];
      return (
        <Badge className={style?.bg || "bg-muted text-foreground"}>
          {style?.label || status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      const cellValue = String(row.getValue(id));
      if (Array.isArray(value)) {
        return value.includes(cellValue);
      }
      if (typeof value === "string" && value.length > 0) {
        return cellValue === value;
      }
      return true;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Dibuat",
    size: 160,
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return new Date(date).toLocaleString("id-ID", {
        dateStyle: "medium" as const,
        timeStyle: "short" as const,
      });
    },
  },
  {
    id: "actions",
    header: "Aksi",
    size: 100,
    cell: ({ row }) => {
      const applicant = row.original;

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
            <DropdownMenuItem onClick={() => onView(applicant.id)}>
              Lihat detail
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(applicant.id)}
              className="text-red-600"
            >
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
