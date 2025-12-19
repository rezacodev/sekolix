import { Article } from '@prisma/client';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { getThemeConfigById, getDefaultThemeConfig } from '@/lib/utils';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Navbar } from '@/components/themes/modern-vibrant';

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

export default async function ModernVibrantArticles() {
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
        
        <main className="pt-20">
          {/* Header with unified Modern Vibrant hero */}
          <section className="bg-linear-to-r from-cyan-500 to-purple-500 text-white py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-4xl font-bold mb-4">Artikel Kami</h1>
              <p className="text-lg text-cyan-100">Inspirasi, inovasi, dan informasi untuk masa depan cerah</p>
            </div>
          </section>

          {/* Articles Grid with Modern Vibrant Cards */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
                            {article.category && (
                              <>
                                <span>•</span>
                                <span className="text-gray-700 bg-gray-100 px-3 py-1 rounded-full text-xs font-black">{article.category}</span>
                              </>
                            )}
                          </div>
                          <h2 className="text-2xl font-extrabold text-gray-900 group-hover:text-cyan-600 transition-colors">{article.title}</h2>
                          {article.excerpt && (
                            <p className="mt-4 text-gray-600 leading-relaxed">{article.excerpt}</p>
                          )}
                          <div className="mt-5 inline-flex items-center gap-2 text-cyan-600 font-bold group-hover:translate-x-1 transition-transform">
                            Baca Selengkapnya <span aria-hidden>→</span>
                          </div>
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
        </main>
      </div>
    </ThemeProvider>
  );
}
