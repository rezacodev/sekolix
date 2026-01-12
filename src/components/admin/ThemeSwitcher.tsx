"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Eye, Monitor } from "lucide-react";
import { useRouter } from "next/navigation";

interface ThemeSwitcherProps {
  themes: Array<{
    id: string;
    themeId: string;
    isActive: boolean;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  }>;
}

const themeInfo = {
  "academic-classic": {
    name: "Klasik Akademis",
    description: "Desain tradisional dan profesional dengan warna biru laut dan emas",
    preview: "/academic-classic"
  },
  "modern-vibrant": {
    name: "Vibran Modern",
    description: "Desain berwarna dan dinamis dengan gradien cerah dan animasi",
    preview: "/modern-vibrant"
  },
  "minimalist-clean": {
    name: "Bersih Minimalis",
    description: "Desain sederhana dan elegan dengan palet monokrom dan interaksi halus",
    preview: "/minimalist-clean"
  }
};

export default function ThemeSwitcher({ themes }: ThemeSwitcherProps) {
  const router = useRouter();
  const [activeTheme, setActiveTheme] = useState(
    themes.find(t => t.isActive)?.themeId || "academic-classic"
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleActivateTheme = async (themeName: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/landing-website/theme/active", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ theme: themeName })
      });

      if (response.ok) {
        setActiveTheme(themeName);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to activate theme:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = (previewUrl: string) => {
    window.open(previewUrl, "_blank");
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Pengalih Tema</h2>
        <p className="text-slate-600">
          Pilih tema untuk halaman landing Anda. Tema aktif akan ditampilkan di beranda Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {themes.map(theme => {
          const info = themeInfo[theme.themeId as keyof typeof themeInfo];
          const isActive = activeTheme === theme.themeId;

          // Skip themes without info (custom themes from seed)
          if (!info) {
            return null;
          }

          // Get colors from database
          const colors = [theme.primaryColor, theme.secondaryColor, theme.accentColor];

          return (
            <Card
              key={theme.themeId}
              className={`relative overflow-hidden transition-all duration-300 ${
                isActive ? "ring-2 ring-blue-500 shadow-lg scale-105" : "hover:shadow-md"
              }`}
            >
              {/* Landing Page Preview */}
              <div
                className="h-64 bg-slate-100 relative overflow-hidden group cursor-pointer"
                onClick={() => handlePreview(info.preview)}
              >
                <iframe
                  src={info.preview}
                  className="absolute border-0 pointer-events-none"
                  style={{
                    width: "400%",
                    height: "400%",
                    transform: "scale(0.25)",
                    transformOrigin: "top left",
                    left: 0,
                    top: 0
                  }}
                  title={`Preview of ${info.name}`}
                />
                {/* Overlay with hover effect */}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 z-10">
                  <div className="flex items-center gap-2 text-white text-sm font-semibold">
                    <Monitor className="w-4 h-4" />
                    <span>Klik untuk melihat pratinjau lengkap</span>
                  </div>
                </div>
              </div>

              {/* Color Preview */}
              <div className="h-16 flex">
                {colors.map((color, index) => (
                  <div
                    key={index}
                    className="flex-1 relative group/color"
                    style={{ backgroundColor: color }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/color:opacity-100 transition-opacity">
                      <span className="text-xs font-mono text-white bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                        {color}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Active Badge */}
              {isActive && (
                <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg z-10">
                  <Check className="w-4 h-4" />
                  Aktif
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{info.name}</h3>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed">{info.description}</p>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => handlePreview(info.preview)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Pratinjau
                  </Button>
                  {!isActive && (
                    <Button
                      onClick={() => handleActivateTheme(theme.themeId)}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? "Mengaktifkan..." : "Aktifkan"}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Info Box */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
            <span className="text-white text-xl">ℹ️</span>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Tentang Pengalihan Tema</h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              Tema aktif akan ditampilkan di beranda Anda. Ketika pengunjung mengakses situs Anda,
              mereka akan melihat desain dan tata letak tema yang dipilih. Anda dapat melihat
              pratinjau setiap tema sebelum mengaktifkannya. Semua tema fully responsive dan
              dioptimalkan untuk performa. Perubahan berlaku segera setelah aktivasi.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
