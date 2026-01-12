import { getActiveThemeId } from "@/lib/utils";
import AcademicClassicGalleryPage from "../academic-classic/gallery/page";
import ModernVibrantGalleryPage from "../modern-vibrant/gallery/page";
import MinimalistCleanGalleryPage from "../minimalist-clean/gallery/page";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function GalleryPage() {
  const activeThemeId = await getActiveThemeId();

  switch (activeThemeId) {
    case "modern-vibrant":
      return <ModernVibrantGalleryPage />;
    case "minimalist-clean":
      return <MinimalistCleanGalleryPage />;
    case "academic-classic":
    default:
      return <AcademicClassicGalleryPage />;
  }
}
