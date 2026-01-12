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
import { isBefore } from "date-fns";

export type Event = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  location: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export const createColumns = ({
  onEdit,
  onDelete
}: {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}): ColumnDef<Event>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Judul
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      return <div className="font-medium">{title}</div>;
    }
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tanggal Mulai
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("startDate") as Date;
      const isPast = isBefore(new Date(date), new Date());
      return (
        <div className="flex items-center gap-2">
          <span>{formatDate(date)}</span>
          <Badge variant={isPast ? "secondary" : "default"}>
            {isPast ? "Berlalu" : "Mendatang"}
          </Badge>
        </div>
      );
    }
  },
  {
    accessorKey: "location",
    header: "Lokasi",
    cell: ({ row }) => {
      const location = row.getValue("location") as string;
      return <div className="text-sm">{location}</div>;
    }
  },
  {
    accessorKey: "isPublished",
    header: "Status",
    cell: ({ row }) => {
      const isPublished = row.getValue("isPublished") as boolean;
      return (
        <Badge variant={isPublished ? "default" : "secondary"}>
          {isPublished ? "Dipublikasikan" : "Draft"}
        </Badge>
      );
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const event = row.original;

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
            <DropdownMenuItem onClick={() => onEdit(event.id)}>Sunting acara</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(event.id)} className="text-red-600">
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];
