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

const lessonTimeSchema = z.object({
  day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
  session: z.number().int().positive(),
  start_time: z.string().min(1, "Waktu mulai harus diisi"),
  end_time: z.string().min(1, "Waktu selesai harus diisi"),
  is_break: z.boolean(),
  break_label: z.string().optional(),
  is_active: z.boolean()
});

type LessonTimeFormValues = z.infer<typeof lessonTimeSchema>;

interface LessonTimeFormProps {
  initialData?: Partial<LessonTimeFormValues & { id: number }> | null;
  onSubmit: () => void;
}

export default function LessonTimeForm({ initialData, onSubmit }: LessonTimeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LessonTimeFormValues>({
    resolver: zodResolver(lessonTimeSchema),
    defaultValues: {
      day: "MONDAY",
      session: 1,
      start_time: "",
      end_time: "",
      is_break: false,
      break_label: "",
      is_active: true
    }
  });

  const isBreak = form.watch("is_break");

  useEffect(() => {
    if (initialData) {
      form.reset({
        day: initialData.day || "MONDAY",
        session: initialData.session || 1,
        start_time: initialData.start_time || "",
        end_time: initialData.end_time || "",
        is_break: initialData.is_break || false,
        break_label: initialData.break_label || "",
        is_active: initialData.is_active ?? true
      });
    }
  }, [initialData, form]);

  const handleSubmit = async (values: LessonTimeFormValues) => {
    setIsSubmitting(true);
    try {
      const url = initialData
        ? `/api/admin/manajemen-akademik/ruang-jam-pelajaran/lesson-times/${initialData.id}`
        : "/api/admin/manajemen-akademik/ruang-jam-pelajaran/lesson-times";

      const response = await fetch(url, {
        method: initialData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        toast.success(initialData ? "Jam pelajaran berhasil diperbarui" : "Jam pelajaran berhasil ditambahkan");
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
          {initialData ? "Edit Jam Pelajaran" : "Tambah Jam Pelajaran Baru"}
        </h2>

        <FormField
          control={form.control}
          name="day"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hari *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih hari" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="MONDAY">Senin</SelectItem>
                  <SelectItem value="TUESDAY">Selasa</SelectItem>
                  <SelectItem value="WEDNESDAY">Rabu</SelectItem>
                  <SelectItem value="THURSDAY">Kamis</SelectItem>
                  <SelectItem value="FRIDAY">Jumat</SelectItem>
                  <SelectItem value="SATURDAY">Sabtu</SelectItem>
                  <SelectItem value="SUNDAY">Minggu</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_break"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Waktu Istirahat</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Tandai jika ini adalah waktu istirahat
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

        {!isBreak && (
          <FormField
            control={form.control}
            name="session"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jam Ke- *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="1, 2, 3, dst"
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {isBreak && (
          <FormField
            control={form.control}
            name="break_label"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label Istirahat</FormLabel>
                <FormControl>
                  <Input placeholder="Istirahat 1, Istirahat Sholat" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Waktu Mulai *</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Waktu Selesai *</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Status Aktif</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Jam pelajaran dapat digunakan
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
