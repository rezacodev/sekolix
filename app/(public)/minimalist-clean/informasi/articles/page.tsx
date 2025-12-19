import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@prisma/client';
import prisma from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { getThemeConfigById, getDefaultThemeConfig } from '@/lib/utils';
import { ThemeProvider } from '@/components/ThemeProvider';
import { MinimalNavbar } from '@/components/themes/minimalist-clean';

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

export default async function MinimalistCleanArticlesPage() {
  const articles = await getArticles();
  const themeConfig = await getThemeConfigById('minimalist-clean') || getDefaultThemeConfig('minimalist-clean');

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
      <div className="min-h-screen bg-white">
        <MinimalNavbar />
        
        {/* Minimalist Header */}
        <div className="border-b border-neutral-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="max-w-3xl">
              <p className="text-sm font-bold tracking-widest text-neutral-500 mb-4 uppercase">Artikel</p>
              <h1 className="text-6xl md:text-7xl font-black mb-6 tracking-tight text-neutral-900 leading-none">
                Koleksi Tulisan
              </h1>
              <p className="text-xl text-neutral-600 leading-relaxed">
                Artikel edukatif dan informatif dari komunitas SMK Negeri 1 Jakarta
              </p>
            </div>
          </div>
        </div>

        {/* Articles Grid with Minimalist Style */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {articles.length === 0 ? (
            <div className="text-center py-32 border border-neutral-200 rounded">
              <p className="text-neutral-400 text-lg font-medium">Belum ada artikel tersedia</p>
            </div>
          ) : (
            <>
              {/* Simple Stats */}
              <div className="mb-20 flex items-center justify-between pb-6 border-b border-neutral-200">
                <div>
                  <span className="text-4xl font-black text-neutral-900">{articles.length}</span>
                  <span className="text-neutral-500 ml-2 font-medium">Artikel</span>
                </div>
                <div className="flex gap-8">
                  <div>
                    <span className="text-2xl font-black text-neutral-900">
                      {new Set(articles.map((a: Article) => a.category).filter(Boolean)).size}
                    </span>
                    <span className="text-neutral-500 ml-2 text-sm font-medium">Kategori</span>
                  </div>
                  <div>
                    <span className="text-2xl font-black text-neutral-900">
                      {new Set(articles.map((a: Article) => a.author).filter(Boolean)).size}
                    </span>
                    <span className="text-neutral-500 ml-2 text-sm font-medium">Penulis</span>
                  </div>
                </div>
              </div>

              <div className="space-y-16">
                {articles.map((article: Article) => (
                  <Link
                    key={article.id}
                    href={`/informasi/articles/${article.slug}`}
                    className="group block"
                  >
                    <article className="grid md:grid-cols-5 gap-8 items-start">
                      {/* Image */}
                      {article.featuredImage && (
                        <div className="md:col-span-2">
                          <div className="relative aspect-4/3 overflow-hidden bg-neutral-100">
                            <Image
                              src={article.featuredImage}
                              alt={article.title}
                              fill
                              className="object-cover transition-all duration-700 group-hover:scale-105"
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className={article.featuredImage ? "md:col-span-3" : "md:col-span-5"}>
                        <div className="flex items-center gap-4 mb-4">
                          {article.category && (
                            <span className="text-xs font-bold tracking-widest uppercase text-neutral-900 border-b-2 border-neutral-900 pb-1">
                              {article.category}
                            </span>
                          )}
                          <span className="text-sm text-neutral-500 font-medium">
                            {formatDate(article.publishedAt || article.createdAt)}
                          </span>
                          {article.readTime && (
                            <>
                              <span className="text-neutral-300">·</span>
                              <span className="text-sm text-neutral-500 font-medium">
                                {article.readTime} menit
                              </span>
                            </>
                          )}
                        </div>
                        
                        <h2 className="text-3xl md:text-4xl font-black mb-4 text-neutral-900 tracking-tight group-hover:underline decoration-2 underline-offset-4 transition-all">
                          {article.title}
                        </h2>
                        
                        <p className="text-neutral-600 text-lg leading-relaxed mb-6 line-clamp-3">
                          {article.excerpt}
                        </p>
                        
                        {article.author && (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white font-bold text-sm">
                              {article.author.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-neutral-900">{article.author}</div>
                              <div className="text-xs text-neutral-500 font-medium">Penulis</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* Minimalist Back Link */}
          <div className="mt-24 pt-12 border-t border-neutral-200">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-neutral-900 font-bold hover:gap-4 transition-all underline-effect"
            >
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
