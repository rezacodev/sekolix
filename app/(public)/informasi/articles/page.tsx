import { Metadata } from 'next';
import { getActiveThemeId } from '@/lib/utils';
import AcademicClassicArticles from '../../academic-classic/informasi/articles/AcademicClassicArticles';
import ModernVibrantArticles from '../../modern-vibrant/informasi/articles/ModernVibrantArticles';
import MinimalistCleanArticles from '../../minimalist-clean/informasi/articles/MinimalistCleanArticles';

export const metadata: Metadata = {
  title: 'Artikel - SMK Negeri 1 Jakarta',
  description: 'Baca artikel pendidikan dan informasi terkini dari SMK Negeri 1 Jakarta',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ArticlesPage() {
  const activeThemeId = await getActiveThemeId();

  switch (activeThemeId) {
    case 'modern-vibrant':
      return <ModernVibrantArticles />;
    case 'minimalist-clean':
      return <MinimalistCleanArticles />;
    case 'academic-classic':
    default:
      return <AcademicClassicArticles />;
  }
}
