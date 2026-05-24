import { seedCurriculums, seedSubjects, seedSubjectCurriculums, seedSubjectPrograms } from './curriculum.seed';
import { seedClasses, seedSubjectClasses, seedClassGroups } from './classes.seed';
import { seedRuangJamPelajaran } from './ruang-jam-pelajaran.seed';

/**
 * Seed academic management data
 */
export async function seedAkademik(years: Array<{ id: string; isActive: boolean; }>, programs: Record<string, { id: string; code: string | null; name: string; }>) {
  console.log('📚 Seeding academic data...');

  const curriculums = await seedCurriculums();
  const subjects = await seedSubjects();
  await seedSubjectCurriculums(curriculums, subjects);
  await seedSubjectPrograms(programs, subjects);

  const classes = await seedClasses();
  await seedSubjectClasses(classes, subjects);
  const classGroups = await seedClassGroups(classes, programs, years);

  await seedRuangJamPelajaran();

  console.log('✅ Academic data seeded');
  return { curriculums, subjects, classes, classGroups };
}