import { prisma } from "../utils/prisma";
import { TeacherSubject, TahunAjaran } from "@prisma/client";

type TeacherSubjectWithRelations = TeacherSubject & {
  subject: { id: bigint; name: string; code: string | null };
  rombel: { id: bigint; name: string } | null;
  class: { id: bigint; name: string };
};

/**
 * Seed teaching content data:
 * - Teaching Materials (Materi Pembelajaran)
 * - Syllabus (Silabus)
 * - Lesson Plans (RPP)
 * - Assignments (Tugas Online)
 */
export async function seedTeachingContent() {
  console.log("\n📚 Seeding Teaching Content Data...");

  try {
    // Find guru@sekolix.com
    const teacherUser = await prisma.user.findUnique({
      where: { email: "guru@sekolix.com" },
      include: { staff: true },
    });

    if (!teacherUser?.staff?.[0]) {
      console.log("⚠️  Teacher user not found");
      return;
    }

    const teacherId = teacherUser.staff[0].id;

    // Get active tahun ajaran
    const activeTahunAjaran = await prisma.tahunAjaran.findFirst({
      where: { isActive: true },
    });

    if (!activeTahunAjaran) {
      console.log("⚠️  No active tahun ajaran found");
      return;
    }

    // Get teacher's subjects
    const teacherSubjects = await prisma.teacherSubject.findMany({
      where: { teacher_id: teacherId, deleted_at: null },
      include: {
        subject: true,
        rombel: true,
        class: true,
      },
    });

    if (teacherSubjects.length === 0) {
      console.log("⚠️  No teacher subjects found");
      return;
    }

    // Create Teaching Materials
    await seedTeachingMaterials(teacherId, teacherSubjects);

    // Create Syllabus
    await seedSyllabus(teacherId, teacherSubjects, activeTahunAjaran);

    // Create Lesson Plans
    await seedLessonPlans(teacherId, teacherSubjects, activeTahunAjaran);

    // Create Assignments
    await seedAssignments(teacherSubjects, activeTahunAjaran);

    console.log("✅ Teaching content seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding teaching content:", error);
    throw error;
  }
}

async function seedTeachingMaterials(
  teacherId: string,
  teacherSubjects: TeacherSubjectWithRelations[]
) {
  console.log("\n📖 Creating teaching materials...");

  const materialTemplates = [
    {
      title: "Pengenalan Materi",
      fileType: "pdf",
      description: "Modul pengenalan konsep dasar",
      externalLink: null as string | null,
    },
    {
      title: "Video Pembelajaran",
      fileType: "video",
      description: "Video tutorial praktik",
      externalLink: "https://youtube.com/example",
    },
    {
      title: "Latihan Soal",
      fileType: "pdf",
      description: "Kumpulan soal latihan",
      externalLink: null as string | null,
    },
  ];

  let createdCount = 0;

  for (const ts of teacherSubjects) {
    for (const template of materialTemplates) {
      const existing = await prisma.teachingMaterial.findFirst({
        where: {
          teacher_id: teacherId,
          subject_id: ts.subject_id,
          title: `${template.title} - ${ts.subject.name}`,
          deleted_at: null,
        },
      });

      if (!existing) {
        await prisma.teachingMaterial.create({
          data: {
            teacher_id: teacherId,
            subject_id: ts.subject_id,
            class_id: ts.class_id,
            title: `${template.title} - ${ts.subject.name}`,
            file_type: template.fileType,
            description: template.description,
            external_link: template.externalLink,
          },
        });
        createdCount++;
      }
    }
  }

  console.log(`✓ Created ${createdCount} teaching materials`);
}

