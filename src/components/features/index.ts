/**
 * Feature-Specific Components
 * 
 * Organized by domain/module:
 * - admin: Admin dashboard specific components
 * - gallery: Gallery feature components
 * - media: Media picker and upload components
 * - spmb: Student admission system components
 * - theme: Theme-specific components
 */

// Admin features
export { default as ThemeSwitcher } from '../admin/ThemeSwitcher';
export { ImageUpload } from '../admin/ImageUpload';
export { LandingSectionsEditor } from '../admin/LandingSectionsEditor';

// Gallery features
export { default as EnhancedGallery } from '../gallery/EnhancedGallery';

// Media features
export { MediaPickerDialog } from '../media/media-picker-dialog';
