import { Metadata } from "next";
import { getActiveThemeId } from "@/lib/utils";
import AcademicClassicContact from "../academic-classic/contact/ContactPage";
import MinimalistCleanContact from "../minimalist-clean/contact/ContactPage";
import ModernVibrantContact from "../modern-vibrant/contact/ContactPage";

export const metadata: Metadata = {
  title: "Kontak - SMK Negeri 1 Jakarta",
  description: "Hubungi SMK Negeri 1 Jakarta untuk informasi lebih lanjut"
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ContactPage() {
  const activeThemeId = await getActiveThemeId();

  switch (activeThemeId) {
    case "modern-vibrant":
      return <ModernVibrantContact />;
    case "minimalist-clean":
      return <MinimalistCleanContact />;
    case "academic-classic":
    default:
      return <AcademicClassicContact />;
  }
}
