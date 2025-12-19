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

interface LeadershipItem {
  position: string;
  name: string;
  department?: string;
  email?: string;
  phone?: string;
}

interface PageData {
  headmaster?: LeadershipItem;
  vicePrincipals?: LeadershipItem[];
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

export default function StrukturEditor({ pageId }: { pageId: string }) {
  const router = useRouter();
  const [page, setPage] = useState<Page | null>(null);
  const [headmaster, setHeadmaster] = useState<LeadershipItem>({
    position: "Kepala Sekolah",
    name: "",
  });
  const [vicePrincipals, setVicePrincipals] = useState<LeadershipItem[]>([]);
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
          if (data.data) {
            if (data.data.headmaster) {
              setHeadmaster(data.data.headmaster);
            }
            if (data.data.vicePrincipals) {
              setVicePrincipals(data.data.vicePrincipals);
            }
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

  const handleAddVicePrincipal = () => {
    setVicePrincipals([
      ...vicePrincipals,
      { position: "Wakil Kepala Sekolah", name: "", department: "", email: "", phone: "" },
    ]);
  };

  const handleRemoveVicePrincipal = (index: number) => {
    showConfirm(
      "Hapus Wakil Kepala Sekolah?",
      "Data ini akan dihapus dan tidak dapat dipulihkan.",
      () => {
        setVicePrincipals(vicePrincipals.filter((_, i) => i !== index));
      }
    );
  };

  const handleHeadmasterChange = (field: keyof LeadershipItem, value: string) => {
    setHeadmaster({ ...headmaster, [field]: value });
  };

  const handleVicePrincipalChange = (
    index: number,
    field: keyof LeadershipItem,
    value: string
  ) => {
    const newVicePrincipals = [...vicePrincipals];
    newVicePrincipals[index] = { ...newVicePrincipals[index], [field]: value };
    setVicePrincipals(newVicePrincipals);
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
          slug: "struktur",
          content: page.content,
          description: page.description,
          isPublished: page.isPublished,
          data: { headmaster, vicePrincipals },
        }),
      });

      if (response.ok) {
        toast.success("Halaman Struktur Organisasi berhasil disimpan");
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit Struktur Organisasi</h1>
          <p className="mt-1 text-sm text-muted-foreground">Kelola data kepala sekolah dan wakil kepala sekolah</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="ml-4 mt-1">
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>

      {/* Kepala Sekolah */}
      <Card>
        <CardHeader>
          <CardTitle>Kepala Sekolah</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hm-name" className="mb-2 block">Nama Lengkap</Label>
              <Input
                id="hm-name"
                value={headmaster.name}
                onChange={(e) => handleHeadmasterChange("name", e.target.value)}
                placeholder="Cth: Drs. Ahmad Prasetyo, M.Pd"
              />
            </div>
            <div>
              <Label htmlFor="hm-email" className="mb-2 block">Email</Label>
              <Input
                id="hm-email"
                type="email"
                value={headmaster.email || ""}
                onChange={(e) => handleHeadmasterChange("email", e.target.value)}
                placeholder="email@sekolah.sch.id"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="hm-phone" className="mb-2 block">Telepon</Label>
            <Input
              id="hm-phone"
              value={headmaster.phone || ""}
              onChange={(e) => handleHeadmasterChange("phone", e.target.value)}
              placeholder="+62 xxx xxxx xxxx"
            />
          </div>
        </CardContent>
      </Card>

      {/* Wakil Kepala Sekolah */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Wakil Kepala Sekolah</CardTitle>
          <Button onClick={handleAddVicePrincipal} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Wakil
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {vicePrincipals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Belum ada wakil kepala sekolah.</p>
          ) : (
            vicePrincipals.map((vp, index) => (
              <div
                key={index}
                className="p-4 border border-card rounded-lg space-y-3 bg-card"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`vp-name-${index}`} className="text-sm mb-2 block">
                      Nama Lengkap
                    </Label>
                    <Input
                      id={`vp-name-${index}`}
                      value={vp.name}
                      onChange={(e) =>
                        handleVicePrincipalChange(index, "name", e.target.value)
                      }
                      placeholder="Nama lengkap"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`vp-dept-${index}`} className="text-sm mb-2 block">
                      Bidang
                    </Label>
                    <Input
                      id={`vp-dept-${index}`}
                      value={vp.department || ""}
                      onChange={(e) =>
                        handleVicePrincipalChange(index, "department", e.target.value)
                      }
                      placeholder="Cth: Bidang Kurikulum"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`vp-email-${index}`} className="text-sm mb-2 block">
                      Email
                    </Label>
                    <Input
                      id={`vp-email-${index}`}
                      type="email"
                      value={vp.email || ""}
                      onChange={(e) =>
                        handleVicePrincipalChange(index, "email", e.target.value)
                      }
                      placeholder="email@sekolah.sch.id"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`vp-phone-${index}`} className="text-sm mb-2 block">
                      Telepon
                    </Label>
                    <Input
                      id={`vp-phone-${index}`}
                      value={vp.phone || ""}
                      onChange={(e) =>
                        handleVicePrincipalChange(index, "phone", e.target.value)
                      }
                      placeholder="+62 xxx xxxx xxxx"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleRemoveVicePrincipal(index)}
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
