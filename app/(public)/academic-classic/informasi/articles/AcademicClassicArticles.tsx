import { Article } from '@prisma/client';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { getThemeConfigById, getDefaultThemeConfig } from '@/lib/utils';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Header, Footer } from '@/components/themes/academic-classic';

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

export default async function AcademicClassicArticles() {
  const articles = await getArticles();
  const themeConfig = await getThemeConfigById('academic-classic') || getDefaultThemeConfig('academic-classic');

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
        
        {/* Header with Classic Academic Style */}
        <div className="bg-linear-to-br from-blue-900 via-blue-800 to-blue-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptMCAzMGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjAzIi8+PC9nPjwvc3ZnPg==')] opacity-20"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
            <div className="text-center">
              <div className="inline-block mb-4">
                <span className="inline-block px-4 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium">
                  📚 Knowledge Hub
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Artikel & Publikasi
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Kumpulan artikel pendidikan, penelitian, dan informasi terkini dari SMK Negeri 1 Jakarta
              </p>
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {articles.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-500 text-lg">Belum ada artikel yang dipublikasikan.</p>
            </div>
          ) : (
            <>
              {/* Stats Bar */}
              <div className="mb-12 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-900">{articles.length}</div>
                    <div className="text-sm text-gray-600">Total Artikel</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-900">
                      {new Set(articles.map((a: Article) => a.category).filter(Boolean)).size}
                    </div>
                    <div className="text-sm text-gray-600">Kategori</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-900">
                      {new Set(articles.map((a: Article) => a.author).filter(Boolean)).size}
                    </div>
                    <div className="text-sm text-gray-600">Penulis</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article: Article) => (
                  <Link
                    key={article.id}
                    href={`/informasi/articles/${article.slug}`}
                    className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-300 hover:-translate-y-1"
                  >
                    {article.featuredImage && (
                      <div className="relative h-56 w-full overflow-hidden bg-linear-to-br from-blue-100 to-blue-50">
                        <Image
                          src={article.featuredImage}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent"></div>
                        {article.category && (
                          <div className="absolute bottom-4 left-4">
                            <span className="inline-block px-3 py-1 bg-white/90 backdrop-blur-sm text-blue-900 text-xs font-bold rounded-full">
                              {article.category}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          📅 {formatDate(article.publishedAt || article.createdAt)}
                        </span>
                        {article.readTime && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              ⏱️ {article.readTime} menit
                            </span>
                          </>
                        )}
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors line-clamp-2 leading-tight">
                        {article.title}
                      </h2>
                      <p className="text-gray-600 line-clamp-3 mb-4 text-sm leading-relaxed">
                        {article.excerpt}
                      </p>
                      {article.author && (
                        <div className="pt-4 border-t border-gray-100">
                          <p className="text-sm text-gray-600">
                            ✍️ <span className="font-medium text-gray-900">{article.author}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          <div className="text-center mt-16">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-blue-900 to-blue-800 text-white font-semibold rounded-xl hover:from-blue-800 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>

        <Footer />
        </div>
      </div>
    </ThemeProvider>
  );
}
