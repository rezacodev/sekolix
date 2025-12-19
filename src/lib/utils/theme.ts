import { db } from '@/lib/db';

export interface ThemeConfig {
  id: string;
  name: string;
  themeId: string;
  isActive: boolean;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  borderColor: string;
  grayColor: string;
  headingFont: string;
  bodyFont: string;
  logoUrl: string | null;
  customLogoUrl: string | null;
  defaultPrimaryColor: string;
  defaultSecondaryColor: string;
  defaultAccentColor: string;
  defaultTextColor: string;
  defaultBorderColor: string;
  defaultGrayColor: string;
  defaultHeadingFont: string;
  defaultBodyFont: string;
}

/**
 * Get active theme configuration from database
 * Returns default config if no active theme found
 */
export async function getActiveThemeConfig(): Promise<ThemeConfig | null> {
  try {
    const activeTheme = await db.themeConfig.findFirst({
      where: {
        isActive: true,
      },
    });

    return activeTheme;
  } catch (error) {
    console.error('Error fetching active theme config:', error);
    return null;
  }
}

/**
 * Get theme configuration by themeId
 */
export async function getThemeConfigById(themeId: string): Promise<ThemeConfig | null> {
  try {
    const theme = await db.themeConfig.findUnique({
      where: {
        themeId,
      },
    });

    return theme;
  } catch (error) {
    console.error(`Error fetching theme config for ${themeId}:`, error);
    return null;
  }
}

/**
 * Generate CSS variables from theme config
 */
export function generateThemeVariables(config: ThemeConfig): string {
  return `
    :root {
      --theme-primary: ${config.primaryColor};
      --theme-secondary: ${config.secondaryColor};
      --theme-accent: ${config.accentColor};
      --theme-text: ${config.textColor};
      --theme-border: ${config.borderColor};
      --theme-gray: ${config.grayColor};
      --theme-heading-font: ${config.headingFont};
      --theme-body-font: ${config.bodyFont};
    }
  `;
}

/**
 * Get default theme config (fallback)
 */
export function getDefaultThemeConfig(themeId: string): ThemeConfig {
  const defaults: Record<string, Partial<ThemeConfig>> = {
    'academic-classic': {
      primaryColor: '#1e3a8a',
      secondaryColor: '#FFFFFF',
      accentColor: '#d97706',
      textColor: '#1f2937',
      borderColor: '#e5e7eb',
      grayColor: '#6b7280',
      headingFont: "'Playfair Display', serif",
      bodyFont: "'Inter', sans-serif",
    },
    'modern-vibrant': {
      primaryColor: '#06b6d4',
      secondaryColor: '#f97316',
      accentColor: '#a855f7',
      textColor: '#0f172a',
      borderColor: '#e2e8f0',
      grayColor: '#64748b',
      headingFont: "'Poppins', sans-serif",
      bodyFont: "'Poppins', sans-serif",
    },
    'minimalist-clean': {
      primaryColor: '#171717',
      secondaryColor: '#FFFFFF',
      accentColor: '#3b82f6',
      textColor: '#171717',
      borderColor: '#e5e5e5',
      grayColor: '#525252',
      headingFont: "'Inter', sans-serif",
      bodyFont: "'Inter', sans-serif",
    },
  };

  const defaultConfig = defaults[themeId] || defaults['academic-classic'];

  return {
    id: 'default',
    name: themeId,
    themeId,
    isActive: false,
    primaryColor: defaultConfig.primaryColor!,
    secondaryColor: defaultConfig.secondaryColor!,
    accentColor: defaultConfig.accentColor!,
    textColor: defaultConfig.textColor!,
    borderColor: defaultConfig.borderColor!,
    grayColor: defaultConfig.grayColor!,
    headingFont: defaultConfig.headingFont!,
    bodyFont: defaultConfig.bodyFont!,
    logoUrl: null,
    customLogoUrl: null,
    defaultPrimaryColor: defaultConfig.primaryColor!,
    defaultSecondaryColor: defaultConfig.secondaryColor!,
    defaultAccentColor: defaultConfig.accentColor!,
    defaultTextColor: defaultConfig.textColor!,
    defaultBorderColor: defaultConfig.borderColor!,
    defaultGrayColor: defaultConfig.grayColor!,
    defaultHeadingFont: defaultConfig.headingFont!,
    defaultBodyFont: defaultConfig.bodyFont!,
  };
}
