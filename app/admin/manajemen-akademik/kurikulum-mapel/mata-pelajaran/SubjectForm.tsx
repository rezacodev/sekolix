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
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

const schema = z.object({
  code: z.string().optional(),
  curriculum_ids: z.array(z.number().int()).min(1, "Minimal 1 kurikulum harus dipilih"),
  class_ids: z.array(z.number().int()).optional(),
  program_ids: z.array(z.string()).optional(),
  name: z.string().min(1, "Nama wajib diisi"),
  is_practice: z.boolean().optional()
});

type FormData = z.infer<typeof schema>;

interface Props {
  initialData?: {
    id: number;
    code?: string;
    name: string;
    is_practice: boolean;
    curriculums?: Array<{
      curriculum_id: number;
      curriculum: { id: number; name: string };
    }>;
    classes?: Array<{
      class_id: number;
      class: { id: number; name: string };
    }>;
    programs?: Array<{
      program_id: string;
      program: { id: string; name: string };
    }>;
  } | null;
  curriculumOptions: { id: number; name: string }[];
  onSubmit: () => void;
}

export default function SubjectForm({ initialData, curriculumOptions, onSubmit }: Props) {
  const [classOptions, setClassOptions] = useState<{ id: number; name: string }[]>([]);
  const [programOptions, setProgramOptions] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    // Fetch classes based on school level
    const fetchClasses = async () => {
      try {
        const res = await fetch("/api/admin/manajemen-akademik/classes");
        if (res.ok) {
          const result = await res.json();
          setClassOptions(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch classes", error);
        setClassOptions([]);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    // Fetch programs
    const fetchPrograms = async () => {
      try {
        const res = await fetch("/api/admin/manajemen-akademik/programs");
        if (res.ok) {
          const result = await res.json();
          setProgramOptions(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch programs", error);
        setProgramOptions([]);
      }
    };
    fetchPrograms();
  }, []);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? {
          code: initialData.code || "",
          name: initialData.name,
          curriculum_ids: initialData.curriculums?.map(c => c.curriculum_id) || [],
          class_ids: initialData.classes?.map(c => c.class_id) || [],
          program_ids: initialData.programs?.map(p => p.program_id) || [],
          is_practice: initialData.is_practice
        }
      : { code: "", name: "", curriculum_ids: [], class_ids: [], program_ids: [], is_practice: false }
  });

  const onSubmitHandler = async (data: FormData) => {
    const method = initialData ? "PUT" : "POST";
    const url = initialData
      ? `/api/admin/manajemen-akademik/kurikulum-mapel/mata-pelajaran/${initialData.id}`
      : "/api/admin/manajemen-akademik/kurikulum-mapel/mata-pelajaran";
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
          name="curriculum_ids"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kurikulum *</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Select
                    onValueChange={(value) => {
                      const id = parseInt(value);
                      if (!field.value.includes(id)) {
                        field.onChange([...field.value, id]);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kurikulum" />
                    </SelectTrigger>
                    <SelectContent>
                      {curriculumOptions
                        .filter(c => !field.value.includes(c.id))
                        .map(c => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {field.value.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {field.value.map(id => {
                        const curriculum = curriculumOptions.find(c => c.id === id);
                        return curriculum ? (
                          <Badge key={id} variant="secondary" className="flex items-center gap-1 pr-1">
                            {curriculum.name}
                            <button
                              type="button"
                              className="h-4 w-4 cursor-pointer hover:text-destructive hover:bg-destructive/10 rounded-sm flex items-center justify-center p-0 border-none bg-transparent transition-colors"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Removing curriculum:', id);
                                const newValue = field.value.filter(v => v !== id);
                                field.onChange(newValue);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kode Mata Pelajaran</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Contoh: MTK-SD-1" />
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
              <FormLabel>Nama Mata Pelajaran</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="class_ids"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kelas (Opsional)</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Select
                    onValueChange={(value) => {
                      const id = parseInt(value);
                      if (!field.value?.includes(id)) {
                        field.onChange([...(field.value || []), id]);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      {(classOptions || [])
                        .filter(c => !(field.value || []).includes(c.id))
                        .map(c => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {(field.value || []).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {(field.value || []).map(id => {
                        const classItem = (classOptions || []).find(c => c.id === id);
                        return classItem ? (
                          <Badge key={id} variant="outline" className="flex items-center gap-1">
                            {classItem.name}
                            <button
                              type="button"
                              className="h-4 w-4 cursor-pointer hover:text-destructive hover:bg-destructive/10 rounded-sm flex items-center justify-center p-0 border-none bg-transparent transition-colors"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Removing class:', id);
                                const newValue = (field.value || []).filter(v => v !== id);
                                field.onChange(newValue);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="program_ids"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Program (Opsional)</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Select
                    onValueChange={(value) => {
                      if (!field.value?.includes(value)) {
                        field.onChange([...(field.value || []), value]);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih program" />
                    </SelectTrigger>
                    <SelectContent>
                      {(programOptions || [])
                        .filter(p => !(field.value || []).includes(p.id))
                        .map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {(field.value || []).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {(field.value || []).map(id => {
                        const program = (programOptions || []).find(p => p.id === id);
                        return program ? (
                          <Badge key={id} variant="outline" className="flex items-center gap-1">
                            {program.name}
                            <button
                              type="button"
                              className="h-4 w-4 cursor-pointer hover:text-destructive hover:bg-destructive/10 rounded-sm flex items-center justify-center p-0 border-none bg-transparent transition-colors"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Removing program:', id);
                                const newValue = (field.value || []).filter(v => v !== id);
                                field.onChange(newValue);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_practice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Praktik</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
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
