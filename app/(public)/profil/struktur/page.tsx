import { getActiveThemeId } from '@/lib/utils';
import AcademicClassicStruktur from '../../academic-classic/profil/struktur/page';
import ModernVibrantStruktur from '../../modern-vibrant/profil/struktur/page';
import MinimalistCleanStruktur from '../../minimalist-clean/profil/struktur/page';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function StrukturPage() {
  const activeThemeId = await getActiveThemeId();

  switch (activeThemeId) {
    case 'modern-vibrant':
      return <ModernVibrantStruktur />;
    case 'minimalist-clean':
      return <MinimalistCleanStruktur />;
    case 'academic-classic':
    default:
      return <AcademicClassicStruktur />;
  }
}
