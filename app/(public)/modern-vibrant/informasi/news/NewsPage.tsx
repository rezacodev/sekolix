import Link from "next/link";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getThemeConfigById, getDefaultThemeConfig } from "@/lib/utils";
import { Navbar, NewsSection, VibrantFooter } from "@/components/themes/modern-vibrant";
import { formatDate } from "@/lib/utils";
import prisma from "@/lib/db";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=900&fit=crop";

export default async function ModernVibrantNews() {
  const themeConfig =
    (await getThemeConfigById("modern-vibrant")) || getDefaultThemeConfig("modern-vibrant");

  const newsItems = await prisma.news.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
    take: 6
  });

  const newsList = newsItems.map(item => ({
    id: item.id,
    title: item.title,
    excerpt: item.excerpt ?? "",
    image: item.image ?? FALLBACK_IMAGE,
    category: item.category ?? "Informasi",
    publishedAt: formatDate(item.publishedAt ?? item.createdAt),
    slug: item.slug
  }));

  return (
    <ThemeProvider {...themeConfig}>
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <Navbar />

        <main className="pt-20">
          <section className="bg-linear-to-r from-cyan-500 to-purple-500 text-white py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-4xl font-bold mb-4">Berita & Update Sekolah</h1>
              <p className="text-lg text-cyan-100">
                Sorotan inovasi, kolaborasi industri, dan prestasi terbaru siswa
              </p>
            </div>
          </section>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <NewsSection news={newsList} />

            {newsList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                {newsList.map(item => (
                  <Link
                    key={item.slug}
                    href={`/informasi/news/${item.slug}`}
                    className="group bg-slate-800/60 border border-white/10 rounded-2xl p-5 hover:-translate-y-1 hover:border-cyan-400/60 transition transform"
                  >
                    <div className="text-xs uppercase tracking-[0.2em] text-cyan-300 mb-2">
                      {item.publishedAt}
                    </div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-cyan-200">
                      {item.title}
                    </h3>
                    <p className="text-slate-200/80 text-sm">{item.excerpt}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-cyan-100 mt-10">Belum ada berita terbaru.</p>
            )}
          </div>
        </main>

        <VibrantFooter
          schoolName="SMK Negeri 1 Jakarta"
          address="Jl. Pendidikan No. 123, Jakarta"
          phone="(021) 1234-5678"
          email="info@smkn1jakarta.sch.id"
          socialMedia={{
            facebook: "https://facebook.com/smkn1jakarta",
            instagram: "https://instagram.com/smkn1jakarta",
            twitter: "https://twitter.com/smkn1jakarta"
          }}
        />
      </div>
    </ThemeProvider>
  );
}
