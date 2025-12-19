import { db } from '@/lib/db';
import AcademicClassicPage from './(public)/academic-classic/page';
import ModernVibrantPage from './(public)/modern-vibrant/page';
import MinimalistCleanPage from './(public)/minimalist-clean/page';

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

export default async function HomePage() {
  const activeTheme = await getActiveTheme();
  
  // Render the appropriate theme component based on active theme
  switch (activeTheme) {
    case 'modern-vibrant':
      return <ModernVibrantPage />;
    case 'minimalist-clean':
      return <MinimalistCleanPage />;
    case 'academic-classic':
    default:
      return <AcademicClassicPage />;
  }
}
