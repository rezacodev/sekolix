import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getActiveThemeId } from '@/lib/utils';
import prisma from '@/lib/db';

// Import page components from each theme
import AcademicClassicArticleDetail from '../../../academic-classic/informasi/articles/[slug]/page';
import ModernVibrantArticleDetail from '../../../modern-vibrant/informasi/articles/[slug]/page';
import MinimalistCleanArticleDetail from '../../../minimalist-clean/informasi/articles/[slug]/page';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ArticleSlugRedirectProps {
  params: Promise<{ slug: string }>;
}

async function getArticle(slug: string) {
  try {
    const article = await prisma.article.findUnique({
      where: { 
        slug,
        isPublished: true,
      },
    });
    return article;
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

export async function generateMetadata({ params }: ArticleSlugRedirectProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return {
      title: 'Artikel Tidak Ditemukan',
    };
  }

  return {
    title: `${article.title} - SMK Negeri 1 Jakarta`,
    description: article.excerpt || article.metaDescription,
    keywords: article.tags?.join(', '),
    openGraph: {
      title: article.title,
      description: article.excerpt || article.metaDescription || '',
      images: article.featuredImage ? [article.featuredImage] : [],
    },
  };
}

export default async function ArticleSlugRedirect({ params }: ArticleSlugRedirectProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const article = await getArticle(slug);
  
  if (!article) {
    notFound();
  }

  const activeThemeId = await getActiveThemeId();

  // Wrap back into Promise for component compatibility
  const paramsPromise = Promise.resolve(resolvedParams);

  switch (activeThemeId) {
    case 'modern-vibrant':
      return <ModernVibrantArticleDetail params={paramsPromise} />;
    case 'minimalist-clean':
      return <MinimalistCleanArticleDetail params={paramsPromise} />;
    default:
      return <AcademicClassicArticleDetail params={paramsPromise} />;
  }
}
