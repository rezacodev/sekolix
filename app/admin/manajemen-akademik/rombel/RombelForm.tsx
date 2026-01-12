"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const schema = z.object({
  class_id: z.number().int().min(1, "Kelas wajib dipilih"),
  program_id: z.string().min(1, "Program wajib dipilih"),
  tahunAjaranId: z.string().min(1, "Tahun ajaran wajib dipilih"),
  name: z.string().min(1, "Nama rombel wajib diisi"),
  capacity: z.number().int().optional()
});

type FormData = z.infer<typeof schema>;

interface Class {
  id: number;
  name: string;
}

interface Program {
  id: string;
  name: string;
}

interface TahunAjaran {
  id: string;
  label: string;
  isActive?: boolean;
}

interface Props {
  initialData?: Rombel | null;
  onSubmit: () => void;
}

interface Rombel {
  id: number;
  class_id: number;
  program_id: string;
  name: string;
  capacity?: number;
  student_count: number;
  tahunAjaran?: { id: string };
}

export default function RombelForm({ initialData, onSubmit }: Props) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [years, setYears] = useState<TahunAjaran[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? {
          class_id: initialData.class_id,
          program_id: initialData.program_id,
          tahunAjaranId: initialData.tahunAjaran?.id || "",
          name: initialData.name,
          capacity: initialData.capacity || undefined
        }
      : {
          class_id: 0,
          program_id: "",
          tahunAjaranId: "",
          name: "",
          capacity: undefined
        }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesRes, programsRes, yearsRes] = await Promise.all([
          fetch("/api/admin/manajemen-akademik/classes"),
          fetch("/api/admin/manajemen-akademik/programs"),
          fetch("/api/admin/penerimaan-siswa/settings/years")
        ]);

        if (classesRes.ok) {
          const data = await classesRes.json();
          setClasses(data.data);
        }

        if (programsRes.ok) {
          const data = await programsRes.json();
          setPrograms(data.data);
        }

        if (yearsRes.ok) {
          const data = await yearsRes.json();
          setYears(data);
          const active = (data || []).find((y: TahunAjaran) => y.isActive);
          if (!initialData && active) {
            form.setValue("tahunAjaranId", active.id);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [form, initialData]);

  const onSubmitHandler = async (data: FormData) => {
    setLoading(true);
    try {
      const method = initialData ? "PUT" : "POST";
      const url = initialData
        ? `/api/admin/manajemen-akademik/rombel/${initialData.id}`
        : "/api/admin/manajemen-akademik/rombel";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        toast.success(initialData ? "Rombel berhasil diperbarui" : "Rombel berhasil ditambahkan");
        onSubmit();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Terjadi kesalahan");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Terjadi kesalahan saat menyimpan data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-4">
        <FormField
          control={form.control}
          name="tahunAjaranId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tahun Ajaran</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tahun ajaran" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {years && years.length > 0 ? (
                    years.map(y => (
                      <SelectItem key={y.id} value={y.id}>
                        {y.label}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="__empty__" disabled>
                      {years ? "Tidak ada tahun ajaran tersedia" : "Memuat tahun ajaran..."}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="class_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kelas</FormLabel>
              <Select
                onValueChange={value => field.onChange(parseInt(value))}
                value={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kelas" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {classes && classes.length > 0 ? (
                    classes.map(cls => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="__empty__" disabled>
                      {classes ? "Tidak ada kelas tersedia" : "Memuat kelas..."}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="program_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Program</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih program" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {programs && programs.length > 0 ? (
                    programs.map(prog => (
                      <SelectItem key={prog.id} value={prog.id}>
                        {prog.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="__empty__" disabled>
                      {programs ? "Tidak ada program tersedia" : "Memuat program..."}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Rombel</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: A, B, 1, 2" {...field} />
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
                <FormLabel>Kapasitas (Opsional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Contoh: 30"
                    {...field}
                    onChange={e =>
                      field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                    }
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onSubmit}>
            Batal
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : initialData ? "Perbarui" : "Simpan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
