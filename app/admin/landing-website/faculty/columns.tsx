"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export type Faculty = {
  id: string;
  name: string;
  position: string;
  department?: string | null;
  image?: string | null;
  email?: string | null;
  phone?: string | null;
  bio?: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export const createColumns = (): ColumnDef<Faculty>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Nama
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const name = row.original.name;
      const position = row.original.position;
      return (
        <div className="space-y-1">
          <div className="font-semibold">{name}</div>
          <div className="text-sm text-muted-foreground">{position}</div>
        </div>
      );
    }
  },
  {
    accessorKey: "position",
    header: "Posisi",
    cell: ({ row }) => {
      const position = row.getValue("position") as string;
      return <div className="text-sm text-muted-foreground">{position || "-"}</div>;
    }
  },
  {
    accessorKey: "department",
    header: "Departemen",
    cell: ({ row }) => {
      const department = row.getValue("department") as string | null;
      return <div className="text-sm text-muted-foreground">{department || "-"}</div>;
    }
  },
  {
    accessorKey: "email",
    header: "Kontak",
    cell: ({ row }) => {
      const email = row.getValue("email") as string | null;
      const phone = row.getValue("phone") as string | null;
      return (
        <div className="text-sm text-muted-foreground space-y-0.5">
          {email && <div>{email}</div>}
          {phone && <div>{phone}</div>}
          {!email && !phone && <div>-</div>}
        </div>
      );
    }
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Aktif" : "Nonaktif"}
        </Badge>
      );
    }
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Dibuat
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return <div className="text-sm">{formatDate(date)}</div>;
    }
  },
  {
    id: "actions",
    cell: () => {
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
            <DropdownMenuItem
              onClick={() => {
                window.open("/admin/manajemen-akademik/data-guru-staf", "_blank");
              }}
            >
              Buka di Akademik (Kelola)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];
