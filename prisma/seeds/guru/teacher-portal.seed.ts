import { prisma } from "../utils/prisma";
import { DayOfWeek, AssessmentType } from "@prisma/client";

/**
 * Enhanced seeding for Teacher Portal
 * Ensures guru@sekolix.com has complete data for testing:
 * - Multiple classes with different grades
 * - Multiple subjects assigned
 * - Students in each class
 * - Complete schedules
 */
export async function seedTeacherPortalData() {
  console.log("\n🎓 Seeding Teacher Portal Data...");

  try {
    // Find guru@sekolix.com user
    const teacherUser = await prisma.user.findUnique({
      where: { email: "guru@sekolix.com" },
      include: {
        staff: true,
      },
    });

    if (!teacherUser || !teacherUser.staff || teacherUser.staff.length === 0) {
      console.log("⚠️  Teacher user (guru@sekolix.com) not found. Please run main seeding first.");
      return;
    }

    // Get the first staff record (should only be one for teacher)
    const teacherStaff = teacherUser.staff[0];
    const teacherId = teacherStaff.id;
    console.log(`✓ Found teacher: ${teacherStaff.name} (ID: ${teacherId})`);

    // Get active tahun ajaran
    const activeTahunAjaran = await prisma.tahunAjaran.findFirst({
      where: { isActive: true },
    });

    if (!activeTahunAjaran) {
      console.log("⚠️  No active tahun ajaran found");
      return;
    }

    // Get or create subjects
    const subjects = await ensureSubjects();
    console.log(`✓ Found ${subjects.length} subjects`);

    // Get or create classes
    const classes = await ensureClasses();
    console.log(`✓ Found ${classes.length} classes`);

    // Get or create program
    const program = await prisma.program.findFirst({
      where: { isActive: true },
    });

    if (!program) {
      console.log("⚠️  No program found");
      return;
    }

    // Create rombels for each class
    const rombels = await ensureRombels(classes, program, activeTahunAjaran);
    console.log(`✓ Created/found ${rombels.length} rombels`);

    // Assign teacher to subjects and classes
    await assignTeacherToClasses(teacherId, subjects, classes, rombels);

    // Create students for each rombel
    await createStudentsForRombels(rombels);

    // Create schedules for teacher
    await createSchedulesForTeacher(teacherId);

    // Create sample rubrics for all subjects and rombels
    await createSampleRubrics(teacherId);

    console.log("✅ Teacher portal data seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding teacher portal data:", error);
    throw error;
  }
}

async function ensureSubjects() {
  const subjectData = [
    { name: "Matematika", code: "MTK", is_practice: false },
    { name: "Bahasa Indonesia", code: "BIND", is_practice: false },
    { name: "Bahasa Inggris", code: "BING", is_practice: false },
    { name: "Fisika", code: "FIS", is_practice: false },
    { name: "Kimia", code: "KIM", is_practice: false },
    { name: "Biologi", code: "BIO", is_practice: false },
  ];

  const subjects = [];

  for (const data of subjectData) {
    let subject = await prisma.subject.findFirst({
      where: { code: data.code },
    });

    if (!subject) {
      subject = await prisma.subject.create({ data });
    }

    subjects.push(subject);
  }

  return subjects;
}

async function ensureClasses() {
  const classData = [
    { name: "X" },
    { name: "XI" },
    { name: "XII" },
  ];

  const classes = [];

  for (const data of classData) {
    let cls = await prisma.class.findFirst({
      where: { name: data.name, deleted_at: null },
    });

    if (!cls) {
      cls = await prisma.class.create({ data });
    }

    classes.push(cls);
  }

  return classes;
}

async function ensureRombels(classes: Array<{ id: bigint; name: string; }>, program: { id: string; }, tahunAjaran: { id: string; }) {
  const rombelNames = ["A", "B", "C"];
  const rombels = [];

  for (const cls of classes) {
    for (const rombelName of rombelNames) {
      const name = `${cls.name}-${rombelName}`;

      let rombel = await prisma.rombel.findFirst({
        where: {
          name,
          class_id: cls.id,
          program_id: program.id,
          tahunAjaranId: tahunAjaran.id,
          deleted_at: null,
        },
      });

      if (!rombel) {
        rombel = await prisma.rombel.create({
          data: {
            name,
            class_id: cls.id,
            program_id: program.id,
            tahunAjaranId: tahunAjaran.id,
            capacity: 30,
          },
        });
        console.log(`  ✓ Created rombel: ${name}`);
      }

      rombels.push(rombel);
    }
  }

  return rombels;
}

