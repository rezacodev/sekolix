"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save } from "lucide-react";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useModalDialog } from "../hooks/useModalDialog";

interface MissionItem {
  text: string;
}

interface PageData {
  vision?: string;
  missions?: MissionItem[];
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

export default function VisiMisiEditor({ pageId }: { pageId: string }) {
  const router = useRouter();
  const [page, setPage] = useState<Page | null>(null);
  const [vision, setVision] = useState("");
  const [missions, setMissions] = useState<MissionItem[]>([]);
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { modal, showConfirm, closeModal } = useModalDialog();

  const fetchPage = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/landing-website/pages/${pageId}`);
      if (response.ok) {
        const data = (await response.json()) as Page;
        setPage(data);
        setContent(data.content);
        if (data.data) {
          setVision(data.data.vision || "");
          setMissions(data.data.missions || []);
        }
      }
    } catch (error) {
      console.error("Error fetching page:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  const handleAddMission = () => {
    setMissions([...missions, { text: "" }]);
  };

  const handleRemoveMission = (index: number) => {
    showConfirm("Hapus Misi?", "Misi ini akan dihapus dan tidak dapat dipulihkan.", () => {
      setMissions(missions.filter((_, i) => i !== index));
    });
  };

  const handleMissionChange = (index: number, value: string) => {
    const newMissions = [...missions];
    newMissions[index] = { text: value };
    setMissions(newMissions);
  };

  const handleSave = async () => {
    if (!page) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/landing-website/pages/${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: page.title,
          slug: "visi-misi",
          content,
          description: page.description,
          isPublished: page.isPublished,
          data: { vision, missions }
        })
      });

      if (response.ok) {
        toast.success("Halaman Visi & Misi berhasil disimpan");
        router.push("/admin/landing-website/pages");
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
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit Visi & Misi</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Kelola visi, misi, dan konten tambahan halaman
            </p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="ml-4 mt-1">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>

        {/* Vision Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Visi Sekolah</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="vision" className="text-sm mb-2 block">
              Pernyataan Visi
            </Label>
            <textarea
              id="vision"
              value={vision}
              onChange={e => setVision(e.target.value)}
              placeholder="Masukkan pernyataan visi sekolah..."
              className="w-full px-3 py-2 border border-card rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary mt-2 bg-card text-foreground"
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Missions Editor */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Misi Sekolah</CardTitle>
            <Button onClick={handleAddMission} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Misi
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {missions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Belum ada misi. Tambahkan misi pertama Anda.
              </p>
            ) : (
              missions.map((mission, index) => (
                <div key={index} className="p-4 border border-card rounded-lg space-y-3 bg-card">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <Label htmlFor={`mission-${index}`} className="text-sm mb-2 block">
                        Misi {index + 1}
                      </Label>
                      <textarea
                        id={`mission-${index}`}
                        value={mission.text}
                        onChange={e => handleMissionChange(index, e.target.value)}
                        placeholder="Masukkan pernyataan misi..."
                        className="w-full px-3 py-2 border border-card rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary mt-2 bg-card text-foreground"
                        rows={2}
                      />
                    </div>
                    <Button
                      onClick={() => handleRemoveMission(index)}
                      variant="destructive"
                      size="sm"
                      className="mt-6"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Additional Content */}
        <Card>
          <CardHeader>
            <CardTitle>Konten Tambahan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="content" className="mb-2 block">
                Penjelasan atau Konten Lainnya
              </Label>
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Konten tambahan halaman..."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
