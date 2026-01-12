"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { Loader2, Users, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const schema = z.object({
  rombelId: z.string().min(1, "Rombel wajib dipilih")
});

type FormData = z.infer<typeof schema>;

interface Rombel {
  id: number; // Changed from string to number to match API
  name: string;
  class: { id: number; name: string };
  program: { id: string; name: string };
  capacity?: number;
  student_count: number;
  availableSlots?: number;
  _count?: { students: number }; // Added optional _count for API response
}

interface AssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStudents: Array<{ id: string; fullName: string; classGroup?: { name?: string | null } | null }>;
  onSuccess: () => void;
}

export default function AssignmentModal({
  open,
  onOpenChange,
  selectedStudents,
  onSuccess
}: AssignmentModalProps) {
  const [rombels, setRombels] = useState<Rombel[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [activeYear, setActiveYear] = useState<{ id: string; label: string } | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      rombelId: ""
    }
  });

  const fetchActiveYear = async () => {
    try {
      const response = await fetch("/api/admin/penerimaan-siswa/settings/years");
      if (response.ok) {
        const data = await response.json();
        const active = data.find((y: { isActive: boolean }) => y.isActive);
        setActiveYear(active || null);
      }
    } catch (error) {
      console.error("Error fetching active year:", error);
    }
  };

  const fetchRombels = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL("/api/admin/manajemen-akademik/rombel", window.location.origin);
      url.searchParams.set("includeCapacity", "true");
      if (activeYear?.id) {
        url.searchParams.set("yearId", activeYear.id);
      }
      const response = await fetch(url.toString());
      if (response.ok) {
        const data = await response.json();
        // Calculate available slots and ensure proper data structure
        const groupsWithCapacity = data.data.map((group: Rombel) => {
          // Use _count.students if available, otherwise use student_count
          const currentCount = group._count?.students ?? group.student_count ?? 0;
          return {
            ...group,
            id: group.id.toString(),
            student_count: currentCount,
            availableSlots: group.capacity ? group.capacity - currentCount : undefined
          };
        });
        setRombels(groupsWithCapacity);
      }
    } catch (error) {
      console.error("Error fetching class groups:", error);
      toast.error("Gagal memuat data rombel");
    } finally {
      setLoading(false);
    }
  }, [activeYear]);

  useEffect(() => {
    if (open) {
      fetchActiveYear();
    }
  }, [open]);

  useEffect(() => {
    if (open && activeYear) {
      fetchRombels();
    }
  }, [open, activeYear, fetchRombels]);

  const onSubmit = async (data: FormData) => {
    // Prevent submission with placeholder values
    if (data.rombelId === "__loading__" || data.rombelId === "__empty__") {
      toast.error("Silakan pilih rombel yang valid");
      return;
    }

    setAssigning(true);
    try {
      const response = await fetch("/api/admin/manajemen-akademik/peserta-didik/bulk-assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentIds: selectedStudents.map(s => s.id),
          rombelId: data.rombelId
        })
      });

      if (response.ok) {
        toast.success(`Berhasil assign ${selectedStudents.length} siswa ke rombel`);
        onSuccess();
        onOpenChange(false);
        form.reset();
      } else {
        const error = await response.json();
        toast.error(error.message || "Gagal assign siswa ke rombel");
      }
    } catch (error) {
      console.error("Error assigning students:", error);
      toast.error("Terjadi kesalahan saat assign siswa");
    } finally {
      setAssigning(false);
    }
  };

  const selectedGroup = rombels.find(g => g.id.toString() === form.watch("rombelId"));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assign Siswa ke Rombel
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected Students Summary */}
          <div className="bg-muted p-3 rounded-lg">
            <h4 className="font-medium mb-2">
              Siswa yang akan di-assign ({selectedStudents.length})
            </h4>
            <div className="max-h-32 overflow-y-auto">
              {selectedStudents.slice(0, 5).map(student => (
                <div key={student.id} className="text-sm text-muted-foreground">
                  • {student.fullName}
                  {student.classGroup && (
                    <span className="text-orange-600"> (sudah di {student.classGroup.name})</span>
                  )}
                </div>
              ))}
              {selectedStudents.length > 5 && (
                <div className="text-sm text-muted-foreground">
                  ... dan {selectedStudents.length - 5} siswa lainnya
                </div>
              )}
            </div>
          </div>

          {/* Active Year Info */}
          {activeYear && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Rombel yang ditampilkan untuk Tahun Ajaran: <strong>{activeYear.label}</strong>
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="rombelId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pilih Rombel</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih rombel tujuan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loading ? (
                          <SelectItem value="__loading__" disabled>
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Memuat rombel...
                            </div>
                          </SelectItem>
                        ) : rombels.length > 0 ? (
                          rombels.map(group => (
                            <SelectItem key={group.id} value={group.id.toString()}>
                              <div className="flex items-center justify-between w-full">
                                <span>
                                  {group.name}
                                </span>
                                {group.availableSlots !== undefined && (
                                  <span
                                    className={`text-xs px-2 py-1 rounded ${
                                      group.availableSlots > 0
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {group.availableSlots} slot
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="__empty__" disabled>
                            Tidak ada rombel tersedia
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Capacity Warning */}
              {selectedGroup && selectedGroup.availableSlots !== undefined && (
                <Alert
                  className={
                    selectedGroup.availableSlots >= selectedStudents.length
                      ? "border-green-200"
                      : "border-orange-200"
                  }
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {selectedGroup.availableSlots >= selectedStudents.length ? (
                      <span className="text-green-800">
                        Kapasitas mencukupi ({selectedGroup.availableSlots} slot tersedia)
                      </span>
                    ) : (
                      <span className="text-orange-800">
                        Kapasitas tidak mencukupi.{" "}
                        {selectedStudents.length - selectedGroup.availableSlots} siswa akan melebihi
                        kapasitas.
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={assigning}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={
                    assigning ||
                    loading ||
                    form.watch("rombelId") === "__loading__" ||
                    form.watch("rombelId") === "__empty__"
                  }
                >
                  {assigning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Mengassign...
                    </>
                  ) : (
                    `Assign ${selectedStudents.length} Siswa`
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
