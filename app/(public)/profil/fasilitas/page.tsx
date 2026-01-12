import { getActiveThemeId } from "@/lib/utils";
import AcademicClassicFasilitas from "../../academic-classic/profil/fasilitas/page";
import ModernVibrantFasilitas from "../../modern-vibrant/profil/fasilitas/page";
import MinimalistCleanFasilitas from "../../minimalist-clean/profil/fasilitas/page";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FasilitasPage() {
  const activeThemeId = await getActiveThemeId();

  switch (activeThemeId) {
    case "modern-vibrant":
      return <ModernVibrantFasilitas />;
    case "minimalist-clean":
      return <MinimalistCleanFasilitas />;
    case "academic-classic":
    default:
      return <AcademicClassicFasilitas />;
  }
}
