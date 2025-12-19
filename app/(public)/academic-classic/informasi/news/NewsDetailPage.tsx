import { ThemeProvider } from '@/components/ThemeProvider';
import { getThemeConfigById, getDefaultThemeConfig } from '@/lib/utils';
import { Header, Footer } from '@/components/themes/academic-classic';
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

export default async function AcademicClassicNewsDetail({ slug }: { slug: string }) {
  const news = await getNews(slug);
  const themeConfig = await getThemeConfigById('academic-classic') || getDefaultThemeConfig('academic-classic');
  
  if (!news) {
    notFound();
  }

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

        <header className="bg-linear-to-b from-blue-900 to-blue-800 text-white py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {news.category && <p className="text-xs uppercase tracking-[0.3em] text-blue-100">{news.category}</p>}
            <h1 className="text-3xl md:text-4xl font-bold mt-2">{news.title}</h1>
            <p className="text-blue-100 text-sm mt-3">{formatDate(news.publishedAt || news.createdAt)}</p>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <article className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 hover:prose-a:text-blue-700 prose-strong:text-gray-900 prose-img:rounded-xl prose-img:border prose-img:border-gray-200 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(news.content || '') }} />
          </article>
        </main>

        <Footer />
        </div>
      </div>
    </ThemeProvider>
  );
}
