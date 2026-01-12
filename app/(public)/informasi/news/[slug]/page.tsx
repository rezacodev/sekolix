import { getActiveThemeId } from "@/lib/utils";
import AcademicClassicNewsDetail from "../../../academic-classic/informasi/news/NewsDetailPage";
import ModernVibrantNewsDetail from "../../../modern-vibrant/informasi/news/NewsDetailPage";
import MinimalistCleanNewsDetail from "../../../minimalist-clean/informasi/news/NewsDetailPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewsDetailPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const activeThemeId = await getActiveThemeId();

  switch (activeThemeId) {
    case "modern-vibrant":
      return <ModernVibrantNewsDetail slug={slug} />;
    case "minimalist-clean":
      return <MinimalistCleanNewsDetail slug={slug} />;
    case "academic-classic":
    default:
      return <AcademicClassicNewsDetail slug={slug} />;
  }
}
