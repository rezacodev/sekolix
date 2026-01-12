"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { toast } from "sonner";

const schema = z.object({
  code: z.string().optional(),
  name: z.string().min(1, "Nama wajib diisi"),
  description: z.string().optional()
});

type FormData = z.infer<typeof schema>;

interface Props {
  initialData?: { id: number; code?: string; name: string; description?: string } | null;
  onSubmit: () => void;
}

export default function CurriculumForm({ initialData, onSubmit }: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? {
          code: initialData.code || "",
          name: initialData.name,
          description: initialData.description || ""
        }
      : {
          code: "",
          name: "",
          description: ""
        }
  });

  const onSubmitHandler = async (data: FormData) => {
    const method = initialData ? "PUT" : "POST";
    const url = initialData
      ? `/api/admin/manajemen-akademik/kurikulum-mapel/curriculums/${initialData.id}`
      : "/api/admin/manajemen-akademik/kurikulum-mapel/curriculums";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      toast.success("Berhasil disimpan");
      onSubmit();
    } else {
      const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
      toast.error(errorData.error || "Gagal menyimpan");
      console.error("Save error:", errorData);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kode Kurikulum</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Contoh: K13-SD" />
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
              <FormLabel>Nama Kurikulum</FormLabel>
              <FormControl>
                <Input {...field} />
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
                <Textarea {...field} placeholder="Deskripsi kurikulum..." rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Menyimpan..." : "Simpan"}
        </Button>
      </form>
    </Form>
  );
}
