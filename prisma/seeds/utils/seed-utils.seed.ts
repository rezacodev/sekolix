/**
 * Shared utilities and dummy data for seeding
 */

// Dummy data templates
export const firstNames = [
  "Adi", "Budi", "Citra", "Desy", "Eka", "Farhan", "Gita", "Hendra",
  "Indra", "Joko", "Ketut", "Lina", "Murni", "Nanda", "Oka", "Putri",
  "Qori", "Rini", "Siti", "Teguh", "Ursula", "Vina", "Wayan", "Yanti",
  "Zara", "Ahmad", "Bambang", "Dina", "Eni", "Faisal"
];

export const lastNames = [
  "Wijaya", "Santoso", "Rahmat", "Kusuma", "Hermawan", "Gunawan",
  "Pratama", "Suryanto", "Handoko", "Samosir", "Setiawan", "Supriyanto",
  "Sutrisno", "Suyanto"
];

export const cities = [
  "Jakarta", "Bandung", "Surabaya", "Medan", "Yogyakarta", "Semarang",
  "Makassar", "Tangerang"
];

export const religions = ["Islam", "Kristen Protestan", "Kristen Katolik", "Budha", "Hindu"];
export const occupations = ["PNS", "Swasta", "Petani", "Pedagang", "Pensiunan", "Buruh", "Profesional"];

export const schoolLevels = ["SD", "SMP", "SMA", "SMK"];
export const classLevels = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12

/**
 * Get a random item from an array
 */
export function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get a random integer between min and max (inclusive)
 */
export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random full name
 */
export function generateName() {
  return `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`;
}

/**
 * Generate a random NIK (Indonesian ID number)
 */
export function generateNIK() {
  return String(getRandomInt(1000000000000000, 9999999999999999));
}

/**
 * Generate a random NISN (National Student Identification Number)
 */
export function generateNISN() {
  return String(getRandomInt(10000000000, 99999999999));
}

/**
 * Generate a random phone number
 */
export function generatePhone() {
  return `08${String(getRandomInt(100000000, 999999999)).slice(0, 9)}`;
}

/**
 * Generate a random date between two dates
 */
export function generateRandomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * Format date to YYYY-MM-DD string
 */
export function formatDate(date: Date) {
  return date.toISOString().split('T')[0];
}

/**
 * Create a slug from a string
 */
export function createSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}