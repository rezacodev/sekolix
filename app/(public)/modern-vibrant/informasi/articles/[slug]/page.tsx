import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Article } from "@prisma/client";
import prisma from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/utils";
import { getThemeConfigById, getDefaultThemeConfig } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/themes/modern-vibrant";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getArticle(slug: string) {
  try {
    const article = await prisma.article.findUnique({
      where: {
        slug,
        isPublished: true
      }
    });
    return article;
  } catch (error) {
    console.error("Error fetching article:", error);
    return null;
  }
}

async function getRelatedArticles(currentSlug: string, category: string | null) {
  try {
    const articles = await prisma.article.findMany({
      where: {
        isPublished: true,
        slug: { not: currentSlug },
        ...(category && { category })
      },
      orderBy: { publishedAt: "desc" },
      take: 3
    });
    return articles;
  } catch (error) {
    console.error("Error fetching related articles:", error);
    return [];
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return {
      title: "Artikel Tidak Ditemukan"
    };
  }

  return {
    title: `${article.title} - SMK Negeri 1 Jakarta`,
    description: article.excerpt || article.metaDescription,
    keywords: article.tags?.join(", "),
    openGraph: {
      title: article.title,
      description: article.excerpt || article.metaDescription || "",
      images: article.featuredImage ? [article.featuredImage] : []
    }
  };
}

export default async function ModernVibrantArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);
  const themeConfig =
    (await getThemeConfigById("modern-vibrant")) || getDefaultThemeConfig("modern-vibrant");

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(slug, article.category);

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

        {/* Modern Vibrant Header */}
        <div className="relative overflow-hidden pt-8 pb-16">
          <div className="absolute inset-0 bg-linear-to-br from-cyan-500 via-purple-500 to-orange-500 opacity-10"></div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <Link
              href="/informasi/articles"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-black rounded-2xl hover:shadow-xl transition-all transform hover:scale-105 mb-8"
            >
              ← Kembali
            </Link>

            {article.category && (
              <div className="inline-block mb-6">
                <span className="px-5 py-2 bg-linear-to-r from-cyan-500 to-purple-500 text-white text-sm font-black rounded-full shadow-lg">
                  {article.category}
                </span>
              </div>
            )}

            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-gray-600 font-semibold">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full">
                📅 {formatDate(article.publishedAt || article.createdAt)}
              </div>
              {article.author && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full">
                  <div className="w-6 h-6 rounded-full bg-linear-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                    {article.author.charAt(0)}
                  </div>
                  <span className="text-gray-900">{article.author}</span>
                </div>
              )}
              {article.readTime && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full">
                  ⚡ {article.readTime} menit
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Featured Image - Modern Style */}
        {article.featuredImage && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
            <div className="relative h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-linear-to-br from-cyan-500/20 via-purple-500/20 to-orange-500/20 z-10"></div>
              <Image
                src={article.featuredImage}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        )}

        {/* Article Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <article className="bg-white rounded-3xl shadow-xl p-8 md:p-16">
            {article.excerpt && (
              <p className="text-2xl text-gray-700 font-semibold mb-12 pb-8 border-b-2 border-gray-200 leading-relaxed">
                {article.excerpt}
              </p>
            )}

            <div
              className="prose prose-xl max-w-none prose-headings:text-gray-900 prose-headings:font-black prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-transparent prose-a:bg-clip-text prose-a:bg-linear-to-r prose-a:from-cyan-600 prose-a:to-purple-600 prose-strong:text-gray-900 prose-img:rounded-2xl prose-img:shadow-lg"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content || "") }}
            />

            {/* Tags - Modern Style */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-16 pt-8 border-t-2 border-gray-200">
                <h3 className="text-sm font-black text-gray-900 mb-4 uppercase tracking-wider">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-3">
                  {article.tags.map((tag: string, index: number) => {
                    const gradients = [
                      "from-cyan-500 to-blue-500",
                      "from-purple-500 to-pink-500",
                      "from-orange-500 to-red-500"
                    ];
                    const gradient = gradients[index % gradients.length];

                    return (
                      <span
                        key={tag}
                        className={`px-4 py-2 bg-linear-to-r ${gradient} text-white text-sm font-black rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}
                      >
                        {tag}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </article>

          {/* Related Articles - Modern Grid */}
          {relatedArticles.length > 0 && (
            <div className="mt-16">
              <h2 className="text-4xl font-black text-gray-900 mb-8">Baca Juga</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((relatedArticle: Article, index: number) => {
                  const gradients = [
                    "from-cyan-500 to-blue-500",
                    "from-purple-500 to-pink-500",
                    "from-orange-500 to-red-500"
                  ];
                  const gradient = gradients[index % gradients.length];

                  return (
                    <Link
                      key={relatedArticle.id}
                      href={`/informasi/articles/${relatedArticle.slug}`}
                      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
                    >
                      {relatedArticle.featuredImage && (
                        <div className="relative h-40 w-full overflow-hidden">
                          <div
                            className={`absolute inset-0 bg-linear-to-br ${gradient} opacity-70`}
                          ></div>
                          <Image
                            src={relatedArticle.featuredImage}
                            alt={relatedArticle.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500 mix-blend-overlay"
                          />
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className="text-lg font-black text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-cyan-600 group-hover:to-purple-600 transition-all line-clamp-2">
                          {relatedArticle.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {relatedArticle.excerpt}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}
