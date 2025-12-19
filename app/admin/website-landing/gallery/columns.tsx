"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";
import Image from "next/image";

export type Gallery = {
  id: string;
  title: string;
  image: string;
  albumId: string | null;
  album: { id: string; name: string } | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

export const createColumns = (
  onEdit: (gallery: Gallery) => void,
  onDelete: (id: string) => void,
  busyId: string | null,
  options?: { draggable?: boolean; onPreview?: (image: string) => void }
): ColumnDef<Gallery>[] => {
  const cols: ColumnDef<Gallery>[] = [];

  if (options?.draggable) {
    cols.push({
      id: "drag",
      header: "",
      cell: () => (
        <div className="flex justify-center text-muted-foreground">
          <GripVertical className="h-4 w-4" />
        </div>
      ),
      size: 40,
    });
  }

  cols.push(
  {
    accessorKey: "image",
    header: "Pratinjau",
    cell: ({ row }) => {
      const image = row.getValue("image") as string;
      const title = row.original.title;
      return (
        <button
          type="button"
          onClick={() => options?.onPreview?.(image)}
          className="relative h-12 w-16 overflow-hidden rounded border hover:border-blue-500 cursor-pointer transition-all hover:shadow-md"
        >
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            sizes="64px"
          />
        </button>
      );
    },
  },
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
    },
  },
  {
    accessorKey: "album",
    header: "Album",
    cell: ({ row }) => {
      const album = row.original.album;
      return album ? (
        <div className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded inline-block">
          {album.name}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground italic">Tanpa album</div>
      );
    },
  },
  {
    accessorKey: "order",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Urutan
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const order = row.getValue("order") as number;
      return <div className="text-center">{order}</div>;
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Dibuat
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return <div>{formatDate(date)}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const gallery = row.original;
      const isBusy = busyId === gallery.id;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" disabled={isBusy}>
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(gallery)}>
              Sunting item
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(gallery.id)}
              className="text-red-600"
            >
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  );

  return cols;
};
