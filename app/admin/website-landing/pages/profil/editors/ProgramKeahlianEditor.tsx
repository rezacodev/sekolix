"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useModalDialog } from "../hooks/useModalDialog";

interface Program {
  name: string;
  code: string;
  description: string;
  duration: string;
}

interface PageData {
  programs?: Program[];
}

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  description: string;
  data: PageData | null;
  isPublished: boolean;
  isVisible: boolean;
}

export default function ProgramKeahlianEditor({ pageId }: { pageId: string }) {
  const router = useRouter();
  const [page, setPage] = useState<Page | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { modal, showConfirm, closeModal } = useModalDialog();

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`/api/admin/website-landing/pages/${pageId}`);
        if (response.ok) {
          const data = (await response.json()) as Page;
          setPage(data);
          if (data.data?.programs) {
            setPrograms(data.data.programs);
          }
        }
      } catch (error) {
        console.error("Error fetching page:", error);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [pageId]);

  const handleAddProgram = () => {
    setPrograms([
      ...programs,
      { name: "", code: "", description: "", duration: "3 Tahun" },
    ]);
  };

  const handleRemoveProgram = (index: number) => {
    showConfirm(
      "Hapus Program?",
      "Program ini akan dihapus dan tidak dapat dipulihkan.",
      () => {
        setPrograms(programs.filter((_, i) => i !== index));
      }
    );
  };

  const handleProgramChange = (
    index: number,
    field: keyof Program,
    value: string
  ) => {
    const newPrograms = [...programs];
    newPrograms[index] = { ...newPrograms[index], [field]: value };
    setPrograms(newPrograms);
  };

  const handleSave = async () => {
    if (!page) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/website-landing/pages/${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: page.title,
          slug: "program-keahlian",
          content: page.content,
          description: page.description,
          isPublished: page.isPublished,
          data: { programs },
        }),
      });

      if (response.ok) {
        toast.success("Halaman Program Keahlian berhasil disimpan");
        router.push("/admin/website-landing/pages");
        router.refresh();
      } else {
        const data = await response.json();
        toast.error(data.message || "Gagal menyimpan halaman");
      }
    } catch (error) {
      console.error("Error saving page:", error);
      toast.error("Terjadi kesalahan saat menyimpan");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Memuat data halaman...</div>;
  }

  return (
    <>
      <ConfirmDialog
        open={modal.isOpen && modal.type === "confirm"}
        title={modal.title || ""}
        description={modal.message}
        confirmText="Hapus"
        cancelText="Batal"
        isDestructive={true}
        onConfirm={() => {
          modal.onConfirm?.();
          closeModal();
        }}
        onCancel={() => {
          modal.onCancel?.();
          closeModal();
        }}
      />
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit Program Keahlian</h1>
          <p className="mt-1 text-sm text-muted-foreground">Kelola program-program keahlian yang tersedia</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="ml-4 mt-1">
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>

      {/* Programs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Daftar Program Keahlian</CardTitle>
          <Button onClick={handleAddProgram} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Program
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {programs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Belum ada program keahlian. Tambahkan program pertama Anda.</p>
          ) : (
            programs.map((program, index) => (
              <div
                key={index}
                className="p-4 border border-card rounded-lg space-y-3 bg-card"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`prog-name-${index}`} className="text-sm mb-2 block">
                      Nama Program
                    </Label>
                    <Input
                      id={`prog-name-${index}`}
                      value={program.name}
                      onChange={(e) =>
                        handleProgramChange(index, "name", e.target.value)
                      }
                      placeholder="Cth: Teknik Otomotif"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`prog-code-${index}`} className="text-sm mb-2 block">
                      Kode Program
                    </Label>
                    <Input
                      id={`prog-code-${index}`}
                      value={program.code}
                      onChange={(e) =>
                        handleProgramChange(index, "code", e.target.value)
                      }
                      placeholder="Cth: 071100"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`prog-duration-${index}`} className="text-sm mb-2 block">
                    Durasi
                  </Label>
                  <Input
                    id={`prog-duration-${index}`}
                    value={program.duration}
                    onChange={(e) =>
                      handleProgramChange(index, "duration", e.target.value)
                    }
                    placeholder="Cth: 3 Tahun"
                  />
                </div>

                <div>
                  <Label htmlFor={`prog-desc-${index}`} className="text-sm mb-2 block">
                    Deskripsi
                  </Label>
                    <textarea
                    id={`prog-desc-${index}`}
                    value={program.description}
                    onChange={(e) =>
                      handleProgramChange(index, "description", e.target.value)
                    }
                    placeholder="Deskripsi program keahlian..."
                    className="w-full px-3 py-2 border border-card rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary mt-2"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => handleRemoveProgram(index)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Hapus
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
