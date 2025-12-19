import { redirect } from 'next/navigation';
import { db } from '@/lib/db';

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
  
  // Redirect to active theme page
  redirect(`/${activeTheme}`);
}
