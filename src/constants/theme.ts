/**
 * Theme Constants
 * 
 * Configuration for theme system
 */

import type { ThemeType } from '@/types';

export const AVAILABLE_THEMES: ThemeType[] = [
  'academic-classic',
  'modern-vibrant',
  'minimalist-clean',
];

export const DEFAULT_THEME: ThemeType = 'academic-classic';

export const THEME_NAMES: Record<ThemeType, string> = {
  'academic-classic': 'Klasik Akademis',
  'modern-vibrant': 'Modern Vibrant',
  'minimalist-clean': 'Minimalis Bersih',
};

export const THEME_DESCRIPTIONS: Record<ThemeType, string> = {
  'academic-classic': 'Desain profesional dengan gaya akademik tradisional',
  'modern-vibrant': 'Desain modern dengan warna-warna cerah dan dinamis',
  'minimalist-clean': 'Desain minimalis dengan layout sederhana dan bersih',
};

export const DEFAULT_THEME_COLORS = {
  'academic-classic': {
    primaryColor: '#1e3a8a',
    secondaryColor: '#FFFFFF',
    accentColor: '#d97706',
    textColor: '#1f2937',
    borderColor: '#e5e7eb',
    grayColor: '#6b7280',
  },
  'modern-vibrant': {
    primaryColor: '#06b6d4',
    secondaryColor: '#f97316',
    accentColor: '#a855f7',
    textColor: '#0f172a',
    borderColor: '#e2e8f0',
    grayColor: '#64748b',
  },
  'minimalist-clean': {
    primaryColor: '#171717',
    secondaryColor: '#FFFFFF',
    accentColor: '#3b82f6',
    textColor: '#171717',
    borderColor: '#e5e5e5',
    grayColor: '#525252',
  },
};

export const DEFAULT_THEME_FONTS = {
  heading: "'Playfair Display', serif",
  body: "'Inter', sans-serif",
};
