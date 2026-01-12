"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useState, useEffect } from "react";

const roomSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1, "Nama ruang harus diisi"),
  type: z.enum(["CLASSROOM", "LABORATORY", "LIBRARY", "SPORTS_HALL", "AUDITORIUM", "OFFICE", "OTHER"]),
  floor: z.string().optional(),
  building: z.string().optional(),
  capacity: z.number().int().positive().optional().or(z.literal(0)),
  facilities: z.string().optional(),
  description: z.string().optional(),
  is_active: z.boolean()
});

type RoomFormValues = z.infer<typeof roomSchema>;

interface RoomFormProps {
  initialData?: Partial<RoomFormValues & { id: number }> | null;
  onSubmit: () => void;
}

export default function RoomForm({ initialData, onSubmit }: RoomFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      code: "",
      name: "",
      type: "CLASSROOM",
      floor: "",
      building: "",
      capacity: 0,
      facilities: "",
      description: "",
      is_active: true
    }
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        code: initialData.code || "",
        name: initialData.name || "",
        type: initialData.type || "CLASSROOM",
        floor: initialData.floor || "",
        building: initialData.building || "",
        capacity: initialData.capacity || 0,
        facilities: initialData.facilities || "",
        description: initialData.description || "",
        is_active: initialData.is_active ?? true
      });
    }
  }, [initialData, form]);

  const handleSubmit = async (values: RoomFormValues) => {
    setIsSubmitting(true);
    try {
      const url = initialData
        ? `/api/admin/manajemen-akademik/ruang-jam-pelajaran/rooms/${initialData.id}`
        : "/api/admin/manajemen-akademik/ruang-jam-pelajaran/rooms";

      const response = await fetch(url, {
        method: initialData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        toast.success(initialData ? "Ruang berhasil diperbarui" : "Ruang berhasil ditambahkan");
        form.reset();
        onSubmit();
      } else {
        const data = await response.json();
        toast.error(data.error || "Terjadi kesalahan");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Terjadi kesalahan saat menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <h2 className="text-xl font-semibold">
          {initialData ? "Edit Ruang" : "Tambah Ruang Baru"}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kode Ruang</FormLabel>
                <FormControl>
                  <Input placeholder="R-101, LAB-IPA-1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Ruang *</FormLabel>
                <FormControl>
                  <Input placeholder="Kelas 1A, Lab Komputer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipe Ruang *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe ruang" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="CLASSROOM">Ruang Kelas</SelectItem>
                  <SelectItem value="LABORATORY">Laboratorium</SelectItem>
                  <SelectItem value="LIBRARY">Perpustakaan</SelectItem>
                  <SelectItem value="SPORTS_HALL">Gedung Olahraga</SelectItem>
                  <SelectItem value="AUDITORIUM">Auditorium</SelectItem>
                  <SelectItem value="OFFICE">Ruang Kantor</SelectItem>
                  <SelectItem value="OTHER">Lainnya</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="floor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lantai</FormLabel>
                <FormControl>
                  <Input placeholder="1, 2, 3" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="building"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gedung</FormLabel>
                <FormControl>
                  <Input placeholder="Gedung A, Gedung B" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kapasitas</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="30"
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="facilities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fasilitas</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Proyektor, AC, Papan Tulis, dsb"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Deskripsi atau keterangan tambahan"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Status Aktif</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Ruang dapat digunakan untuk jadwal pelajaran
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : initialData ? "Perbarui" : "Simpan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
