"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save } from "lucide-react";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useModalDialog } from "../hooks/useModalDialog";

interface TimelineItem {
  year: string;
  title: string;
  description: string;
}

interface PageData {
  timeline?: TimelineItem[];
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

export default function SejarahEditor({ pageId }: { pageId: string }) {
  const router = useRouter();
  const [page, setPage] = useState<Page | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { modal, showConfirm, closeModal } = useModalDialog();

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`/api/admin/landing-website/pages/${pageId}`);
        if (response.ok) {
          const data = (await response.json()) as Page;
          setPage(data);
          setContent(data.content);
          if (data.data?.timeline) {
            setTimeline(data.data.timeline);
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

  const handleAddTimelineItem = () => {
    setTimeline([...timeline, { year: "", title: "", description: "" }]);
  };

  const handleRemoveTimelineItem = (index: number) => {
    showConfirm("Hapus Timeline?", "Timeline ini akan dihapus dan tidak dapat dipulihkan.", () => {
      setTimeline(timeline.filter((_, i) => i !== index));
    });
  };

  const handleTimelineChange = (index: number, field: keyof TimelineItem, value: string) => {
    const newTimeline = [...timeline];
    newTimeline[index] = { ...newTimeline[index], [field]: value };
    setTimeline(newTimeline);
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
          slug: "sejarah",
          content,
          description: page.description,
          isPublished: page.isPublished,
          data: { timeline }
        })
      });

      if (response.ok) {
        toast.success("Halaman Sejarah berhasil disimpan");
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
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit Sejarah</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Kelola konten dan timeline halaman Sejarah
            </p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="ml-4 mt-1">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>

        {/* Content Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Konten Utama</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="content" className="mb-2 block">
                Deskripsi Halaman
              </Label>
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Masukkan deskripsi halaman sejarah..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Timeline Editor */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Timeline Sejarah</CardTitle>
            <Button onClick={handleAddTimelineItem} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Timeline
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Belum ada timeline. Tambahkan timeline pertama Anda.
              </p>
            ) : (
              timeline.map((item, index) => (
                <div key={index} className="p-4 border border-card rounded-lg space-y-3 bg-card">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor={`year-${index}`} className="text-sm mb-2 block">
                        Tahun
                      </Label>
                      <Input
                        id={`year-${index}`}
                        value={item.year}
                        onChange={e => handleTimelineChange(index, "year", e.target.value)}
                        placeholder="Cth: 1985"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <Label htmlFor={`title-${index}`} className="text-sm mb-2 block">
                        Judul
                      </Label>
                      <Input
                        id={`title-${index}`}
                        value={item.title}
                        onChange={e => handleTimelineChange(index, "title", e.target.value)}
                        placeholder="Cth: Pendirian Sekolah"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={`desc-${index}`} className="text-sm mb-2 block">
                      Deskripsi
                    </Label>
                    <textarea
                      id={`desc-${index}`}
                      value={item.description}
                      onChange={e => handleTimelineChange(index, "description", e.target.value)}
                      placeholder="Tuliskan deskripsi timeline..."
                      className="w-full px-3 py-2 border border-card rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-card text-foreground"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleRemoveTimelineItem(index)}
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