async function assignTeacherToClasses(
  teacherId: string,
  subjects: Array<{ id: bigint; code: string | null; name: string; is_practice: boolean; deleted_at: Date | null; created_at: Date; updated_at: Date; }>,
  classes: Array<{ id: bigint; name: string; deleted_at: Date | null; created_at: Date; updated_at: Date; }>,
  rombels: Array<{ id: bigint; class_id: bigint; program_id: string; tahunAjaranId: string | null; name: string; capacity: number | null; student_count: number; deleted_at: Date | null; created_at: Date; updated_at: Date; }>
) {
  console.log("\n📚 Assigning teacher to classes...");
  console.log(`   Teacher ID: ${teacherId}`);

  // Assign teacher to teach Math and Physics for all rombels
  const teacherSubjects = [subjects[0], subjects[3]]; // Matematika and Fisika
  
  console.log(`   Subjects to assign: ${teacherSubjects.map(s => s.name).join(", ")}`);
  console.log(`   Rombels: ${rombels.length}`);

  let assignmentCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const subject of teacherSubjects) {
    for (const rombel of rombels) {
      // Check if assignment exists for this teacher-subject-class (regardless of rombel)
      const existingByClass = await prisma.teacherSubject.findFirst({
        where: {
          teacher_id: teacherId,
          subject_id: subject.id,
          class_id: rombel.class_id,
        },
      });

      if (existingByClass) {
        // Update existing to add rombel_id if it's null
        if (existingByClass.rombel_id === null) {
          await prisma.teacherSubject.update({
            where: { id: existingByClass.id },
            data: { rombel_id: rombel.id },
          });
          updatedCount++;
          console.log(
            `  ✓ Updated ${subject.name} for class ${rombel.class_id} to rombel ${rombel.name}`
          );
        } else if (existingByClass.rombel_id.toString() === rombel.id.toString()) {
          skippedCount++;
        } else {
          // Different rombel for same class - this is what we want
          // But unique constraint prevents it, so we skip
          skippedCount++;
        }
      } else {
        // No existing assignment for this class, create new
        await prisma.teacherSubject.create({
          data: {
            teacher_id: teacherId,
            subject_id: subject.id,
            class_id: rombel.class_id,
            rombel_id: rombel.id,
          },
        });
        assignmentCount++;
        console.log(
          `  ✓ Assigned ${subject.name} to rombel ${rombel.name}`
        );
      }
    }
  }

  console.log(`✓ Created ${assignmentCount} new assignments`);
  if (updatedCount > 0) {
    console.log(`✓ Updated ${updatedCount} assignments to include rombel`);
  }
  if (skippedCount > 0) {
    console.log(`ℹ️  Skipped ${skippedCount} existing assignments`);
  }
}

