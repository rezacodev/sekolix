import { seedCore } from '../_core';
import { seedAkademik } from '../akademik';
import { seedUsers } from '../users';
import { seedGuru } from '../guru';
import { seedDummy } from '../dummy';
import { seedLandingPage } from '../landing-page/landing-page.seed';

/**
 * Full seeding scenario - complete dataset for development/testing
 */
export async function seedFull() {
  console.log('🚀 Running full seeding scenario...');

  // Seed core data
  const { school, years, programs } = await seedCore();

  // Seed academic structure
  const { subjects, classGroups } = await seedAkademik(years, programs);

  // Seed users
  await seedUsers(school);

  // Seed teacher data
  await seedGuru();

  // Seed landing page content
  await seedLandingPage();

  // Seed comprehensive dummy data
  await seedDummy(classGroups, years, programs, subjects);

  console.log('✅ Full seeding completed');
}