async function seedSyllabus(
  teacherId: string,
  teacherSubjects: TeacherSubjectWithRelations[],
  activeTahunAjaran: TahunAjaran
) {
  console.log("\n📋 Creating syllabus...");

  let createdCount = 0;

  for (const ts of teacherSubjects) {
    const existing = await prisma.syllabus.findFirst({
      where: {
        teacher_id: teacherId,
        subject_id: ts.subject_id,
        class_id: ts.class_id,
        academic_year: activeTahunAjaran.label,
        deleted_at: null,
      },
    });

    if (!existing) {
      await prisma.syllabus.create({
        data: {
          teacher_id: teacherId,
          subject_id: ts.subject_id,
          class_id: ts.class_id,
          academic_year: activeTahunAjaran.label,
          semester: 1,
          title: `Silabus ${ts.subject.name} Semester 1`,
          core_competencies: JSON.stringify([
            "Memahami konsep dasar",
            "Menerapkan dalam kehidupan sehari-hari",
            "Menganalisis dan mengevaluasi",
          ]),
          basic_competencies: JSON.stringify([
            "Menjelaskan konsep fundamental",
            "Mengidentifikasi dan mengklasifikasi",
            "Menyelesaikan masalah sederhana",
          ]),
          indicators: JSON.stringify([
            "Siswa dapat menjelaskan konsep dengan benar",
            "Siswa dapat menerapkan konsep dalam soal",
            "Siswa dapat menganalisis kasus nyata",
          ]),
          subject_matter: `Materi ${ts.subject.name} Semester 1`,
          learning_activities: "Diskusi kelompok, praktik, presentasi",
          assessment: "Tes tertulis, praktik, portofolio",
          time_allocation: "8 pertemuan x 90 menit",
          learning_resources: "Buku paket, modul, video pembelajaran",
        },
      });
      createdCount++;
    }
  }

  console.log(`✓ Created ${createdCount} syllabus`);
}

async function seedLessonPlans(
  teacherId: string,
  teacherSubjects: TeacherSubjectWithRelations[],
  activeTahunAjaran: TahunAjaran
) {
  console.log("\n📝 Creating lesson plans (RPP)...");

  const rppTemplates = [
    {
      week: 1,
      topic: "Pengenalan Konsep Dasar",
      objectives: "Siswa dapat memahami dan menjelaskan konsep dasar",
      materials: "Modul, slide presentasi, video",
      methods: "Ceramah, diskusi, tanya jawab",
      steps: "1. Pembukaan\n2. Penyampaian materi\n3. Diskusi\n4. Latihan\n5. Penutup",
      assessment: "Observasi, tanya jawab, kuis",
    },
    {
      week: 2,
      topic: "Penerapan Konsep",
      objectives: "Siswa dapat menerapkan konsep dalam soal",
      materials: "Lembar kerja, contoh soal",
      methods: "Problem-based learning, praktik",
      steps: "1. Review materi\n2. Contoh kasus\n3. Latihan kelompok\n4. Presentasi\n5. Evaluasi",
      assessment: "Hasil kerja, presentasi",
    },
  ];

  let createdCount = 0;

  for (const ts of teacherSubjects) {
    // Find or create syllabus for this subject/class
    let syllabus = await prisma.syllabus.findFirst({
      where: {
        teacher_id: teacherId,
        subject_id: ts.subject_id,
        class_id: ts.class_id,
        academic_year: activeTahunAjaran.label,
        semester: 1,
        deleted_at: null,
      },
    });

    if (!syllabus) {
      // Create syllabus if not exists
      syllabus = await prisma.syllabus.create({
        data: {
          teacher_id: teacherId,
          subject_id: ts.subject_id,
          class_id: ts.class_id,
          academic_year: activeTahunAjaran.label,
          semester: 1,
          title: `Silabus ${ts.subject.name} Semester 1`,
          core_competencies: JSON.stringify([
            "Memahami konsep dasar",
            "Menerapkan dalam kehidupan sehari-hari",
          ]),
          basic_competencies: JSON.stringify([
            "Menjelaskan konsep fundamental",
            "Mengidentifikasi dan mengklasifikasi",
          ]),
          indicators: JSON.stringify([
            "Siswa dapat menjelaskan konsep dengan benar",
          ]),
        },
      });
    }

    for (const template of rppTemplates) {
      const existing = await prisma.lessonPlan.findFirst({
        where: {
          syllabus_id: syllabus.id,
          title: `${template.topic} - ${ts.subject.name}`,
          deleted_at: null,
        },
      });

      if (!existing) {
        await prisma.lessonPlan.create({
          data: {
            teacher_id: teacherId,
            syllabus_id: syllabus.id,
            subject_id: ts.subject_id,
            class_id: ts.class_id,
            academic_year: activeTahunAjaran.label,
            semester: 1,
            title: `${template.topic} - ${ts.subject.name}`,
            meeting_number: template.week,
            time_allocation: "2 x 45 menit",
            learning_objectives: template.objectives,
            subject_matter: template.materials,
            teaching_method: template.methods,
            core_activities: template.steps,
            assessment_technique: template.assessment,
            notes: "RPP ini dapat disesuaikan dengan kondisi kelas",
          },
        });
        createdCount++;
      }
    }
  }

  console.log(`✓ Created ${createdCount} lesson plans`);
}

