import { db } from '@/lib/db';
import AcademicClassicFacultyPage from '../../academic-classic/profil/faculty/page';
import ModernVibrantFacultyPage from '../../modern-vibrant/profil/faculty/page';
import MinimalistCleanFacultyPage from '../../minimalist-clean/profil/faculty/page';

type ThemeName = 'academic-classic' | 'modern-vibrant' | 'minimalist-clean';

async function getActiveTheme(): Promise<ThemeName> {
  try {
    const activeTheme = await db.themeConfig.findFirst({
      where: {
        isActive: true,
      },
      select: {
        themeId: true,
      },
    });

    return (activeTheme?.themeId as ThemeName) || 'academic-classic';
  } catch (error) {
    console.error('Error fetching active theme:', error);
    return 'academic-classic';
  }
}

export default async function FacultyPage() {
  const activeTheme = await getActiveTheme();

  switch (activeTheme) {
    case 'modern-vibrant':
      return <ModernVibrantFacultyPage />;
    case 'minimalist-clean':
      return <MinimalistCleanFacultyPage />;
    case 'academic-classic':
    default:
      return <AcademicClassicFacultyPage />;
  }
}