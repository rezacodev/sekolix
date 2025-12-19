import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@prisma/client';
import prisma from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { getThemeConfigById, getDefaultThemeConfig } from '@/lib/utils';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Navbar } from '@/components/themes/modern-vibrant';

export const metadata: Metadata = {
  title: 'Artikel - SMK Negeri 1 Jakarta',
  description: 'Baca artikel pendidikan dan informasi terkini dari SMK Negeri 1 Jakarta',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getArticles(): Promise<Article[]> {
  try {
    const articles = await prisma.article.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      take: 50,
    });
    return articles;
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

export default async function ModernVibrantArticlesPage() {
  const articles = await getArticles();
  const themeConfig = await getThemeConfigById('modern-vibrant') || getDefaultThemeConfig('modern-vibrant');

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
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-purple-50 to-cyan-50">
        <Navbar />
        
        {/* Header with Modern Vibrant Gradient Style */}
        <div className="relative overflow-hidden pt-20 pb-32">
          <div className="absolute inset-0 bg-linear-to-br from-cyan-500 via-purple-500 to-orange-500 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iLjA1IiBjeD0iNDAiIGN5PSI0MCIgcj0iMzAiLz48L2c+PC9zdmc+')] opacity-30"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center">
              <div className="inline-block mb-6 animate-bounce">
                <div className="text-6xl">✨</div>
              </div>
              <h1 className="text-6xl md:text-7xl font-black mb-6 text-white tracking-tight">
                <span className="bg-clip-text text-transparent bg-linear-to-r from-white via-cyan-100 to-white">
                  Artikel Kami
                </span>
              </h1>
              <p className="text-2xl text-white/90 max-w-3xl mx-auto font-medium">
                Inspirasi, Inovasi, dan Informasi untuk Masa Depan Cerah
              </p>
            </div>
          </div>
        </div>

        {/* Articles Grid with Modern Vibrant Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-20">
          {articles.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-2xl">
              <div className="text-8xl mb-4 animate-pulse">📝</div>
              <p className="text-gray-500 text-xl font-semibold">Artikel akan segera hadir! 🚀</p>
            </div>
          ) : (
            <>
              {/* Colorful Stats Cards */}
              <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-linear-to-br from-cyan-500 to-cyan-600 rounded-3xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform">
                  <div className="text-5xl font-black">{articles.length}</div>
                  <div className="text-cyan-100 font-semibold mt-2">Total Artikel</div>
                </div>
                <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform">
                  <div className="text-5xl font-black">
                    {new Set(articles.map((a: Article) => a.category).filter(Boolean)).size}
                  </div>
                  <div className="text-purple-100 font-semibold mt-2">Kategori</div>
                </div>
                <div className="bg-linear-to-br from-orange-500 to-orange-600 rounded-3xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform">
                  <div className="text-5xl font-black">
                    {new Set(articles.map((a: Article) => a.author).filter(Boolean)).size}
                  </div>
                  <div className="text-orange-100 font-semibold mt-2">Penulis</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article: Article, index: number) => {
                  const gradients = [
                    'from-cyan-500 to-blue-500',
                    'from-purple-500 to-pink-500',
                    'from-orange-500 to-red-500',
                  ];
                  const gradient = gradients[index % gradients.length];
                  
                  return (
                    <Link
                      key={article.id}
                      href={`/informasi/articles/${article.slug}`}
                      className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 hover:rotate-1"
                    >
                      {article.featuredImage && (
                        <div className="relative h-56 w-full overflow-hidden">
                          <div className={`absolute inset-0 bg-linear-to-br ${gradient} opacity-80`}></div>
                          <Image
                            src={article.featuredImage}
                            alt={article.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500 mix-blend-overlay"
                          />
                          {article.category && (
                            <div className="absolute top-4 right-4">
                              <span className="inline-block px-4 py-2 bg-white text-gray-900 text-xs font-black rounded-full shadow-lg">
                                {article.category}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-3 text-sm text-gray-500 mb-3 font-semibold">
                          <span>📅 {formatDate(article.publishedAt || article.createdAt)}</span>
                          {article.readTime && (
                            <>
                              <span>•</span>
                              <span>⚡ {article.readTime} min</span>
                            </>
                          )}
                        </div>
                        <h2 className="text-xl font-black text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-cyan-600 group-hover:to-purple-600 transition-all line-clamp-2">
                          {article.title}
                        </h2>
                        <p className="text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                          {article.excerpt}
                        </p>
                        {article.author && (
                          <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold">
                              {article.author.charAt(0)}
                            </div>
                            <span className="font-semibold text-gray-900 text-sm">{article.author}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}

          {/* Modern CTA Button */}
          <div className="text-center mt-16">
            <Link
              href="/"
              className="inline-flex items-center gap-3 px-10 py-5 bg-linear-to-r from-cyan-500 via-purple-500 to-orange-500 text-white font-black rounded-2xl hover:shadow-2xl transition-all transform hover:scale-105 text-lg"
            >
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