async function seedAssignments(teacherSubjects: TeacherSubjectWithRelations[], activeTahunAjaran: TahunAjaran) {
  console.log("\n✍️ Creating assignments (tugas online)...");

  // Determine current semester
  const now = new Date();
  let currentSemester = 1;
  if (activeTahunAjaran?.startDate && activeTahunAjaran?.endDate) {
    const start = new Date(activeTahunAjaran.startDate);
    const end = new Date(activeTahunAjaran.endDate);
    const midPoint = new Date((start.getTime() + end.getTime()) / 2);
    currentSemester = now < midPoint ? 1 : 2;
  }

  const assignmentTemplates = [
    {
      title: "Tugas 1: Pemahaman Konsep",
      description: "Kerjakan soal-soal berikut untuk mengukur pemahaman konsep dasar",
      type: "HOMEWORK" as const,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 minggu dari sekarang
    },
    {
      title: "Tugas 2: Latihan Soal",
      description: "Latihan soal aplikasi konsep dalam berbagai kasus",
      type: "HOMEWORK" as const,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 hari dari sekarang
    },
    {
      title: "Proyek: Penerapan dalam Kehidupan",
      description: "Buat proyek yang menerapkan konsep yang telah dipelajari dalam kehidupan sehari-hari",
      type: "PROJECT" as const,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 minggu dari sekarang
    },
  ];

  let createdCount = 0;

  for (const ts of teacherSubjects) {
    if (!ts.rombel_id) continue;

    for (const template of assignmentTemplates) {
      const existing = await prisma.assignment.findFirst({
        where: {
          rombel_id: ts.rombel_id,
          subject_id: ts.subject_id,
          title: `${template.title} - ${ts.subject.name}`,
          deleted_at: null,
        },
      });

      if (!existing) {
        const assignment = await prisma.assignment.create({
          data: {
            rombel_id: ts.rombel_id,
            subject_id: ts.subject_id,
            title: `${template.title} - ${ts.subject.name}`,
            description: template.description,
            due_date: template.dueDate,
            max_score: 100,
            academic_year: activeTahunAjaran.label,
            semester: currentSemester,
          },
        });

        // Create sample submissions for first few students
        const students = await prisma.pesertaDidik.findMany({
          where: {
            rombels: { some: { id: ts.rombel_id } },
            deleted_at: null,
          },
          take: 5, // Ambil 5 siswa pertama
        });

        for (const student of students) {
          await prisma.assignmentSubmission.create({
            data: {
              assignment_id: assignment.id,
              student_id: student.id,
              submitted_at: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000), // Random dalam 5 hari terakhir
              attachment_url: null,
              status: "graded",
              score: Math.floor(Math.random() * 30) + 70, // Random score 70-100
              feedback: "Bagus, lanjutkan!",
            },
          });
        }

        createdCount++;
      }
    }
  }

  console.log(`✓ Created ${createdCount} assignments with sample submissions`);
}

export default seedTeachingContent;
