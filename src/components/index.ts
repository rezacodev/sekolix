/**
 * Components Index
 * 
 * Central export point for all components organized by category:
 * - ui/: Generic UI primitives from shadcn/ui
 * - common/: Reusable components used across the app
 * - features/: Feature-specific components grouped by domain
 * - admin/: Admin dashboard components
 * - gallery/: Gallery feature components
 * - media/: Media handling components
 * - spmb/: Student admission system components
 * - themes/: Theme implementations (academic-classic, modern-vibrant, minimalist-clean)
 */

// UI Components
export * from './ui';

// Common Components
export * from './common';

// Feature Components
export * from './features';

// Other feature-specific exports
export { default as DynamicThemeRenderer } from './DynamicThemeRenderer';
export { ThemeProvider } from './ThemeProvider';
