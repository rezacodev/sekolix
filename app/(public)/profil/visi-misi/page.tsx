import { getActiveThemeId } from "@/lib/utils";
import AcademicClassicVisiMisi from "../../academic-classic/profil/visi-misi/page";
import ModernVibrantVisiMisi from "../../modern-vibrant/profil/visi-misi/page";
import MinimalistCleanVisiMisi from "../../minimalist-clean/profil/visi-misi/page";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function VisiMisiPage() {
  const activeThemeId = await getActiveThemeId();

  switch (activeThemeId) {
    case "modern-vibrant":
      return <ModernVibrantVisiMisi />;
    case "minimalist-clean":
      return <MinimalistCleanVisiMisi />;
    case "academic-classic":
    default:
      return <AcademicClassicVisiMisi />;
  }
}
