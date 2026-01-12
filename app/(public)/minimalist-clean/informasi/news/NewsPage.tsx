import { ThemeProvider } from "@/components/ThemeProvider";
import { getThemeConfigById, getDefaultThemeConfig } from "@/lib/utils";
import { MinimalNavbar, MinimalFooter, ListBasedNews } from "@/components/themes/minimalist-clean";
import { formatDate } from "@/lib/utils";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MinimalistCleanNews() {
  const themeConfig =
    (await getThemeConfigById("minimalist-clean")) || getDefaultThemeConfig("minimalist-clean");

  const newsItems = await prisma.news.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
    take: 6
  });

  const newsList = newsItems.map(item => ({
    id: item.id,
    title: item.title,
    excerpt: item.excerpt ?? "",
    date: formatDate(item.publishedAt ?? item.createdAt),
    category: item.category ?? "Informasi",
    link: `/informasi/news/${item.slug}`
  }));

  return (
    <ThemeProvider {...themeConfig}>
      <div className="min-h-screen bg-white text-slate-900">
        <MinimalNavbar />
        <main className="pt-24">
          {newsList.length > 0 ? (
            <ListBasedNews news={newsList} title="Berita & Pembaruan" />
          ) : (
            <div className="max-w-4xl mx-auto text-center py-20 text-slate-500">
              Belum ada berita terbaru saat ini.
            </div>
          )}
        </main>
        <MinimalFooter
          schoolName="SMK Negeri 1 Jakarta"
          description="Sekolah vokasi dengan budaya kolaboratif, teknologi, dan karakter kuat."
          address="Jl. Pendidikan No. 45, Jakarta Pusat"
          phone="(021) 4567-8910"
          email="info@smkn1jakarta.sch.id"
        />
      </div>
    </ThemeProvider>
  );
}
