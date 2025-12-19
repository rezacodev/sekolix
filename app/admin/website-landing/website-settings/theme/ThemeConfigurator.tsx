"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Palette, Type, Save, RotateCcw, Eye, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type ThemeConfig = {
  id: string;
  name: string;
  themeId: string;
  isActive: boolean;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  borderColor: string;
  grayColor: string;
  headingFont: string;
  bodyFont: string;
  logoUrl: string | null;
  customLogoUrl: string | null;
};

// Google Fonts that are commonly available and well-supported
const fontOptions = [
  { name: "Inter", value: "Inter, sans-serif" },
  { name: "Poppins", value: "Poppins, sans-serif" },
  { name: "Playfair Display", value: "'Playfair Display', serif" },
  { name: "Space Grotesk", value: "'Space Grotesk', sans-serif" },
  { name: "Sora", value: "'Sora', sans-serif" },
  { name: "Roboto", value: "Roboto, sans-serif" },
  { name: "Open Sans", value: "'Open Sans', sans-serif" },
  { name: "Lato", value: "Lato, sans-serif" },
  { name: "Montserrat", value: "Montserrat, sans-serif" },
  { name: "Merriweather", value: "Merriweather, serif" },
];

export function ThemeConfigurator({
  initialThemes,
}: {
  initialThemes: ThemeConfig[];
}) {
  const router = useRouter();
  const [themes, setThemes] = useState(initialThemes);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Get active theme with default values for new fields
  const activeTheme = themes.find(t => t.isActive) || themes[0];
  const normalizedActiveTheme = {
    ...activeTheme,
    textColor: activeTheme.textColor || "#1f2937",
    borderColor: activeTheme.borderColor || "#e5e7eb",
    grayColor: activeTheme.grayColor || "#6b7280",
  };
  
  const [currentTheme, setCurrentTheme] = useState(normalizedActiveTheme);
  
  // Store initial state for change detection
  const [initialState, setInitialState] = useState(normalizedActiveTheme);

  // Modal states
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ open: false, title: "", description: "", onConfirm: () => {} });

  const [alertDialog, setAlertDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    variant?: "default" | "destructive";
  }>({ open: false, title: "", description: "", variant: "default" });

  // Preview modal state
  const [previewDialog, setPreviewDialog] = useState<{
    open: boolean;
    themeId: string;
  }>({ open: false, themeId: "" });

  // Load Google Fonts dynamically
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Poppins:wght@400;600;700&family=Playfair+Display:wght@400;600;700&family=Space+Grotesk:wght@400;600;700&family=Sora:wght@400;600;700&family=Roboto:wght@400;500;700&family=Open+Sans:wght@400;600;700&family=Lato:wght@400;700&family=Montserrat:wght@400;600;700&family=Merriweather:wght@400;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Track unsaved changes - compare with initial state from database
  useEffect(() => {
    if (!currentTheme || !initialState) {
      setHasUnsavedChanges(false);
      return;
    }

    // Compare with initial loaded state, not hardcoded defaults
    const hasChanges =
      currentTheme.primaryColor.toLowerCase() !== initialState.primaryColor.toLowerCase() ||
      currentTheme.secondaryColor.toLowerCase() !== initialState.secondaryColor.toLowerCase() ||
      currentTheme.accentColor.toLowerCase() !== initialState.accentColor.toLowerCase() ||
      currentTheme.textColor.toLowerCase() !== initialState.textColor.toLowerCase() ||
      currentTheme.borderColor.toLowerCase() !== initialState.borderColor.toLowerCase() ||
      currentTheme.grayColor.toLowerCase() !== initialState.grayColor.toLowerCase() ||
      currentTheme.headingFont !== initialState.headingFont ||
      currentTheme.bodyFont !== initialState.bodyFont ||
      (currentTheme.logoUrl || null) !== (initialState.logoUrl || null) ||
      (currentTheme.customLogoUrl || null) !== (initialState.customLogoUrl || null);

    setHasUnsavedChanges(hasChanges);
  }, [currentTheme, initialState]);

  const handleThemeSelect = async (themeId: string) => {
    if (hasUnsavedChanges) {
      setConfirmDialog({
        open: true,
        title: "Perubahan Belum Disimpan",
        description: "Anda memiliki perubahan yang belum disimpan. Apakah Anda ingin membatalkannya dan berganti tema?",
        onConfirm: () => performThemeSwitch(themeId),
      });
      return;
    }

    await performThemeSwitch(themeId);
  };

  const performThemeSwitch = async (themeId: string) => {
    const theme = themes.find((t) => t.themeId === themeId);
    if (theme) {
      setIsSaving(true);
      try {
        // When switching themes, only send themeId to use default colors from database
        // Don't send modified colors since user chose to discard changes
        const response = await fetch("/api/admin/website-landing/theme", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            themeId: themeId,
          }),
        });

        if (response.ok) {
          const updatedTheme = await response.json();
          
          // Normalize the updated theme with default values
          const normalizedUpdatedTheme = {
            ...updatedTheme,
            textColor: updatedTheme.textColor || "#1f2937",
            borderColor: updatedTheme.borderColor || "#e5e7eb",
            grayColor: updatedTheme.grayColor || "#6b7280",
          };

          // Reset the old active theme to its initial state (discard unsaved changes)
          const resetThemes = themes.map(t => {
            if (t.isActive && initialState && t.id === initialState.id) {
              // Reset old active theme to initial state
              return { ...initialState, isActive: false };
            }
            return { ...t, isActive: t.themeId === themeId };
          });

          setThemes(resetThemes);
          setCurrentTheme(normalizedUpdatedTheme);
          setInitialState(normalizedUpdatedTheme); // Update initial state after theme switch

          router.refresh();
        } else {
          setAlertDialog({
            open: true,
            title: "Error",
            description: "Failed to switch theme. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error switching theme:", error);
        setAlertDialog({
          open: true,
          title: "Error",
          description: "An error occurred while switching theme. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleColorChange = (
    colorType: "primaryColor" | "secondaryColor" | "accentColor" | "textColor" | "borderColor" | "grayColor",
    value: string
  ) => {
    if (!currentTheme) return;

    const updatedTheme = { ...currentTheme, [colorType]: value };
    setCurrentTheme(updatedTheme);

    // Update in themes array
    setThemes(themes.map(t =>
      t.id === currentTheme.id ? updatedTheme : t
    ));
  };

  const handleFontChange = (
    fontType: "headingFont" | "bodyFont",
    value: string
  ) => {
    if (!currentTheme) return;

    const updatedTheme = { ...currentTheme, [fontType]: value };
    setCurrentTheme(updatedTheme);

    // Update in themes array
    setThemes(themes.map(t =>
      t.id === currentTheme.id ? updatedTheme : t
    ));
  };

  const handleReset = () => {
    // Reset to initial state when page loaded
    if (initialState) {
      setCurrentTheme(initialState);

      // Update in themes array
      setThemes(themes.map(t =>
        t.id === currentTheme.id ? initialState : t
      ));
    }
  };

  const handleResetToDefault = async () => {
    if (!currentTheme) return;

    setConfirmDialog({
      open: true,
      title: "Reset to Default Colors",
      description: "This will reset all colors and fonts to the theme's default values. This action cannot be undone.",
      onConfirm: async () => {
        setIsSaving(true);
        try {
          const response = await fetch("/api/admin/website-landing/theme/reset", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              themeId: currentTheme.themeId,
            }),
          });

          if (response.ok) {
            const result = await response.json();
            const resetTheme = result.theme;
            
            // Normalize the reset theme with default values
            const normalizedResetTheme = {
              ...resetTheme,
              textColor: resetTheme.textColor || "#1f2937",
              borderColor: resetTheme.borderColor || "#e5e7eb",
              grayColor: resetTheme.grayColor || "#6b7280",
            };
            
            setCurrentTheme(normalizedResetTheme);
            setInitialState(normalizedResetTheme);
            setThemes(themes.map(t => t.id === normalizedResetTheme.id ? normalizedResetTheme : t));
            router.refresh();
            setAlertDialog({
              open: true,
              title: "Success",
              description: "Theme has been reset to default colors successfully!",
              variant: "default",
            });
          } else {
            setAlertDialog({
              open: true,
              title: "Error",
              description: "Failed to reset theme. Please try again.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error resetting theme:", error);
          setAlertDialog({
            open: true,
            title: "Error",
            description: "An error occurred while resetting. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsSaving(false);
        }
      },
    });
  };

  const handleSave = async () => {
    if (!currentTheme) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/website-landing/theme", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: currentTheme.id,
          primaryColor: currentTheme.primaryColor,
          secondaryColor: currentTheme.secondaryColor,
          accentColor: currentTheme.accentColor,
          textColor: currentTheme.textColor,
          borderColor: currentTheme.borderColor,
          grayColor: currentTheme.grayColor,
          headingFont: currentTheme.headingFont,
          bodyFont: currentTheme.bodyFont,
          logoUrl: currentTheme.logoUrl,
          customLogoUrl: currentTheme.customLogoUrl,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        
        // Normalize the updated theme with default values
        const normalizedUpdated = {
          ...updated,
          textColor: updated.textColor || "#1f2937",
          borderColor: updated.borderColor || "#e5e7eb",
          grayColor: updated.grayColor || "#6b7280",
        };
        
        setCurrentTheme(normalizedUpdated);
        setInitialState(normalizedUpdated); // Update initial state after successful save
        
        // Update themes array with the new saved colors
        const updatedThemes = themes.map(t => t.id === normalizedUpdated.id ? normalizedUpdated : t);
        setThemes(updatedThemes);
        
        router.refresh();
        setAlertDialog({
          open: true,
          title: "Success",
          description: "Konfigurasi tema berhasil disimpan!",
          variant: "default",
        });
      } else {
        setAlertDialog({
          open: true,
          title: "Error",
          description: "Gagal menyimpan konfigurasi tema. Silakan coba lagi.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving theme:", error);
      setAlertDialog({
        open: true,
        title: "Kesalahan",
        description: "Terjadi kesalahan saat menyimpan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentTheme) {
    return <div>Memuat...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Theme Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-foreground" />
            Pilih Tema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {themes.map((theme) => {
              // Show saved colors from database for each theme
              // Don't use currentTheme colors unless it's being edited
              const isCurrentlyEditing = currentTheme && theme.id === currentTheme.id;
              const displayColors = isCurrentlyEditing 
                ? {
                    primaryColor: currentTheme.primaryColor,
                    secondaryColor: currentTheme.secondaryColor,
                    accentColor: currentTheme.accentColor,
                  }
                : {
                    primaryColor: theme.primaryColor,
                    secondaryColor: theme.secondaryColor,
                    accentColor: theme.accentColor,
                  };
              
              return (
                <div
                  key={theme.themeId}
                  className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    theme.isActive
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => handleThemeSelect(theme.themeId)}
                >
                  {theme.isActive && (
                    <Badge className="absolute top-2 right-2">
                      {isSaving ? "Menerapkan..." : "Aktif"}
                    </Badge>
                  )}

                  <div className="space-y-3">
                    {/* Theme Preview with Color Bars (More Performant) */}
                    <div className="aspect-video bg-card rounded-md overflow-hidden relative group border-2 border-card">
                      {/* Color preview with layout simulation */}
                      <div className="absolute inset-0">
                        {/* Header bar */}
                        <div 
                          className="h-16 w-full flex items-center px-4"
                          style={{ backgroundColor: displayColors.primaryColor }}
                        >
                          <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-card/80" />
                            <div className="w-2 h-2 rounded-full bg-card/80" />
                            <div className="w-2 h-2 rounded-full bg-card/80" />
                          </div>
                        </div>
                        
                        {/* Content area with gradient */}
                        <div 
                          className="h-[calc(100%-4rem)] w-full"
                          style={{ 
                            background: `linear-gradient(135deg, ${displayColors.primaryColor}15 0%, ${displayColors.accentColor}15 50%, ${displayColors.secondaryColor}15 100%)`
                          }}
                        >
                          {/* Simulated content blocks */}
                          <div className="p-4 space-y-3">
                            <div 
                              className="h-8 w-3/4 rounded"
                              style={{ backgroundColor: displayColors.primaryColor, opacity: 0.6 }}
                            />
                            <div className="flex gap-2">
                              <div 
                                className="h-16 flex-1 rounded"
                                style={{ backgroundColor: displayColors.secondaryColor, opacity: 0.4 }}
                              />
                              <div 
                                className="h-16 flex-1 rounded"
                                style={{ backgroundColor: displayColors.accentColor, opacity: 0.4 }}
                              />
                            </div>
                            <div 
                              className="h-4 w-full rounded"
                              style={{ backgroundColor: displayColors.primaryColor, opacity: 0.3 }}
                            />
                            <div 
                              className="h-4 w-5/6 rounded"
                              style={{ backgroundColor: displayColors.primaryColor, opacity: 0.3 }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Hover overlay with color info and preview button */}
                          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <div 
                              className="w-10 h-10 rounded-lg border-2 border-border shadow-lg" 
                              style={{ backgroundColor: displayColors.primaryColor }}
                              title="Primary"
                            />
                            <div 
                              className="w-10 h-10 rounded-lg border-2 border-border shadow-lg" 
                              style={{ backgroundColor: displayColors.secondaryColor }}
                              title="Secondary"
                            />
                            <div 
                              className="w-10 h-10 rounded-lg border-2 border-border shadow-lg" 
                              style={{ backgroundColor: displayColors.accentColor }}
                              title="Accent"
                            />
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewDialog({ open: true, themeId: theme.themeId });
                            }}
                            className="w-full bg-card text-foreground px-4 py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-muted transition-colors shadow-lg"
                          >
                            <Eye className="w-4 h-4 text-foreground" />
                            Pratinjau Lengkap
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Theme Info */}
                    <div>
                      <h3 className="font-semibold">{theme.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {theme.themeId === "academic-classic" && "Professional, formal, trustworthy"}
                        {theme.themeId === "modern-vibrant" && "Dynamic, energetic, youthful"}
                        {theme.themeId === "minimalist-clean" && "Simple, clean, modern-minimal"}
                      </p>
                    </div>

                    {/* Color Swatches - Show current config colors if this theme is active */}
                    <div className="flex gap-2">
                      <div
                        className="w-8 h-8 rounded-full border-2 border-border shadow-sm"
                        style={{
                          backgroundColor: displayColors.primaryColor
                        }}
                        title="Primary"
                      />
                      <div
                        className="w-8 h-8 rounded-full border-2 border-border shadow-sm"
                        style={{
                          backgroundColor: displayColors.secondaryColor
                        }}
                        title="Secondary"
                      />
                      <div
                        className="w-8 h-8 rounded-full border-2 border-border shadow-sm"
                        style={{
                          backgroundColor: displayColors.accentColor
                        }}
                        title="Accent"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Color Customization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-foreground" />
            Kustomisasi Warna
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Primary Color */}
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Warna Utama</Label>
              <div className="flex gap-2">
                <div
                  className="w-12 h-10 rounded-md border-2 border-border shadow-sm"
                  style={{ backgroundColor: currentTheme.primaryColor }}
                />
                <Input
                  id="primaryColor"
                  type="color"
                  value={currentTheme.primaryColor}
                  onChange={(e) =>
                    handleColorChange("primaryColor", e.target.value)
                  }
                  className="flex-1 cursor-pointer"
                />
              </div>
              <Input
                type="text"
                value={currentTheme.primaryColor}
                onChange={(e) =>
                  handleColorChange("primaryColor", e.target.value)
                }
                placeholder="#001f3f"
                className="font-mono text-sm"
              />
            </div>

            {/* Secondary Color */}
            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Warna Sekunder</Label>
              <div className="flex gap-2">
                <div
                  className="w-12 h-10 rounded-md border-2 border-border shadow-sm"
                  style={{ backgroundColor: currentTheme.secondaryColor }}
                />
                <Input
                  id="secondaryColor"
                  type="color"
                  value={currentTheme.secondaryColor}
                  onChange={(e) =>
                    handleColorChange("secondaryColor", e.target.value)
                  }
                  className="flex-1 cursor-pointer"
                />
              </div>
              <Input
                type="text"
                value={currentTheme.secondaryColor}
                onChange={(e) =>
                  handleColorChange("secondaryColor", e.target.value)
                }
                placeholder="#FFFFFF"
                className="font-mono text-sm"
              />
            </div>

            {/* Accent Color */}
            <div className="space-y-2">
              <Label htmlFor="accentColor">Warna Aksen</Label>
              <div className="flex gap-2">
                <div
                  className="w-12 h-10 rounded-md border-2 border-border shadow-sm"
                  style={{ backgroundColor: currentTheme.accentColor }}
                />
                <Input
                  id="accentColor"
                  type="color"
                  value={currentTheme.accentColor}
                  onChange={(e) =>
                    handleColorChange("accentColor", e.target.value)
                  }
                  className="flex-1 cursor-pointer"
                />
              </div>
              <Input
                type="text"
                value={currentTheme.accentColor}
                onChange={(e) =>
                  handleColorChange("accentColor", e.target.value)
                }
                placeholder="#FFD700"
                className="font-mono text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* Text Color */}
            <div className="space-y-2">
              <Label htmlFor="textColor">Warna Teks</Label>
              <div className="flex gap-2">
                <div
                  className="w-12 h-10 rounded-md border-2 border-border shadow-sm"
                  style={{ backgroundColor: currentTheme.textColor }}
                />
                <Input
                  id="textColor"
                  type="color"
                  value={currentTheme.textColor}
                  onChange={(e) =>
                    handleColorChange("textColor", e.target.value)
                  }
                  className="flex-1 cursor-pointer"
                />
              </div>
              <Input
                type="text"
                value={currentTheme.textColor}
                onChange={(e) =>
                  handleColorChange("textColor", e.target.value)
                }
                placeholder="#1f2937"
                className="font-mono text-sm"
              />
            </div>

            {/* Border Color */}
            <div className="space-y-2">
              <Label htmlFor="borderColor">Warna Batas</Label>
              <div className="flex gap-2">
                <div
                  className="w-12 h-10 rounded-md border-2 border-border shadow-sm"
                  style={{ backgroundColor: currentTheme.borderColor }}
                />
                <Input
                  id="borderColor"
                  type="color"
                  value={currentTheme.borderColor}
                  onChange={(e) =>
                    handleColorChange("borderColor", e.target.value)
                  }
                  className="flex-1 cursor-pointer"
                />
              </div>
              <Input
                type="text"
                value={currentTheme.borderColor}
                onChange={(e) =>
                  handleColorChange("borderColor", e.target.value)
                }
                placeholder="#e5e7eb"
                className="font-mono text-sm"
              />
            </div>

            {/* Gray Color */}
            <div className="space-y-2">
              <Label htmlFor="grayColor">Warna Abu-abu</Label>
              <div className="flex gap-2">
                <div
                  className="w-12 h-10 rounded-md border-2 border-border shadow-sm"
                  style={{ backgroundColor: currentTheme.grayColor }}
                />
                <Input
                  id="grayColor"
                  type="color"
                  value={currentTheme.grayColor}
                  onChange={(e) =>
                    handleColorChange("grayColor", e.target.value)
                  }
                  className="flex-1 cursor-pointer"
                />
              </div>
              <Input
                type="text"
                value={currentTheme.grayColor}
                onChange={(e) =>
                  handleColorChange("grayColor", e.target.value)
                }
                placeholder="#6b7280"
                className="font-mono text-sm"
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Colors are applied to your website theme. Changes will be visible
              after saving.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Font Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5 text-foreground" />
            Typography
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Heading Font */}
            <div className="space-y-2">
              <Label htmlFor="headingFont">Font Judul</Label>
              <Select
                value={currentTheme.headingFont}
                onValueChange={(value) => handleFontChange("headingFont", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((font) => (
                    <SelectItem key={font.name} value={font.value}>
                      <span style={{ fontFamily: font.value }}>{font.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p
                className="text-2xl font-bold"
                style={{ fontFamily: currentTheme.headingFont }}
              >
                Contoh Teks Judul
              </p>
            </div>

            {/* Body Font */}
            <div className="space-y-2">
              <Label htmlFor="bodyFont">Font Isi</Label>
              <Select
                value={currentTheme.bodyFont}
                onValueChange={(value) => handleFontChange("bodyFont", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((font) => (
                    <SelectItem key={font.name} value={font.value}>
                      <span style={{ fontFamily: font.value }}>{font.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm" style={{ fontFamily: currentTheme.bodyFont }}>
                Cepat elang coklat melompati anjing malas. Ini adalah contoh teks isi
                untuk pratinjau font.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Font dimuat dari Google Fonts dan diterapkan ke judul dan teks isi.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasUnsavedChanges}
          >
            <RotateCcw className="mr-2 h-4 w-4 text-current" />
            Abaikan Perubahan
          </Button>
          <Button
            variant="outline"
            onClick={handleResetToDefault}
            disabled={isSaving}
          >
            <RotateCcw className="mr-2 h-4 w-4 text-current" />
            Setel Ulang ke Bawaan
          </Button>
        </div>

        <div className="flex gap-2">
          {hasUnsavedChanges && (
            <span className="text-sm text-accent flex items-center gap-2 mr-2">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
              Perubahan belum disimpan
            </span>
          )}
          <Button 
            variant="outline"
            onClick={() => {
              setPreviewDialog({ open: true, themeId: currentTheme.themeId });
            }}
          >
            <Eye className="mr-2 h-4 w-4 text-current" />
            Pratinjau Perubahan
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
          >
            <Save className="mr-2 h-4 w-4 text-current" />
            {isSaving ? "Menyimpan..." : "Simpan Konfigurasi"}
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog 
        open={confirmDialog.open} 
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                confirmDialog.onConfirm();
                setConfirmDialog({ ...confirmDialog, open: false });
              }}
            >
              Abaikan Perubahan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Dialog */}
      <AlertDialog 
        open={alertDialog.open} 
        onOpenChange={(open) => setAlertDialog({ ...alertDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {alertDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Dialog */}
      <Dialog 
        open={previewDialog.open} 
        onOpenChange={(open) => setPreviewDialog({ ...previewDialog, open })}
      >
        <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b border-card bg-card sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl">Pratinjau Tema - {
                  previewDialog.themeId === 'academic-classic' ? 'Klasik Akademis' :
                  previewDialog.themeId === 'modern-vibrant' ? 'Vibran Modern' :
                  'Bersih Minimalis'
                }</DialogTitle>
                <DialogDescription className="text-sm mt-1">
                  Pratinjau langsung tema Anda dengan pengaturan saat ini
                </DialogDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/${previewDialog.themeId}`, '_blank')}
                >
                  <Eye className="w-4 h-4 mr-2 text-current" />
                  Halaman Lengkap
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewDialog({ ...previewDialog, open: false })}
                >
                  <X className="w-4 h-4 text-current" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-hidden bg-muted">
            <div className="w-full h-full flex items-center justify-center p-4">
              <div className="w-full h-full bg-card rounded-lg shadow-2xl overflow-hidden border-4 border-card">
                <iframe
                  key={previewDialog.themeId}
                  src={`/${previewDialog.themeId}`}
                  className="w-full h-full border-0"
                  title="Theme Preview"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
