import { seedTeacherPortalData } from './teacher-portal.seed';
import { seedTeachingContent } from './seed-teaching-content';

/**
 * Seed teacher management data
 */
export async function seedGuru() {
  console.log('👨‍🏫 Seeding teacher data...');

  await seedTeacherPortalData();
  await seedTeachingContent();

  console.log('✅ Teacher data seeded');
}