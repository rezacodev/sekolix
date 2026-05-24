import { seedUsersAndStaff } from './users.seed';
import type { SchoolIdentity } from '@prisma/client';

/**
 * Seed user management data
 */
export async function seedUsers(school: SchoolIdentity) {
  console.log('👤 Seeding user data...');

  const staff = await seedUsersAndStaff(school);

  console.log('✅ User data seeded');
  return { staff };
}