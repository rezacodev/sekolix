import { getActiveThemeId } from "@/lib/utils";
import AcademicClassicProgramKeahlian from "../../academic-classic/profil/program-keahlian/page";
import ModernVibrantProgramKeahlian from "../../modern-vibrant/profil/program-keahlian/page";
import MinimalistCleanProgramKeahlian from "../../minimalist-clean/profil/program-keahlian/page";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProgramKeahlianPage() {
  const activeThemeId = await getActiveThemeId();

  switch (activeThemeId) {
    case "modern-vibrant":
      return <ModernVibrantProgramKeahlian />;
    case "minimalist-clean":
      return <MinimalistCleanProgramKeahlian />;
    case "academic-classic":
    default:
      return <AcademicClassicProgramKeahlian />;
  }
}
