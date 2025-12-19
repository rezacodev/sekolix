import { getActiveThemeId } from '@/lib/utils';
import AcademicClassicSejarah from '../../academic-classic/profil/sejarah/page';
import ModernVibrantSejarah from '../../modern-vibrant/profil/sejarah/page';
import MinimalistCleanSejarah from '../../minimalist-clean/profil/sejarah/page';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SejarahPage() {
  const activeThemeId = await getActiveThemeId();

  switch (activeThemeId) {
    case 'modern-vibrant':
      return <ModernVibrantSejarah />;
    case 'minimalist-clean':
      return <MinimalistCleanSejarah />;
    case 'academic-classic':
    default:
      return <AcademicClassicSejarah />;
  }
}
