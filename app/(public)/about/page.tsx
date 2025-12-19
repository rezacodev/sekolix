import { Metadata } from 'next';
import { getActiveThemeId } from '@/lib/utils';
import AcademicClassicAbout from '../academic-classic/about/AboutPage';
import ModernVibrantAbout from '../modern-vibrant/about/AboutPage';
import MinimalistCleanAbout from '../minimalist-clean/about/AboutPage';

export const metadata: Metadata = {
  title: 'Tentang Kami - SMK Negeri 1 Jakarta',
  description: 'Profil singkat SMK Negeri 1 Jakarta',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AboutPage() {
  const activeThemeId = await getActiveThemeId();

  switch (activeThemeId) {
    case 'modern-vibrant':
      return <ModernVibrantAbout />;
    case 'minimalist-clean':
      return <MinimalistCleanAbout />;
    case 'academic-classic':
    default:
      return <AcademicClassicAbout />;
  }
}
