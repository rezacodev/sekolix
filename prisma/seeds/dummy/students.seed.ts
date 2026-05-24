import { prisma } from "../utils/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { AssessmentType } from "@prisma/client";
import {
  generateName,
  generateNIK,
  generatePhone,
  getRandomItem,
  cities,
  religions,
  occupations,
  generateRandomDate
} from "../utils/seed-utils.seed";

/**
 * Seed students (peserta didik)
 */
export async function seedPesertaDidik(classGroups: Array<{ id: bigint; name: string; class_id: bigint; program_id: string; }>, years: Array<{ id: string; isActive: boolean; }>, numStudents = 120) {
  console.log("🎓 Seeding students (peserta didik)...");

  const students: Array<{ id: string; fullName: string; }> = [];
  const activeYear = years.find(y => y.isActive);

  if (!activeYear) {
    console.log("⚠️  No active academic year found, skipping students");
    return students;
  }

  // Distribute students across class groups
  const studentsPerGroup = Math.floor(numStudents / classGroups.length);

  for (const classGroup of classGroups) {
    const groupStudents = Math.min(studentsPerGroup, 40); // Max 40 per rombel

    for (let i = 1; i <= groupStudents; i++) {
      const birthDate = generateRandomDate(
        new Date(2005, 0, 1), // Born after 2005
        new Date(2009, 11, 31) // Born before 2010
      );

      const student = await prisma.pesertaDidik.upsert({
        where: {
          nik: generateNIK(),
        },
        update: {},
        create: {
          nik: generateNIK(),
          fullName: generateName(),
          phone: generatePhone(),
          placeOfBirth: getRandomItem(cities),
          dateOfBirth: birthDate,
          gender: Math.random() > 0.5 ? "MALE" : "FEMALE",
          religion: getRandomItem(religions),
          address: `${getRandomItem(cities)}, Indonesia`,
          fatherName: generateName(),
          fatherOccupation: getRandomItem(occupations),
          motherName: generateName(),
          motherOccupation: getRandomItem(occupations),
          entryYearId: activeYear.id,
          programId: classGroup.program_id,
        },
      });
      students.push(student);
    }
  }

  console.log(`✅ Created ${students.length} students`);
  return students;
}

/**
 * Seed assessments
 */
export async function seedAssessments(subjects: Array<{ id: bigint; code: string | null; name: string; }>, numAssessments = 50) {
  console.log("📝 Seeding assessments...");

  const assessments = [];
  const assessmentTypes = ["TUGAS", "UTS", "UAS", "PRAKTIK", "ULANGAN_HARIAN"];

  for (let i = 0; i < numAssessments; i++) {
    const subject = getRandomItem(subjects);
    const title = `Assessment ${i + 1} - ${subject.name}`;
    const type = getRandomItem(assessmentTypes) as AssessmentType;

    let assessment = await prisma.assessment.findFirst({
      where: {
        title: title,
        subject_id: subject.id,
      },
    });

    if (!assessment) {
      assessment = await prisma.assessment.create({
        data: {
          title: title,
          type: type,
          subject_id: subject.id,
          weight: Math.floor(Math.random() * 30) + 10, // 10-40 weight
          max_score: 100,
        },
      });
      console.log(`✅ Created assessment: ${assessment.title}`);
    } else {
      console.log(`ℹ️  Assessment already exists: ${assessment.title}`);
    }

    assessments.push(assessment);
  }

  return assessments;
}

/**
 * Seed grades
 */
