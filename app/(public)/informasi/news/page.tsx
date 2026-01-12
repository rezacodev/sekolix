import { Metadata } from "next";
import { getActiveThemeId } from "@/lib/utils";
import AcademicClassicNews from "../../academic-classic/informasi/news/NewsPage";
import ModernVibrantNews from "../../modern-vibrant/informasi/news/NewsPage";
import MinimalistCleanNews from "../../minimalist-clean/informasi/news/NewsPage";

export const metadata: Metadata = {
  title: "Berita - SMK Negeri 1 Jakarta",
  description: "Berita dan pengumuman terbaru SMK Negeri 1 Jakarta"
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewsPage() {
  const activeThemeId = await getActiveThemeId();

  switch (activeThemeId) {
    case "modern-vibrant":
      return <ModernVibrantNews />;
    case "minimalist-clean":
      return <MinimalistCleanNews />;
    case "academic-classic":
    default:
      return <AcademicClassicNews />;
  }
}
