import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import ThemeSwitcher from "@/components/admin/ThemeSwitcher";
import { ThemeConfigurator } from "./ThemeConfigurator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata = {
  title: "Konfigurasi Tema - Admin"
};

export default async function ThemeSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  // Get all theme configs
  let themes = await db.themeConfig.findMany({
    orderBy: { createdAt: "asc" }
  });

  // If no themes exist, create default ones
  if (themes.length === 0) {
    const defaultThemes = [
      {
        name: "Academic Classic",
        themeId: "academic-classic",
        isActive: true,
        primaryColor: "#1e3a8a",
        secondaryColor: "#ffffff",
        accentColor: "#d97706",
        textColor: "#1f2937",
        borderColor: "#e5e7eb",
        grayColor: "#6b7280",
        headingFont: "'Playfair Display', serif",
        bodyFont: "Inter, sans-serif",
        defaultPrimaryColor: "#1e3a8a",
        defaultSecondaryColor: "#ffffff",
        defaultAccentColor: "#d97706",
        defaultTextColor: "#1f2937",
        defaultBorderColor: "#e5e7eb",
        defaultGrayColor: "#6b7280",
        defaultHeadingFont: "'Playfair Display', serif",
        defaultBodyFont: "Inter, sans-serif"
      },
      {
        name: "Modern Vibrant",
        themeId: "modern-vibrant",
        isActive: false,
        primaryColor: "#06b6d4",
        secondaryColor: "#f97316",
        accentColor: "#a855f7",
        textColor: "#0f172a",
        borderColor: "#cbd5e1",
        grayColor: "#64748b",
        headingFont: "Poppins, sans-serif",
        bodyFont: "Inter, sans-serif",
        defaultPrimaryColor: "#06b6d4",
        defaultSecondaryColor: "#f97316",
        defaultAccentColor: "#a855f7",
        defaultTextColor: "#0f172a",
        defaultBorderColor: "#cbd5e1",
        defaultGrayColor: "#64748b",
        defaultHeadingFont: "Poppins, sans-serif",
        defaultBodyFont: "Inter, sans-serif"
      },
      {
        name: "Minimalist Clean",
        themeId: "minimalist-clean",
        isActive: false,
        primaryColor: "#171717",
        secondaryColor: "#ffffff",
        accentColor: "#3b82f6",
        textColor: "#262626",
        borderColor: "#e5e5e5",
        grayColor: "#525252",
        headingFont: "Inter, sans-serif",
        bodyFont: "Inter, sans-serif",
        defaultPrimaryColor: "#171717",
        defaultSecondaryColor: "#ffffff",
        defaultAccentColor: "#3b82f6",
        defaultTextColor: "#262626",
        defaultBorderColor: "#e5e5e5",
        defaultGrayColor: "#525252",
        defaultHeadingFont: "Inter, sans-serif",
        defaultBodyFont: "Inter, sans-serif"
      }
    ];

    await db.themeConfig.createMany({
      data: defaultThemes
    });

    // Fetch again after creation
    themes = await db.themeConfig.findMany({
      orderBy: { createdAt: "asc" }
    });
  }

  return (
    <div>
      <Tabs defaultValue="switcher" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="switcher">Pengalih Tema</TabsTrigger>
          <TabsTrigger value="customize">Kustomisasi</TabsTrigger>
        </TabsList>

        <TabsContent value="switcher" className="mt-6">
          <ThemeSwitcher themes={themes} />
        </TabsContent>

        <TabsContent value="customize" className="mt-6">
          <ThemeConfigurator initialThemes={themes} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
