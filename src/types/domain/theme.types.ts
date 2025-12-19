/**
 * Theme types
 */

export type ThemeType = "academic-classic" | "modern-vibrant" | "minimalist-clean";

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
}

export interface ThemeFonts {
  heading: string;
  body: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  themeId: ThemeType;
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
