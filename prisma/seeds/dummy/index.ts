import { seedPesertaDidik, seedAssessments, seedGrades, seedReportCards, seedExamResults } from './students.seed';
import { seedApplicants } from './penerimaan-siswa.seed';

/**
 * Seed dummy/test data (NOT for production)
 */
export async function seedDummy(classGroups: Array<{ id: bigint; name: string; class_id: bigint; program_id: string; }>, years: Array<{ id: string; label: string; isActive: boolean; yearCode: string | null; }>, programs: Record<string, { id: string; code: string | null; name: string; }>, subjects: Array<{ id: bigint; code: string | null; name: string; }>) {
  console.log('🎭 Seeding dummy data...');

  // Only seed dummy data if not in production
  if (process.env.NODE_ENV === 'production') {
    console.log('⚠️  Skipping dummy data in production');
    return;
  }

  const applicants = await seedApplicants([], years, 50);
  const students = await seedPesertaDidik(classGroups, years, 120);
  const assessments = await seedAssessments(subjects);
  const gradeCount = await seedGrades(assessments, students);
  const reportCardCount = await seedReportCards(students, years);
  const examResultCount = await seedExamResults(students, subjects);

  console.log('✅ Dummy data seeded');
  return { applicants, students, assessments, gradeCount, reportCardCount, examResultCount };
}