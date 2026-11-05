import { seedSchoolIdentity, seedTahunAjaran, seedPrograms, seedAcademicEvents } from "./foundation.seed";
import { seedGovernanceFoundation } from "./governance.seed";

/**
 * Seed core/master data that is safe for production.
 */
export async function seedCore() {
  console.log("Seeding core data...");

  const school = await seedSchoolIdentity();
  const years = await seedTahunAjaran();
  const programs = await seedPrograms();
  await seedAcademicEvents(years);
  await seedGovernanceFoundation();

  console.log("Core data seeded");
  return { school, years, programs };
}
