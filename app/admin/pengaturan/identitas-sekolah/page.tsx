"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useBreadcrumb } from "@/contexts/admin";
import { MediaPickerDialog, MediaItem } from "@/components/media/media-picker-dialog";
import { Info, Globe, ImageIcon, AlertTriangle, Shield } from "lucide-react";

type Identity = {
  id?: string;
  name?: string;
  shortName?: string;
  schoolLevel?: string;
  npsn?: string;
  address?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  headmaster?: string;
  headmasterNIP?: string;
  accreditation?: string;
  establishedYear?: number;
  timezone?: string;
  language?: string;
  logoUrl?: string;
  logoDarkUrl?: string;
  faviconUrl?: string;
  coverImageUrl?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    x?: string;
    tiktok?: string;
    youtube?: string;
  };
};

type SocialKey = "instagram" | "facebook" | "x" | "tiktok" | "youtube";

export default function IdentitasSekolahPage() {
  const [data, setData] = useState<Identity>({ socialLinks: {} });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "web" | "branding">("info");
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerField, setMediaPickerField] = useState<
    "logo" | "logoDark" | "favicon" | "cover" | null
  >(null);
  const [confirmLevelChangeOpen, setConfirmLevelChangeOpen] = useState(false);
  const [pendingLevelChange, setPendingLevelChange] = useState<string | null>(null);
  const [confirmationCode, setConfirmationCode] = useState("");
  const breadcrumb = useBreadcrumb();
  const setBreadcrumbs = breadcrumb?.setBreadcrumbs;

  useEffect(() => {
    // set breadcrumbs for admin navigation using stable setter to avoid loops
    setBreadcrumbs?.([
      { label: "Pengaturan", href: "/admin/settings" },
      { label: "Identitas Sekolah" }
    ]);
  }, [setBreadcrumbs]);

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/settings/identitas-sekolah")
      .then(r => r.json())
      .then(res => {
        const d = res.data || {};
        if (!d.socialLinks) d.socialLinks = {};
        setData(d);
      })
      .catch(() => toast.error("Gagal memuat data identitas"))
      .finally(() => setLoading(false));
  }, []);

  function handleMediaSelect(item: MediaItem) {
    if (!mediaPickerField) return;
    const url = item.url;
    if (mediaPickerField === "logo") setData(prev => ({ ...prev, logoUrl: url }));
    if (mediaPickerField === "logoDark") setData(prev => ({ ...prev, logoDarkUrl: url }));
    if (mediaPickerField === "favicon") setData(prev => ({ ...prev, faviconUrl: url }));
    if (mediaPickerField === "cover") setData(prev => ({ ...prev, coverImageUrl: url }));
    setMediaPickerOpen(false);
    setMediaPickerField(null);
  }

  function handleLevelChangeRequest(newLevel: string) {
    if (newLevel !== data.schoolLevel) {
      setPendingLevelChange(newLevel);
      setConfirmLevelChangeOpen(true);
      setConfirmationCode("");
    }
  }

  async function handleLevelChangeConfirm() {
    if (!pendingLevelChange) return;

    // Validate confirmation code (NPSN)
    if (confirmationCode !== data.npsn) {
      toast.error("Kode konfirmasi tidak valid. Masukkan NPSN sekolah.");
      return;
    }

    try {
      setSaving(true);
      const payload = { ...data, schoolLevel: pendingLevelChange };
      const res = await fetch("/api/admin/settings/identitas-sekolah", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json?.error) throw new Error(json.error || "Server error");
      setData(json.data || payload);
      toast.success("Jenjang sekolah berhasil diubah");
      setConfirmLevelChangeOpen(false);
      setPendingLevelChange(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg || "Gagal mengubah jenjang");
    } finally {
      setSaving(false);
    }
  }

  async function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...data };
      const res = await fetch("/api/admin/settings/identitas-sekolah", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json?.error) throw new Error(json.error || "Server error");
      setData(json.data || payload);
      toast.success("Identitas sekolah berhasil disimpan");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg || "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Identitas Sekolah</h1>
        <p className="text-muted-foreground">
          Kelola data identitas sekolah, kontak, media sosial, dan branding.
        </p>
      </div>

      <div>
        <nav className="flex gap-4 mb-4" aria-label="Tabs">
          {(
            [
              { key: "info", label: "Informasi Sekolah", icon: Info },
              { key: "web", label: "Web & Media Sosial", icon: Globe },
              { key: "branding", label: "Logo & Branding", icon: ImageIcon }
            ] as const
          ).map(t => {
            const isActive = (activeTab || "info") === t.key;
            const Icon = t.icon as React.ComponentType<React.SVGProps<SVGSVGElement>>;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                )}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </nav>

        <div className="rounded-3xl border border-card bg-card p-8 shadow space-y-6">
          <div className="py-2">
            <div className="mb-6">
              {activeTab === "info" && (
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Informasi Sekolah</h2>
                  <p className="text-muted-foreground">
                    Kelola nama, alamat, kontak, serta informasi umum sekolah.
                  </p>
                </div>
              )}

              {activeTab === "web" && (
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Web & Media Sosial</h2>
                  <p className="text-muted-foreground">
                    Atur tautan ke website dan akun media sosial sekolah.
                  </p>
                </div>
              )}

              {activeTab === "branding" && (
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Logo & Branding</h2>
                  <p className="text-muted-foreground">
                    Unggah logo, favicon, dan gambar cover untuk tema sekolah.
                  </p>
                </div>
              )}
            </div>
            {activeTab === "info" && (
              <div className="space-y-6">
                {/* Card Jenjang Sekolah */}
                <Card className="border-amber-200 bg-amber-50/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-amber-800">
                      <Shield className="h-5 w-5" />
                      Jenjang Sekolah
                    </CardTitle>
                    <CardDescription className="text-amber-700">
                      Pengaturan jenjang sekolah mempengaruhi struktur kelas dan program akademik.
                      Perubahan jenjang memerlukan konfirmasi khusus.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-foreground">
                          Jenjang Saat Ini
                        </label>
                        <div className="mt-2 px-3 py-2 bg-white border border-amber-200 rounded-md text-sm font-medium">
                          {data.schoolLevel || "Belum ditentukan"}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-foreground">
                          Ubah Jenjang
                        </label>
                        <Select
                          value={data.schoolLevel || "SD"}
                          onValueChange={handleLevelChangeRequest}
                        >
                          <SelectTrigger className="mt-2 w-full">
                            <SelectValue placeholder="Pilih jenjang sekolah" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SD">SD (Sekolah Dasar)</SelectItem>
                            <SelectItem value="MI">MI (Madrasah Ibtidaiyah)</SelectItem>
                            <SelectItem value="SMP">SMP (Sekolah Menengah Pertama)</SelectItem>
                            <SelectItem value="MTS">MTS (Madrasah Tsanawiyah)</SelectItem>
                            <SelectItem value="SMA">SMA (Sekolah Menengah Atas)</SelectItem>
                            <SelectItem value="MA">MA (Madrasah Aliyah)</SelectItem>
                            <SelectItem value="SMK">SMK (Sekolah Menengah Kejuruan)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          Mengubah jenjang akan memerlukan konfirmasi dengan NPSN sekolah
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Form Informasi Sekolah */}
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground">
                        Nama Sekolah
                      </label>
                      <Input
                        value={data.name || ""}
                        onChange={e => setData({ ...data, name: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground">
                        Nama Singkat
                      </label>
                      <Input
                        value={data.shortName || ""}
                        onChange={e => setData({ ...data, shortName: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground">NPSN</label>
                      <Input
                        value={data.npsn || ""}
                        onChange={e => setData({ ...data, npsn: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground">
                        Akreditasi
                      </label>
                      <Input
                        value={data.accreditation || ""}
                        onChange={e => setData({ ...data, accreditation: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground">
                        Tahun Berdiri
                      </label>
                      <Input
                        value={data.establishedYear?.toString() || ""}
                        onChange={e =>
                          setData({ ...data, establishedYear: Number(e.target.value) })
                        }
                        className="mt-2"
                        type="number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground">Alamat</label>
                    <Textarea
                      value={data.address || ""}
                      onChange={e => setData({ ...data, address: e.target.value })}
                      className="mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground">
                        Kode Pos
                      </label>
                      <Input
                        value={data.postalCode || ""}
                        onChange={e => setData({ ...data, postalCode: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground">Telepon</label>
                      <Input
                        value={data.phone || ""}
                        onChange={e => setData({ ...data, phone: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground">Email</label>
                      <Input
                        value={data.email || ""}
                        onChange={e => setData({ ...data, email: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground">Website</label>
                      <Input
                        value={data.website || ""}
                        onChange={e => setData({ ...data, website: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground">
                        Kepala Sekolah
                      </label>
                      <Input
                        value={data.headmaster || ""}
                        onChange={e => setData({ ...data, headmaster: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => window.location.reload()}
                    >
                      Reset
                    </Button>
                    <div className="ml-3">
                      <Button type="submit" disabled={saving}>
                        {saving ? "Menyimpan..." : "Simpan Informasi"}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "web" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Media Sosial</h3>
                <p className="text-sm text-muted-foreground">
                  Masukkan username atau URL untuk masing-masing platform.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full table-fixed border-collapse">
                    <thead>
                      <tr className="text-sm text-muted-foreground text-left border-b">
                        <th className="py-2 w-40">Platform</th>
                        <th className="py-2">Handler / URL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(
                        [
                          ["instagram", "Instagram"],
                          ["facebook", "Facebook"],
                          ["x", "X (Twitter)"],
                          ["tiktok", "TikTok"],
                          ["youtube", "YouTube"]
                        ] as [SocialKey, string][]
                      ).map(([key, label]) => (
                        <tr key={key} className="border-b">
                          <td className="py-3 align-top text-sm font-medium">{label}</td>
                          <td className="py-2">
                            <Input
                              value={data.socialLinks?.[key] ?? ""}
                              onChange={e =>
                                setData({
                                  ...data,
                                  socialLinks: {
                                    ...(data.socialLinks || {}),
                                    [key]: e.target.value
                                  }
                                })
                              }
                              className="mt-1"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setData({ ...data, socialLinks: {} })}
                  >
                    Reset
                  </Button>
                  <div className="ml-3">
                    <Button onClick={() => handleSave()} disabled={saving}>
                      {saving ? "Menyimpan..." : "Simpan Media Sosial"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "branding" && (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground">
                      Logo (light)
                    </label>
                    <div className="mt-2 flex gap-2 items-center">
                      {data.logoUrl ? (
                        <Image
                          src={data.logoUrl}
                          alt="logo"
                          width={128}
                          height={48}
                          className="object-contain h-12"
                        />
                      ) : (
                        <div className="h-12 w-32 bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground">
                          Belum ada
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={() => {
                            setMediaPickerField("logo");
                            setMediaPickerOpen(true);
                          }}
                        >
                          Pilih / Unggah
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setData({ ...data, logoUrl: "" })}
                        >
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground">
                      Logo (dark)
                    </label>
                    <div className="mt-2 flex gap-2 items-center">
                      {data.logoDarkUrl ? (
                        <Image
                          src={data.logoDarkUrl}
                          alt="logo-dark"
                          width={128}
                          height={48}
                          className="object-contain h-12"
                        />
                      ) : (
                        <div className="h-12 w-32 bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground">
                          Belum ada
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={() => {
                            setMediaPickerField("logoDark");
                            setMediaPickerOpen(true);
                          }}
                        >
                          Pilih / Unggah
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setData({ ...data, logoDarkUrl: "" })}
                        >
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground">Favicon</label>
                    <div className="mt-2 flex gap-2 items-center">
                      {data.faviconUrl ? (
                        <Image
                          src={data.faviconUrl}
                          alt="favicon"
                          width={32}
                          height={32}
                          className="object-contain h-8 w-8"
                        />
                      ) : (
                        <div className="h-8 w-8 bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground">
                          -
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={() => {
                            setMediaPickerField("favicon");
                            setMediaPickerOpen(true);
                          }}
                        >
                          Pilih / Unggah
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setData({ ...data, faviconUrl: "" })}
                        >
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground">
                      Cover Image
                    </label>
                    <div className="mt-2 flex gap-2 items-center">
                      {data.coverImageUrl ? (
                        <Image
                          src={data.coverImageUrl}
                          alt="cover"
                          width={320}
                          height={80}
                          className="object-cover h-20 rounded-md"
                        />
                      ) : (
                        <div className="h-20 w-full bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground">
                          Belum ada
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={() => {
                            setMediaPickerField("cover");
                            setMediaPickerOpen(true);
                          }}
                        >
                          Pilih / Unggah
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setData({ ...data, coverImageUrl: "" })}
                        >
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      setData({
                        ...data,
                        logoUrl: "",
                        logoDarkUrl: "",
                        faviconUrl: "",
                        coverImageUrl: ""
                      })
                    }
                  >
                    Reset
                  </Button>
                  <div className="ml-3">
                    <Button type="submit" disabled={saving}>
                      {saving ? "Menyimpan..." : "Simpan Branding"}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <MediaPickerDialog
        open={mediaPickerOpen}
        onOpenChange={v => setMediaPickerOpen(v)}
        onSelect={handleMediaSelect}
        selectedId={null}
        title="Unggah / pilih gambar"
      />

      <Dialog open={confirmLevelChangeOpen} onOpenChange={setConfirmLevelChangeOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Konfirmasi Perubahan Jenjang
            </DialogTitle>
            <DialogDescription>
              Mengubah jenjang sekolah akan mempengaruhi struktur kelas dan program akademik.
              Pastikan jenjang yang dipilih sudah benar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="current-level" className="text-sm font-medium">
                Jenjang Saat Ini
              </label>
              <div className="px-3 py-2 bg-muted rounded-md text-sm">{data.schoolLevel}</div>
            </div>
            <div className="grid gap-2">
              <label htmlFor="new-level" className="text-sm font-medium">
                Jenjang Baru
              </label>
              <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
                {pendingLevelChange}
              </div>
            </div>
            <div className="grid gap-2">
              <label
                htmlFor="confirmation-code"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Kode Konfirmasi (NPSN)
              </label>
              <Input
                id="confirmation-code"
                type="text"
                placeholder="Masukkan NPSN sekolah"
                value={confirmationCode}
                onChange={e => setConfirmationCode(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Masukkan NPSN ({data.npsn}) untuk mengkonfirmasi perubahan
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setConfirmLevelChangeOpen(false);
                setPendingLevelChange(null);
                setConfirmationCode("");
              }}
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleLevelChangeConfirm}
              disabled={saving || confirmationCode !== data.npsn}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {saving ? "Memproses..." : "Konfirmasi & Ubah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loading ? <p className="text-sm text-muted-foreground">Memuat data...</p> : null}
    </div>
  );
}
