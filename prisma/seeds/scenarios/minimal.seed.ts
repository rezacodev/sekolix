import { seedCore } from '../_core';
import { seedAkademik } from '../akademik';
import { seedUsers } from '../users';

/**
 * Minimal seeding scenario - only essential data
 */
export async function seedMinimal() {
  console.log('🔧 Running minimal seeding scenario...');

  const { school, years, programs } = await seedCore();
  await seedUsers(school);
  await seedAkademik(years, programs);

  console.log('✅ Minimal seeding completed');
}