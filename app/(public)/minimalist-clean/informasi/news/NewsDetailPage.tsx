import { ThemeProvider } from '@/components/ThemeProvider';
import { getThemeConfigById, getDefaultThemeConfig } from '@/lib/utils';
import { MinimalNavbar, MinimalFooter } from '@/components/themes/minimalist-clean';
import { formatDate } from '@/lib/utils';
import { sanitizeHtml } from '@/lib/utils';
import prisma from '@/lib/db';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getNews(slug: string) {
  try {
    const news = await prisma.news.findFirst({
      where: { 
        slug,
        isPublished: true,
      },
    });
    return news;
  } catch (error) {
    console.error('Error fetching news:', error);
    return null;
  }
}

export default async function MinimalistCleanNewsDetail({ slug }: { slug: string }) {
  const news = await getNews(slug);
  const themeConfig = await getThemeConfigById('minimalist-clean') || getDefaultThemeConfig('minimalist-clean');
  
  if (!news) {
    notFound();
  }

  return (
    <ThemeProvider {...themeConfig}>
      <div className="min-h-screen bg-white text-slate-900">
        <MinimalNavbar />

        <main className="pt-28 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="space-y-2">
              {news.category && <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{news.category}</p>}
              <h1 className="text-4xl font-light leading-tight">{news.title}</h1>
              <p className="text-sm text-slate-500">{formatDate(news.publishedAt || news.createdAt)}</p>
            </div>

            <article className="prose prose-lg max-w-none prose-headings:text-slate-900 prose-headings:font-light prose-p:text-slate-700 prose-a:text-slate-900 prose-a:underline prose-strong:text-slate-900 bg-slate-50 border border-slate-200 p-8 rounded-2xl">
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(news.content || '') }} />
            </article>
          </div>
        </main>

        <MinimalFooter
          schoolName="SMK Negeri 1 Jakarta"
          description="Sekolah vokasi dengan budaya kolaboratif, teknologi, dan karakter kuat."
          address="Jl. Pendidikan No. 45, Jakarta Pusat"
          phone="(021) 4567-8910"
          email="info@smkn1jakarta.sch.id"
        />
      </div>
    </ThemeProvider>
  );
}
