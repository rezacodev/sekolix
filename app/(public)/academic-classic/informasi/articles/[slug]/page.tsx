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
import { Header, Footer } from "@/components/themes/academic-classic";

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

export default async function AcademicClassicArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);
  const themeConfig =
    (await getThemeConfigById("academic-classic")) || getDefaultThemeConfig("academic-classic");

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(slug, article.category);

  // Sanitize content to avoid invalid source map comments breaking rendering
  const sanitizedContent = sanitizeHtml(article.content || "");

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
          {/* Article Header - Classic Academic Style */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <Link
                href="/academic-classic/articles"
                className="inline-flex items-center gap-2 text-blue-900 hover:text-blue-70 font-semibold mb-8 transition-colors"
              >
                ← Kembali ke Artikel
              </Link>

              {article.category && (
                <div className="inline-block bg-blue-100 text-blue-900 px-4 py-2 rounded-lg text-sm font-bold mb-6 border border-blue-200">
                  📚 {article.category}
                </div>
              )}

              <h1 className="text-4xl md:text-5xl font-bold text-gray-90 mb-6 leading-tight">
                {article.title}
              </h1>

              <div className="flex items-center gap-6 text-gray-600 text-sm">
                <span className="flex items-center gap-2">
                  📅 {formatDate(article.publishedAt || article.createdAt)}
                </span>
                {article.author && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-2">
                      ✍️ <span className="font-semibold text-gray-900">{article.author}</span>
                    </span>
                  </>
                )}
                {article.readTime && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-2">
                      ⏱️ {article.readTime} menit baca
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Featured Image */}
          {article.featuredImage && (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="relative h-96 w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                <Image
                  src={article.featuredImage}
                  alt={article.title}
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
              </div>
            </div>
          )}

          {/* Article Content */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <article className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
              {article.excerpt && (
                <p className="text-xl text-gray-700 font-medium mb-8 pb-8 border-b border-gray-200 leading-relaxed">
                  {article.excerpt}
                </p>
              )}

              <div
                className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 hover:prose-a:text-blue-700 prose-strong:text-gray-900 prose-img:rounded-xl prose-img:border prose-img:border-gray-200"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">
                    Tags:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:bg-blue-50 hover:border-blue-20 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div className="mt-16">
                <h2 className="text-3xl font-bold text-gray-90 mb-8">Artikel Terkait</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedArticles.map((relatedArticle: Article) => (
                    <Link
                      key={relatedArticle.id}
                      href={`/informasi/articles/${relatedArticle.slug}`}
                      className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border-gray-200 hover:border-blue-300"
                    >
                      {relatedArticle.featuredImage && (
                        <div className="relative h-40 w-full overflow-hidden">
                          <Image
                            src={relatedArticle.featuredImage}
                            alt={relatedArticle.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                            unoptimized
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {relatedArticle.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {relatedArticle.excerpt}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Footer />
        </div>
      </div>
    </ThemeProvider>
  );
}
