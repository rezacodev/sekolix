import { ThemeProvider } from '@/components/ThemeProvider';
import { getThemeConfigById, getDefaultThemeConfig } from '@/lib/utils';
import { Navbar, VibrantFooter } from '@/components/themes/modern-vibrant';
import { formatDate } from '@/lib/utils';
import { sanitizeHtml } from '@/lib/utils';
import prisma from '@/lib/db';
import { notFound } from 'next/navigation';

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

export default async function ModernVibrantNewsDetail({ slug }: { slug: string }) {
  const news = await getNews(slug);
  const themeConfig = await getThemeConfigById('modern-vibrant') || getDefaultThemeConfig('modern-vibrant');
  
  if (!news) {
    notFound();
  }

  return (
    <ThemeProvider {...themeConfig}>
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <Navbar />

        <main className="pt-20">
          <section className="bg-linear-to-r from-cyan-500 to-purple-500 text-white py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-4xl font-bold mb-4">{news.title}</h1>
              <p className="text-lg text-cyan-100">{formatDate(news.publishedAt || news.createdAt)}</p>
            </div>
          </section>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <article className="prose prose-lg max-w-none prose-invert prose-headings:text-white prose-p:text-slate-100 prose-a:text-cyan-400 hover:prose-a:text-purple-400 prose-strong:text-white bg-slate-800/60 border border-white/10 rounded-2xl p-6">
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(news.content || '') }} />
            </article>
          </div>
        </main>

        <VibrantFooter
          schoolName="SMK Negeri 1 Jakarta"
          address="Jl. Pendidikan No. 123, Jakarta"
          phone="(021) 1234-5678"
          email="info@smkn1jakarta.sch.id"
          socialMedia={{
            facebook: 'https://facebook.com/smkn1jakarta',
            instagram: 'https://instagram.com/smkn1jakarta',
            twitter: 'https://twitter.com/smkn1jakarta',
          }}
        />
      </div>
    </ThemeProvider>
  );
}
