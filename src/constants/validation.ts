/**
 * Validation Rules and Constants
 * 
 * Common validation patterns and error messages
 */

// Regex patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^(\+62|62|0)[0-9]{9,12}$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  nik: /^[0-9]{16}$/,
  url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
};

// Error messages
export const VALIDATION_MESSAGES = {
  required: 'Field ini wajib diisi',
  email: 'Masukkan email yang valid',
  phone: 'Masukkan nomor telepon yang valid',
  minLength: (min: number) => `Minimal ${min} karakter`,
  maxLength: (max: number) => `Maksimal ${max} karakter`,
  slug: 'Slug hanya boleh mengandung huruf kecil, angka, dan tanda hubung',
  nik: 'NIK harus 16 digit',
  url: 'Masukkan URL yang valid',
  passwordMismatch: 'Password tidak cocok',
};

// Length limits
export const LENGTH_LIMITS = {
  title: { min: 3, max: 255 },
  slug: { min: 3, max: 100 },
  description: { min: 10, max: 500 },
  content: { min: 50, max: 50000 },
  email: { min: 5, max: 255 },
  password: { min: 8, max: 255 },
  phone: { min: 10, max: 13 },
  name: { min: 3, max: 100 },
};

// File upload limits
export const FILE_UPLOAD_LIMITS = {
  maxSize: 10 * 1024 * 1024, // 10MB
  maxImageSize: 5 * 1024 * 1024, // 5MB
  maxVideoSize: 100 * 1024 * 1024, // 100MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  allowedVideoTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
};