async function createStudentsForRombels(rombels: Array<{ id: bigint; class_id: bigint; program_id: string; tahunAjaranId: string | null; name: string; capacity: number | null; student_count: number; deleted_at: Date | null; created_at: Date; updated_at: Date; }>) {
  console.log("\n👨‍🎓 Creating students for rombels...");

  const firstNames = [
    "Ahmad", "Budi", "Citra", "Dewi", "Eka", "Fajar", "Gita", "Hadi",
    "Indra", "Joko", "Kartika", "Lina", "Maya", "Nanda", "Omar", "Putri",
  ];
  const lastNames = [
    "Santoso", "Wijaya", "Pratama", "Kusuma", "Hermawan", "Gunawan",
  ];

  let totalCreated = 0;

  for (const rombel of rombels) {
    // Check existing students
    const existingCount = await prisma.pesertaDidik.count({
      where: {
        rombels: {
          some: {
            id: rombel.id,
          },
        },
        deleted_at: null,
      },
    });

    const studentsToCreate = Math.max(0, 20 - existingCount);

    if (studentsToCreate === 0) {
      console.log(`  ℹ️  Rombel ${rombel.name} already has students`);
      continue;
    }

    for (let i = 0; i < studentsToCreate; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const fullName = `${firstName} ${lastName}`;
      const nisn = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-10);
      const nik = `${Date.now()}${Math.floor(Math.random() * 100000)}`.slice(-16);

      // Create student with rombel connection
      await prisma.pesertaDidik.create({
        data: {
          fullName,
          nisn,
          nik,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@student.sekolix.com`,
          phone: `08${Math.floor(Math.random() * 1000000000)}`,
          gender: Math.random() > 0.5 ? "MALE" : "FEMALE",
          placeOfBirth: "Jakarta",
          dateOfBirth: new Date(2008, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          address: `Jl. Sample ${Math.floor(Math.random() * 100)}`,
          status: "accepted",
          rombels: {
            connect: {
              id: rombel.id,
            },
          },
        },
      });

      totalCreated++;
    }

    console.log(`  ✓ Created ${studentsToCreate} students for ${rombel.name}`);
  }

  console.log(`✓ Total students created: ${totalCreated}`);
}

async function createSchedulesForTeacher(teacherId: string, /* subjects, rombels */) {
  console.log("\n⏰ Creating schedules for teacher...");

  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

  const timeSlots = [
    { start: "07:00:00", end: "07:45:00" },
    { start: "07:45:00", end: "08:30:00" },
    { start: "08:45:00", end: "09:30:00" },
    { start: "09:30:00", end: "10:15:00" },
    { start: "10:30:00", end: "11:15:00" },
    { start: "11:15:00", end: "12:00:00" },
  ];

  let scheduleCount = 0;

  // Get all teacher-subject assignments for this teacher
  const teacherSubjects = await prisma.teacherSubject.findMany({
    where: {
      teacher_id: teacherId,
    },
    include: {
      subject: true,
      rombel: true,
    },
  });

  for (const teacherSubject of teacherSubjects) {
    // Create 2 schedules per week for each teacher-subject assignment
    for (let i = 0; i < 2; i++) {
      const day = days[Math.floor(Math.random() * days.length)] as DayOfWeek;
      const timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];

      // Check if schedule already exists
      const existing = await prisma.classSchedule.findFirst({
        where: {
          teacher_subject_id: teacherSubject.id,
          day,
        },
      });

      if (!existing) {
        await prisma.classSchedule.create({
          data: {
            rombel_id: teacherSubject.rombel_id,
            class_id: teacherSubject.class_id,
            teacher_subject_id: teacherSubject.id,
            day,
            start_time: new Date(`1970-01-01T${timeSlot.start}Z`),
            end_time: new Date(`1970-01-01T${timeSlot.end}Z`),
            room: `R-${Math.floor(Math.random() * 20) + 1}`,
          },
        });
        scheduleCount++;
      }
    }
  }

  console.log(`✓ Created ${scheduleCount} schedules`);
}

async function createSampleRubrics(teacherId: string) {
  console.log("\n🎯 Creating sample assessment rubrics for all teacher subjects and rombels...");

  // Get all teacher subjects with rombels
  const teacherSubjects = await prisma.teacherSubject.findMany({
    where: {
      teacher_id: teacherId,
      deleted_at: null,
    },
    include: {
      subject: true,
      rombel: true,
    },
  });

  if (teacherSubjects.length === 0) {
    console.log("⚠️  No teacher subjects found, skipping rubric creation");
    return;
  }

  console.log(`✓ Found ${teacherSubjects.length} teacher subject assignments`);

  let totalRubricCount = 0;

  // Group by subject to create rubrics for each subject-rombel combination
  const subjectGroups = new Map();

  for (const ts of teacherSubjects) {
    const subjectId = ts.subject_id.toString();
    if (!subjectGroups.has(subjectId)) {
      subjectGroups.set(subjectId, {
        subject: ts.subject,
        rombels: [],
      });
    }
    subjectGroups.get(subjectId).rombels.push(ts.rombel);
  }

  // Create rubrics for each subject and its rombels
  const subjectGroupsArray = Array.from(subjectGroups.values());
  for (const data of subjectGroupsArray) {
    const { subject, rombels } = data;
    console.log(`\n📚 Creating rubrics for ${subject.name} (${rombels.length} rombels)`);

    let subjectRubricCount = 0;

    for (const rombel of rombels) {
      // Create rubrics for this subject-rombel combination
      subjectRubricCount += await createRubricsForSubjectAndRombel(subject, rombel);
    }

    console.log(`✓ Created ${subjectRubricCount} rubrics for ${subject.name}`);
    totalRubricCount += subjectRubricCount;
  }

  console.log(`\n✅ Total rubrics created: ${totalRubricCount}`);
}

async function createRubricsForSubjectAndRombel(
  subject: { id: bigint; code: string | null; name: string; is_practice: boolean; deleted_at: Date | null; created_at: Date; updated_at: Date; },
  rombel: { id: bigint; name: string; }
) {
  let rubricCount = 0;

  // 1. Rubrik untuk Tugas Proyek
  const existingTugasProyek = await prisma.assessmentRubric.findFirst({
    where: {
      subject_id: subject.id,
      rombel_id: rombel.id,
      name: `Tugas Proyek ${subject.name}`,
      deleted_at: null
    }
  });

  if (!existingTugasProyek) {
    await prisma.assessmentRubric.create({
      data: {
        subject_id: subject.id,
        rombel_id: rombel.id,
        name: `Tugas Proyek ${subject.name}`,
        description: `Penilaian proyek ${subject.name.toLowerCase()} dalam kehidupan sehari-hari`,
        type: AssessmentType.TUGAS,
        weight: 2,
        max_score: 100,
        is_active: true,
        criteria: {
          create: getProjectCriteria(subject)
        }
      }
    });
    rubricCount++;
    console.log(`  ✓ Created rubric: Tugas Proyek ${subject.name} for ${rombel.name}`);
  }

  // 2. Rubrik untuk Praktik
  const existingPraktik = await prisma.assessmentRubric.findFirst({
    where: {
      subject_id: subject.id,
      rombel_id: rombel.id,
      name: `Praktik ${subject.name}`,
      deleted_at: null
    }
  });

  if (!existingPraktik) {
    await prisma.assessmentRubric.create({
      data: {
        subject_id: subject.id,
        rombel_id: rombel.id,
        name: `Praktik ${subject.name}`,
        description: `Penilaian kemampuan praktik ${subject.name.toLowerCase()}`,
        type: AssessmentType.PRAKTIK,
        weight: 1,
        max_score: 100,
        is_active: true,
        criteria: {
          create: getPracticeCriteria(subject)
        }
      }
    });
    rubricCount++;
    console.log(`  ✓ Created rubric: Praktik ${subject.name} for ${rombel.name}`);
  }

  // 3. Rubrik untuk Ulangan Harian
  const existingUH = await prisma.assessmentRubric.findFirst({
    where: {
      subject_id: subject.id,
      rombel_id: rombel.id,
      name: `Ulangan Harian ${subject.name}`,
      deleted_at: null
    }
  });

  if (!existingUH) {
    await prisma.assessmentRubric.create({
      data: {
        subject_id: subject.id,
        rombel_id: rombel.id,
        name: `Ulangan Harian ${subject.name}`,
        description: `Penilaian ulangan harian materi ${subject.name.toLowerCase()}`,
        type: AssessmentType.ULANGAN_HARIAN,
        weight: 2,
        max_score: 100,
        is_active: true,
        criteria: {
          create: getQuizCriteria(subject)
        }
      }
    });
    rubricCount++;
    console.log(`  ✓ Created rubric: Ulangan Harian ${subject.name} for ${rombel.name}`);
  }

  return rubricCount;
}

// Helper functions for creating subject-specific criteria
function getProjectCriteria(subject: { name: string; code: string | null }) {
  const subjectName = subject.name.toLowerCase();

  if (subject.code === "MTK" || subjectName.includes("matematika")) {
    return [
      {
        name: "Kelengkapan Data",
        description: "Kelengkapan data dan informasi yang dikumpulkan",
        max_score: 25,
        order: 0
      },
      {
        name: "Analisis",
        description: "Ketepatan analisis dan penerapan konsep matematika",
        max_score: 30,
        order: 1
      },
      {
        name: "Presentasi",
        description: "Kualitas presentasi dan komunikasi hasil",
        max_score: 25,
        order: 2
      },
      {
        name: "Kreativitas",
        description: "Kreativitas dan inovasi dalam penyajian",
        max_score: 20,
        order: 3
      }
    ];
  } else if (subject.code === "BIND" || subjectName.includes("bahasa indonesia")) {
    return [
      {
        name: "Struktur dan Tata Bahasa",
        description: "Ketepatan struktur dan penggunaan tata bahasa",
        max_score: 30,
        order: 0
      },
      {
        name: "Isi dan Gagasan",
        description: "Kedalaman isi dan kejelasan gagasan",
        max_score: 30,
        order: 1
      },
      {
        name: "Kosa Kata",
        description: "Penggunaan kosa kata yang tepat dan bervariasi",
        max_score: 20,
        order: 2
      },
      {
        name: "Presentasi",
        description: "Kualitas penyajian dan komunikasi",
        max_score: 20,
        order: 3
      }
    ];
  } else if (subject.code === "BING" || subjectName.includes("bahasa inggris")) {
    return [
      {
        name: "Grammar & Structure",
        description: "Accuracy in grammar and sentence structure",
        max_score: 30,
        order: 0
      },
      {
        name: "Vocabulary",
        description: "Appropriate vocabulary usage and range",
        max_score: 25,
        order: 1
      },
      {
        name: "Content & Ideas",
        description: "Clarity and development of ideas",
        max_score: 25,
        order: 2
      },
      {
        name: "Presentation",
        description: "Overall presentation and communication",
        max_score: 20,
        order: 3
      }
    ];
  } else {
    // Default criteria for other subjects
    return [
      {
        name: "Kelengkapan Materi",
        description: "Kelengkapan materi dan informasi yang disajikan",
        max_score: 30,
        order: 0
      },
      {
        name: "Pemahaman Konsep",
        description: "Tingkat pemahaman konsep dan teori",
        max_score: 30,
        order: 1
      },
      {
        name: "Penerapan",
        description: "Kemampuan menerapkan konsep dalam praktik",
        max_score: 25,
        order: 2
      },
      {
        name: "Presentasi",
        description: "Kualitas presentasi dan komunikasi hasil",
        max_score: 15,
        order: 3
      }
    ];
  }
}

function getPracticeCriteria(subject: { name: string; code: string | null }) {
  const subjectName = subject.name.toLowerCase();

  if (subject.code === "MTK" || subjectName.includes("matematika")) {
    return [
      {
        name: "Pemahaman Soal",
        description: "Kemampuan memahami dan mengidentifikasi masalah",
        max_score: 20,
        order: 0
      },
      {
        name: "Strategi Penyelesaian",
        description: "Ketepatan strategi dan metode yang digunakan",
        max_score: 30,
        order: 1
      },
      {
        name: "Langkah Pengerjaan",
        description: "Sistematika dan kejelasan langkah pengerjaan",
        max_score: 30,
        order: 2
      },
      {
        name: "Kebenaran Hasil",
        description: "Ketepatan hasil akhir dan kesimpulan",
        max_score: 20,
        order: 3
      }
    ];
  } else if (subject.code === "FIS" || subjectName.includes("fisika")) {
    return [
      {
        name: "Pemahaman Teori",
        description: "Pemahaman konsep dan teori fisika",
        max_score: 25,
        order: 0
      },
      {
        name: "Prosedur Percobaan",
        description: "Ketepatan prosedur dan teknik percobaan",
        max_score: 30,
        order: 1
      },
      {
        name: "Pengukuran & Analisis",
        description: "Kemampuan pengukuran dan analisis data",
        max_score: 25,
        order: 2
      },
      {
        name: "Kesimpulan",
        description: "Ketepatan kesimpulan dan pembahasan",
        max_score: 20,
        order: 3
      }
    ];
  } else {
    // Default criteria for other subjects
    return [
      {
        name: "Pemahaman Materi",
        description: "Tingkat pemahaman materi pembelajaran",
        max_score: 25,
        order: 0
      },
      {
        name: "Teknik & Prosedur",
        description: "Ketepatan teknik dan prosedur pengerjaan",
        max_score: 30,
        order: 1
      },
      {
        name: "Hasil & Analisis",
        description: "Kualitas hasil dan kemampuan analisis",
        max_score: 25,
        order: 2
      },
      {
        name: "Kesimpulan",
        description: "Ketepatan kesimpulan dan pembahasan",
        max_score: 20,
        order: 3
      }
    ];
  }
}

function getQuizCriteria(subject: { name: string; code: string | null }) {
  const subjectName = subject.name.toLowerCase();

  if (subject.code === "MTK" || subjectName.includes("matematika")) {
    return [
      {
        name: "Soal Pilihan Ganda",
        description: "Nilai dari soal pilihan ganda (20 soal)",
        max_score: 40,
        order: 0
      },
      {
        name: "Soal Esai Singkat",
        description: "Nilai dari soal esai singkat (3 soal)",
        max_score: 30,
        order: 1
      },
      {
        name: "Soal Uraian",
        description: "Nilai dari soal uraian (2 soal)",
        max_score: 30,
        order: 2
      }
    ];
  } else if (subject.code === "BIND" || subjectName.includes("bahasa indonesia")) {
    return [
      {
        name: "Pilihan Ganda",
        description: "Soal pilihan ganda (15 soal)",
        max_score: 30,
        order: 0
      },
      {
        name: "Isian Singkat",
        description: "Soal isian singkat (10 soal)",
        max_score: 25,
        order: 1
      },
      {
        name: "Esai",
        description: "Soal esai dan uraian (3 soal)",
        max_score: 45,
        order: 2
      }
    ];
  } else {
    // Default criteria for other subjects
    return [
      {
        name: "Pilihan Ganda",
        description: "Soal pilihan ganda",
        max_score: 40,
        order: 0
      },
      {
        name: "Isian Singkat",
        description: "Soal isian singkat dan benar/salah",
        max_score: 30,
        order: 1
      },
      {
        name: "Uraian",
        description: "Soal uraian dan esai",
        max_score: 30,
        order: 2
      }
    ];
  }
}

// Export for use in main seed file
export default seedTeacherPortalData;
