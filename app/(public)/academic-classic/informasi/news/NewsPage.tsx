import Link from 'next/link';
import { ThemeProvider } from '@/components/ThemeProvider';
import { getThemeConfigById, getDefaultThemeConfig } from '@/lib/utils';
import { Header, Footer } from '@/components/themes/academic-classic';
import { formatDate } from '@/lib/utils';
import prisma from '@/lib/db';

export default async function AcademicClassicNews() {
  const themeConfig = await getThemeConfigById('academic-classic') || getDefaultThemeConfig('academic-classic');
  const newsItems = await prisma.news.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' },
    take: 6,
  });

  const newsList = newsItems.map((item) => ({
    slug: item.slug,
    title: item.title,
    excerpt: item.excerpt ?? '',
    category: item.category ?? 'Informasi',
    date: item.publishedAt ? formatDate(item.publishedAt) : formatDate(item.createdAt),
  }));

  return (
    <ThemeProvider
      primaryColor={themeConfig.primaryColor}
      secondaryColor={themeConfig.secondaryColor}
      accentColor={themeConfig.accentColor}
      textColor={themeConfig.textColor}
      borderColor={themeConfig.borderColor}
      grayColor={themeConfig.grayColor}
      headingFont={themeConfig.headingFont}
      bodyFont={themeConfig.bodyFont}
    >
      <div className="w-full">
        <Header />
        <div className="min-h-screen bg-gray-50 pt-20">

        <header className="bg-linear-to-b from-blue-900 to-blue-800 text-white py-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-sm uppercase tracking-[0.25em] text-blue-100">Berita</p>
            <h1 className="text-4xl font-bold mt-2">Berita & Pengumuman</h1>
            <p className="text-blue-100 mt-3">Update terbaru seputar kegiatan, prestasi, dan informasi sekolah.</p>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {newsList.map((item) => (
              <Link key={item.slug} href={`/informasi/news/${item.slug}`} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition">
                <div className="text-xs uppercase tracking-wide text-blue-800 font-semibold mb-2">{item.category}</div>
                <h3 className="text-xl font-bold text-blue-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{item.excerpt}</p>
                <div className="text-xs text-gray-500">{item.date}</div>
              </Link>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-between text-sm text-gray-600">
            <span>Halaman 1 dari 1</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-gray-300 rounded bg-white text-gray-400 cursor-not-allowed" disabled>
                Sebelumnya
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded bg-white text-gray-400 cursor-not-allowed" disabled>
                Selanjutnya
              </button>
            </div>
          </div>
        </main>

        <Footer />
        </div>
      </div>
    </ThemeProvider>
  );
}
