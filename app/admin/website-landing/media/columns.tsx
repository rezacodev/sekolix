"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown, LinkIcon, Trash } from "lucide-react";
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
import { formatDate } from "@/lib/utils";

export type MediaItem = {
  id: string;
  title: string | null;
  description?: string | null;
  url: string;
  publicId: string;
  type: string;
  folder?: string | null;
  size?: number | null;
  width?: number | null;
  height?: number | null;
  format?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const formatBytes = (bytes?: number | null) => {
  if (!bytes || bytes <= 0) return "-";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[exponent]}`;
};

export const createColumns = ({
  onDelete,
  onCopy,
}: {
  onDelete: (id: string) => void;
  onCopy: (url: string) => void;
}): ColumnDef<MediaItem>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Judul
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const title = (row.getValue("title") as string | null) || "Tanpa judul";
      return <div className="font-medium line-clamp-2">{title}</div>;
    },
  },
  {
    accessorKey: "type",
    header: "Tipe",
    cell: ({ row }) => {
      const type = (row.getValue("type") as string)?.toLowerCase();
      return (
        <Badge variant="secondary" className="capitalize">
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "folder",
    header: "Folder",
    cell: ({ row }) => {
      const folder = row.getValue("folder") as string | null;
      return <div className="text-sm text-muted-foreground">{folder || "-"}</div>;
    },
  },
  {
    accessorKey: "size",
    header: "Ukuran",
    cell: ({ row }) => {
      const size = row.getValue("size") as number | null;
      return <div className="text-sm">{formatBytes(size)}</div>;
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Diunggah
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return <div className="text-sm">{formatDate(date)}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const media = row.original;

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
            <DropdownMenuItem onClick={() => onCopy(media.url)}>
              <LinkIcon className="mr-2 h-4 w-4" />
              Salin URL
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(media.id)}
              className="text-red-600"
            >
              <Trash className="mr-2 h-4 w-4" />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
