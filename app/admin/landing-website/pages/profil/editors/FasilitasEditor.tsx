"use client";

/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save, Image as ImageIcon } from "lucide-react";
import { MediaPickerDialog } from "@/components/media/media-picker-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useModalDialog } from "../hooks/useModalDialog";

interface FacilityItem {
  name: string;
  description: string;
  image: string;
}

interface FacilityCategory {
  title: string;
  items: FacilityItem[];
}

interface PageData {
  categories?: FacilityCategory[];
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

export default function FasilitasEditor({ pageId }: { pageId: string }) {
  const router = useRouter();
  const [page, setPage] = useState<Page | null>(null);
  const [categories, setCategories] = useState<FacilityCategory[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [selectedItemForImage, setSelectedItemForImage] = useState<{
    catIndex: number;
    itemIndex: number;
  } | null>(null);
  const { modal, showConfirm, closeModal } = useModalDialog();

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`/api/admin/landing-website/pages/${pageId}`);
        if (response.ok) {
          const data = (await response.json()) as Page;
          setPage(data);
          if (data.data?.categories) {
            setCategories(data.data.categories);
          } else {
            // Initialize with empty default category
            setCategories([{ title: "Workshop & Laboratorium", items: [] }]);
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

  const handleAddCategory = () => {
    setCategories([...categories, { title: "Kategori Baru", items: [] }]);
  };

  const handleRemoveCategory = (catIndex: number) => {
    showConfirm(
      "Hapus Kategori?",
      "Kategori dan semua item di dalamnya akan dihapus dan tidak dapat dipulihkan.",
      () => {
        setCategories(categories.filter((_, i) => i !== catIndex));
      }
    );
  };

  const handleCategoryTitleChange = (index: number, value: string) => {
    const newCategories = [...categories];
    newCategories[index] = { ...newCategories[index], title: value };
    setCategories(newCategories);
  };

  const handleAddItem = (catIndex: number) => {
    const newCategories = [...categories];
    newCategories[catIndex].items.push({
      name: "",
      description: "",
      image: ""
    });
    setCategories(newCategories);
  };

  const handleRemoveItem = (catIndex: number, itemIndex: number) => {
    showConfirm(
      "Hapus Item Fasilitas?",
      "Item ini akan dihapus dan tidak dapat dipulihkan.",
      () => {
        const newCategories = [...categories];
        newCategories[catIndex].items = newCategories[catIndex].items.filter(
          (_, i) => i !== itemIndex
        );
        setCategories(newCategories);
      }
    );
  };

  const handleItemChange = (
    catIndex: number,
    itemIndex: number,
    field: keyof FacilityItem,
    value: string
  ) => {
    const newCategories = [...categories];
    newCategories[catIndex].items[itemIndex] = {
      ...newCategories[catIndex].items[itemIndex],
      [field]: value
    };
    setCategories(newCategories);
  };

  const handleSelectImageFromMedia = (media: unknown) => {
    if (!selectedItemForImage) return;

    // Type guard for media object
    if (typeof media !== "object" || media === null || !("url" in media)) {
      console.error("Invalid media object");
      return;
    }

    const newCategories = [...categories];
    newCategories[selectedItemForImage.catIndex].items[selectedItemForImage.itemIndex].image = (
      media as { url: string }
    ).url;
    setCategories(newCategories);
    setIsMediaPickerOpen(false);
    setSelectedItemForImage(null);
  };

  const openMediaPicker = (catIndex: number, itemIndex: number) => {
    setSelectedItemForImage({ catIndex, itemIndex });
    setIsMediaPickerOpen(true);
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
          slug: "fasilitas",
          content: page.content,
          description: page.description,
          isPublished: page.isPublished,
          data: { categories }
        })
      });

      if (response.ok) {
        toast.success("Halaman Fasilitas berhasil disimpan");
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
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit Fasilitas</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Kelola fasilitas dan infrastruktur sekolah
            </p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="ml-4 mt-1">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>

        {/* Facilities */}
        {categories.map((category, catIndex) => (
          <Card key={catIndex}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex-1">
                <Label htmlFor={`cat-title-${catIndex}`} className="text-sm">
                  Kategori {catIndex + 1}
                </Label>
                <Input
                  id={`cat-title-${catIndex}`}
                  value={category.title}
                  onChange={e => handleCategoryTitleChange(catIndex, e.target.value)}
                  className="mt-2"
                />
              </div>
              <div className="flex gap-2 ml-4">
                <Button onClick={() => handleAddItem(catIndex)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Item
                </Button>
                <Button
                  onClick={() => handleRemoveCategory(catIndex)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {category.items.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Belum ada item dalam kategori ini.
                </p>
              ) : (
                category.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="p-4 border border-card rounded-lg space-y-3 bg-card"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor={`item-name-${catIndex}-${itemIndex}`}
                          className="text-sm mb-2 block"
                        >
                          Nama Fasilitas
                        </Label>
                        <Input
                          id={`item-name-${catIndex}-${itemIndex}`}
                          value={item.name}
                          onChange={e =>
                            handleItemChange(catIndex, itemIndex, "name", e.target.value)
                          }
                          placeholder="Cth: Workshop Otomotif"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor={`item-image-${catIndex}-${itemIndex}`}
                          className="text-sm mb-2 block"
                        >
                          Gambar Fasilitas
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id={`item-image-${catIndex}-${itemIndex}`}
                            value={item.image}
                            onChange={e =>
                              handleItemChange(catIndex, itemIndex, "image", e.target.value)
                            }
                            placeholder="https://... atau pilih dari media"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openMediaPicker(catIndex, itemIndex)}
                            className="whitespace-nowrap"
                          >
                            <ImageIcon className="h-4 w-4 mr-1" />
                            Pilih
                          </Button>
                        </div>
                        {item.image && (
                          <div className="mt-2 relative w-full h-32 rounded-md overflow-hidden bg-muted">
                            <img
                              src={item.image}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label
                        htmlFor={`item-desc-${catIndex}-${itemIndex}`}
                        className="text-sm mb-2 block"
                      >
                        Deskripsi
                      </Label>
                      <textarea
                        id={`item-desc-${catIndex}-${itemIndex}`}
                        value={item.description}
                        onChange={e =>
                          handleItemChange(catIndex, itemIndex, "description", e.target.value)
                        }
                        placeholder="Deskripsi fasilitas..."
                        className="w-full px-3 py-2 border border-card rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary mt-2 bg-card text-foreground"
                        rows={3}
                      />
                    </div>

                    {item.image && (
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-32 w-32 object-cover rounded-md"
                          onError={() => {
                            // Silently fail - just don't show image
                          }}
                        />
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button
                        onClick={() => handleRemoveItem(catIndex, itemIndex)}
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
        ))}

        {/* Add Category */}
        <div className="flex justify-center">
          <Button onClick={handleAddCategory} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Kategori
          </Button>
        </div>

        {/* Media Picker Dialog */}
        <MediaPickerDialog
          open={isMediaPickerOpen}
          onOpenChange={setIsMediaPickerOpen}
          onSelect={handleSelectImageFromMedia}
          title="Pilih Gambar Fasilitas"
        />
      </div>
    </>
  );
}
