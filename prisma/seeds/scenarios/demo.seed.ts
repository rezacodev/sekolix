import { seedCore } from '../_core';
import { seedAkademik } from '../akademik';
import { seedUsers } from '../users';
import { seedGuru } from '../guru';
import { seedDummy } from '../dummy';
import { seedLandingPage } from '../landing-page/landing-page.seed';

/**
 * Demo seeding scenario - includes sample data for demonstration
 */
export async function seedDemo() {
  console.log('🎬 Running demo seeding scenario...');

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

  // Seed dummy data for demo purposes
  await seedDummy(classGroups, years, programs, subjects);

  console.log('✅ Demo seeding completed');
}