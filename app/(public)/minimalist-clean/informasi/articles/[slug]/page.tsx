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
import { MinimalNavbar } from "@/components/themes/minimalist-clean";

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

export default async function MinimalistCleanArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);
  const themeConfig =
    (await getThemeConfigById("minimalist-clean")) || getDefaultThemeConfig("minimalist-clean");

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
      <div className="min-h-screen bg-white">
        <MinimalNavbar />

        {/* Minimalist Article Header */}
        <article className="border-b border-neutral-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <Link
              href="/informasi/articles"
              className="inline-flex items-center gap-2 text-neutral-900 font-bold mb-12 hover:gap-4 transition-all underline-effect"
            >
              ← Kembali ke Artikel
            </Link>

            <div className="flex items-center gap-4 mb-8">
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

            <h1 className="text-5xl md:text-6xl font-black text-neutral-900 mb-8 tracking-tight leading-none">
              {article.title}
            </h1>

            {article.author && (
              <div className="flex items-center gap-4 pt-6 border-t border-neutral-200">
                <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center text-white font-bold">
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

        {/* Featured Image - Minimalist */}
        {article.featuredImage && (
          <div className="border-b border-neutral-200">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="relative aspect-21/9 overflow-hidden bg-neutral-100">
                <Image
                  src={article.featuredImage}
                  alt={article.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        )}

        {/* Article Content - Minimalist Typography */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {article.excerpt && (
            <p className="text-2xl text-neutral-600 mb-12 pb-12 border-b border-neutral-200 leading-relaxed font-medium">
              {article.excerpt}
            </p>
          )}

          <div
            className="prose prose-xl max-w-none prose-headings:text-neutral-900 prose-headings:font-black prose-headings:tracking-tight prose-p:text-neutral-700 prose-p:leading-relaxed prose-a:text-neutral-900 prose-a:underline prose-a:decoration-2 prose-a:underline-offset-4 hover:prose-a:decoration-4 prose-strong:text-neutral-900 prose-strong:font-black prose-img:border prose-img:border-neutral-200"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content || "") }}
          />

          {/* Tags - Minimalist Style */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-16 pt-12 border-t border-neutral-200">
              <h3 className="text-xs font-bold tracking-widest text-neutral-500 mb-6 uppercase">
                Tags
              </h3>
              <div className="flex flex-wrap gap-3">
                {article.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-4 py-2 border border-neutral-900 text-neutral-900 text-sm font-bold hover:bg-neutral-900 hover:text-white transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Related Articles - Minimalist List */}
        {relatedArticles.length > 0 && (
          <div className="border-t border-neutral-200 bg-neutral-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <h2 className="text-3xl font-black text-neutral-900 mb-12 tracking-tight">
                Artikel Lainnya
              </h2>
              <div className="space-y-12">
                {relatedArticles.map((relatedArticle: Article) => (
                  <Link
                    key={relatedArticle.id}
                    href={`/informasi/articles/${relatedArticle.slug}`}
                    className="group block"
                  >
                    <article className="grid md:grid-cols-3 gap-8 items-start">
                      {relatedArticle.featuredImage && (
                        <div className="md:col-span-1">
                          <div className="relative aspect-4/3 overflow-hidden bg-neutral-100">
                            <Image
                              src={relatedArticle.featuredImage}
                              alt={relatedArticle.title}
                              fill
                              className="object-cover transition-all duration-700 group-hover:scale-105"
                            />
                          </div>
                        </div>
                      )}
                      <div
                        className={relatedArticle.featuredImage ? "md:col-span-2" : "md:col-span-3"}
                      >
                        <h3 className="text-2xl font-black text-neutral-900 mb-3 tracking-tight group-hover:underline decoration-2 underline-offset-4">
                          {relatedArticle.title}
                        </h3>
                        <p className="text-neutral-600 leading-relaxed line-clamp-2">
                          {relatedArticle.excerpt}
                        </p>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}
