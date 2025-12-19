"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface LandingSettings {
  id?: string;
  heroTitle: string;
  heroDescription: string | null;
  isApplyFormEnabled?: boolean;
}

export function LandingSettingsClient({
  initialSettings,
}: {
  initialSettings: LandingSettings | null;
}) {
  const [heroTitle, setHeroTitle] = useState(initialSettings?.heroTitle ?? "");
  const [heroDescription, setHeroDescription] = useState(
    initialSettings?.heroDescription ?? ""
  );
  const [isApplyFormEnabled, setIsApplyFormEnabled] = useState(
    initialSettings?.isApplyFormEnabled ?? true
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!heroTitle.trim()) {
      toast.error("Judul halaman pendaftaran wajib diisi.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        "/api/admin/penerimaan-siswa/settings/landing",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ heroTitle, heroDescription, isApplyFormEnabled }),
        }
      );

      if (response.ok) {
        toast.success("Pengaturan landing berhasil disimpan");
      } else {
        const data = await response.json();
        toast.error(data.message || "Gagal menyimpan pengaturan");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Terjadi kesalahan saat menyimpan pengaturan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-card bg-card p-8 shadow space-y-6">
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Landing</h2>
          <p className="text-muted-foreground">Gunakan pengaturan ini untuk mengendalikan teks hero yang tampil di halaman pendaftaran.</p>
        </div>
        <form onSubmit={handleSave} className="space-y-6">
          <label className="block text-sm font-semibold text-foreground">
            Judul Hero
            <Input
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="mt-2"
              required
            />
          </label>
          <label className="block text-sm font-semibold text-foreground">
            Deskripsi Hero
            <Textarea
              value={heroDescription}
              onChange={(e) => setHeroDescription(e.target.value)}
              rows={4}
              className="mt-2"
            />
          </label>
          <div className="rounded-lg border border-card bg-muted px-4 py-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                id="isApplyFormEnabled"
                checked={isApplyFormEnabled}
                onCheckedChange={(v) => setIsApplyFormEnabled(Boolean(v))}
              />
              <span className="text-sm font-semibold text-foreground">Aktifkan Form Pendaftaran di Landing</span>
            </label>
            <p className="mt-2 text-xs text-muted-foreground">Jika diaktifkan, form pendaftaran akan ditampilkan di halaman apply. Jika dinonaktifkan, form akan tersembunyi tapi halaman masih bisa diakses.</p>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading}
              variant="default"
              size="default"
            >
              {isLoading ? "Menyimpan..." : "Simpan Pengaturan"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
