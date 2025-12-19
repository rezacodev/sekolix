'use client';

import { useEffect } from 'react';

interface ThemeProviderProps {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  borderColor: string;
  grayColor: string;
  headingFont: string;
  bodyFont: string;
  children: React.ReactNode;
}

export function ThemeProvider({
  primaryColor,
  secondaryColor,
  accentColor,
  textColor,
  borderColor,
  grayColor,
  headingFont,
  bodyFont,
  children,
}: ThemeProviderProps) {
  useEffect(() => {
    // Apply CSS variables to document root
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', primaryColor);
    root.style.setProperty('--theme-secondary', secondaryColor);
    root.style.setProperty('--theme-accent', accentColor);
    root.style.setProperty('--theme-text', textColor);
    root.style.setProperty('--theme-border', borderColor);
    root.style.setProperty('--theme-gray', grayColor);
    root.style.setProperty('--theme-heading-font', headingFont);
    root.style.setProperty('--theme-body-font', bodyFont);
  }, [primaryColor, secondaryColor, accentColor, textColor, borderColor, grayColor, headingFont, bodyFont]);

  return <>{children}</>;
}