export async function seedGrades(assessments: Array<{ id: bigint; }>, students: Array<{ id: string; }>, numGrades = 500) {
  console.log("📊 Seeding grades...");

  const grades = [];
  let gradeCount = 0;

  for (const assessment of assessments) {
    // Not all students take all assessments
    const participatingStudents = students
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(students.length * 0.8)); // 80% participation

    for (const student of participatingStudents) {
      if (gradeCount >= numGrades) break;

      // Generate realistic grades
      const baseScore = Math.floor(Math.random() * 40) + 60; // 60-100
      const finalScore = Math.max(0, Math.min(100, baseScore + (Math.random() * 10 - 5))); // Add some variation

      const grade = await prisma.grade.upsert({
        where: {
          student_id_assessment_id: {
            student_id: student.id,
            assessment_id: assessment.id,
          },
        },
        update: {},
        create: {
          student_id: student.id,
          assessment_id: assessment.id,
          score: Math.round(finalScore * 100) / 100, // Round to 2 decimal places
          notes: Math.random() > 0.8 ? "Perlu perbaikan" : null, // 20% have notes
        },
      });
      grades.push(grade);
      gradeCount++;
    }
  }

  console.log(`✅ Created ${grades.length} grades`);
  return grades.length;
}

/**
 * Seed report cards
 */
export async function seedReportCards(students: Array<{ id: string; }>, years: Array<{ id: string; isActive: boolean; }>, numReportCards = 50) {
  console.log("🎖️  Seeding report cards...");

  const reportCards: Array<{ id: bigint; student_id: string; academic_year_id: string; semester: string; average_score: Decimal | null; notes: string | null; deleted_at: Date | null; created_at: Date; updated_at: Date; }> = [];
  const activeYear = years.find(y => y.isActive);

  if (!activeYear) {
    console.log("⚠️  No active academic year found, skipping report cards");
    return reportCards;
  }

  // Create report cards for random students
  const selectedStudents = students
    .sort(() => Math.random() - 0.5)
    .slice(0, numReportCards);

  for (const student of selectedStudents) {
    const semester = Math.random() > 0.5 ? "GANJIL" : "GENAP";
    const reportCard = await prisma.reportCard.upsert({
      where: {
        student_id_academic_year_id_semester: {
          student_id: student.id,
          academic_year_id: activeYear.id,
          semester: semester,
        },
      },
      update: {},
      create: {
        student_id: student.id,
        academic_year_id: activeYear.id,
        semester: semester,
        average_score: Math.floor(Math.random() * 20) + 80, // 80-100
        notes: Math.random() > 0.7 ? "Siswa berprestasi" : null,
      },
    });
    reportCards.push(reportCard);
  }

  console.log(`✅ Created ${reportCards.length} report cards`);
  return reportCards.length;
}

/**
 * Seed exam results
 */
export async function seedExamResults(students: Array<{ id: string; }>, subjects: Array<{ id: bigint; code: string | null; name: string; }>, numResults = 100) {
  console.log("🧪 Seeding exam results...");

  const examResults = [];

  // Create exam results for random students and subjects
  for (let i = 0; i < numResults; i++) {
    const student = getRandomItem(students);
    const subject = getRandomItem(subjects);

    // First create or find an exam for this subject
    let exam = await prisma.exam.findFirst({
      where: {
        subject_id: subject.id,
        title: `Ujian ${subject.name}`,
      },
    });

    if (!exam) {
      exam = await prisma.exam.create({
        data: {
          subject_id: subject.id,
          title: `Ujian ${subject.name}`,
          description: `Ujian untuk mata pelajaran ${subject.name}`,
          duration: 120,
          total_questions: 50,
          passing_score: new Decimal(70.0),
        },
      });
    }

    const examResult = await prisma.examResult.upsert({
      where: {
        exam_id_student_id: {
          exam_id: exam.id,
          student_id: student.id,
        },
      },
      update: {},
      create: {
        exam_id: exam.id,
        student_id: student.id,
        score: new Decimal(Math.floor(Math.random() * 30) + 70), // 70-100
        answers: JSON.stringify({}), // Empty answers for now
        started_at: new Date(Date.now() - Math.random() * 86400000), // Random time within last 24 hours
        finished_at: new Date(),
      },
    });
    examResults.push(examResult);
  }

  console.log(`✅ Created ${examResults.length} exam results`);
  return examResults.length;
}