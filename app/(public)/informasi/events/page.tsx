import { Metadata } from 'next';
import { getActiveThemeId } from '@/lib/utils';
import AcademicClassicEvents from '../../academic-classic/informasi/events/EventsPage';
import ModernVibrantEvents from '../../modern-vibrant/informasi/events/EventsPage';
import MinimalistCleanEvents from '../../minimalist-clean/informasi/events/EventsPage';

export const metadata: Metadata = {
  title: 'Agenda & Kegiatan - SMK Negeri 1 Jakarta',
  description: 'Daftar agenda dan kegiatan terbaru SMK Negeri 1 Jakarta',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EventsPage() {
  const activeThemeId = await getActiveThemeId();

  switch (activeThemeId) {
    case 'modern-vibrant':
      return <ModernVibrantEvents />;
    case 'minimalist-clean':
      return <MinimalistCleanEvents />;
    case 'academic-classic':
    default:
      return <AcademicClassicEvents />;
  }
}
