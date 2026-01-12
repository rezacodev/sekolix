import { PrismaClient } from "@prisma/client";

// Import all seed functions
import { seedLandingPage } from "./landing-page.js";
import { seedRegistrationSettings, seedApplicants } from "./penerimaan-siswa.js";
import {
  seedSchoolIdentity,
  seedTahunAjaran,
  seedPrograms,
  seedAcademicEvents,
  seedUsersAndStaff,
  seedCurriculums,
  seedSubjects,
  seedSubjectCurriculums,
  seedSubjectPrograms,
  seedClasses,
  seedSubjectClasses,
  seedClassGroups,
  seedTeacherSubjects,
  seedClassSchedules,
  seedPesertaDidik,
  seedAssessments,
  seedGrades,
  seedReportCards,
  seedExamResults
} from "./manajemen-akademik.js";
import { seedRuangJamPelajaran } from "./ruang-jam-pelajaran.js";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🌱 Starting complete database seeding...\n");

    // ============================================
    // 1. LANDING PAGE CONTENT
    // ============================================
    const landingContent = await seedLandingPage();
    console.log("");

    // ============================================
    // 2. ACADEMIC MANAGEMENT - FOUNDATION
    // ============================================
    const school = await seedSchoolIdentity();
    const years = await seedTahunAjaran();
    const programs = await seedPrograms();
    const academicEvents = await seedAcademicEvents(years);
    console.log("");

    // ============================================
    // 3. CURRICULUMS & SUBJECTS
    // ============================================
    const curriculums = await seedCurriculums();
    const subjects = await seedSubjects();
    await seedSubjectCurriculums(curriculums, subjects);
    await seedSubjectPrograms(programs, subjects);
    console.log("");

    // ============================================
    // 4. CLASSES
    // ============================================
    const classes = await seedClasses();
    await seedSubjectClasses(classes, subjects);
    console.log("");

    // ============================================
    // 5. ROOMS & LESSON TIMES
    // ============================================
    await seedRuangJamPelajaran();
    console.log("");

    // ============================================
    // 6. USERS & STAFF
    // ============================================
    const { admin, staff } = await seedUsersAndStaff(school);
    console.log("");

    // ============================================
    // 7. CLASS GROUPS (ROMBEL)
    // ============================================
    const classGroups = await seedClassGroups(classes, programs, years);
    console.log("");

    // ============================================
    // 8. TEACHER SUBJECT ASSIGNMENTS (DISABLED FOR TESTING)
    // ============================================
    // const teacherAssignments = await seedTeacherSubjects(staff, subjects, classes);
    console.log("👨‍🏫 Skipping teacher subject assignments (will be set manually via UI)");
    console.log("");

    // ============================================
    // 9. CLASS SCHEDULES (DISABLED FOR TESTING)
    // ============================================
    // const scheduleCount = await seedClassSchedules(classGroups, subjects, staff);
    console.log("⏰ Skipping class schedules (will be set manually via UI)");
    console.log("");

    // ============================================
    // 10. STUDENT ADMISSION (for applicants only)
    // ============================================
    const registrationSettings = await seedRegistrationSettings(years);
    const applicants = await seedApplicants(registrationSettings, years, 50); // Calon siswa
    console.log("");

    // ============================================
    // 11. STUDENTS (PESERTA DIDIK) - Active Students
    // ============================================
    const students = await seedPesertaDidik(classGroups, years, programs, 120); // 40 siswa per tahun
    console.log("");

    // ============================================
    // 12. ASSESSMENTS & GRADES
    // ============================================
    const assessments = await seedAssessments(subjects);
    const gradeCount = await seedGrades(assessments, students);
    console.log("");

    // ============================================
    // 13. REPORT CARDS & EXAM RESULTS
    // ============================================
    const reportCardCount = await seedReportCards(students, years);
    const examResultCount = await seedExamResults(students, subjects);
    console.log("");

    // ============================================
    // SUMMARY
    // ============================================
    console.log("=".repeat(60));
    console.log("📊 SEEDING COMPLETED - SUMMARY");
    console.log("=".repeat(60));
    console.log(`🏫 School: ${school.name} (${school.schoolLevel})`);
    console.log(`📅 Active Year: ${years.find(y => y.isActive)?.label}`);
    console.log(`👥 Users: 1 admin + ${staff.length} staff`);
    console.log(`📚 Programs: ${Object.keys(programs).length}`);
    console.log(`📖 Curriculums: ${curriculums.length}`);
    console.log(`🎓 Classes: ${classes.length}`);
    console.log(`👨‍🎓 Rombel: ${classGroups.length}`);
    console.log(`📋 Applicants: ${applicants.length}`);
    console.log(`🎯 Students: ${students.length}`);
    console.log(`⏰ Class Schedules: 0 (will be set via UI)`);
    console.log(`📊 Assessments: ${assessments.length}`);
    console.log(`📈 Grades: ${gradeCount}`);
    console.log(`🎖️  Report Cards: ${reportCardCount}`);
    console.log(`🧪 Exam Results: ${examResultCount}`);
    console.log(`🌐 Landing Pages: ${landingContent.pages.length}`);
    console.log(`📰 Articles: ${landingContent.articles.length}`);
    console.log("=".repeat(60));

  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();