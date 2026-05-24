import { prisma } from "../utils/prisma";

/**
 * Seed curriculums
 */
export async function seedCurriculums() {
  console.log("📖 Seeding curriculums...");

  const curriculums = [
    {
      code: "MERDEKA_2023",
      name: "Kurikulum Merdeka 2023",
      description: "Kurikulum Merdeka yang menekankan pengembangan kompetensi dan karakter siswa",
    },
    {
      code: "NASIONAL_2024",
      name: "Kurikulum Nasional 2024",
      description: "Kurikulum nasional terbaru dengan fokus pada literasi dan numerasi",
    },
    {
      code: "KTSP_2013",
      name: "Kurikulum Tingkat Satuan Pendidikan 2013",
      description: "Kurikulum KTSP yang disusun berdasarkan standar nasional pendidikan",
    },
    {
      code: "KBK_2004",
      name: "Kurikulum Berbasis Kompetensi 2004",
      description: "Kurikulum KBK yang berorientasi pada pengembangan kompetensi siswa",
    },
  ];

  const results = [];
  for (const curriculumData of curriculums) {
    let curriculum = await prisma.curriculum.findFirst({
      where: { code: curriculumData.code },
    });

    if (!curriculum) {
      curriculum = await prisma.curriculum.create({
        data: {
          code: curriculumData.code,
          name: curriculumData.name,
          description: curriculumData.description,
        },
      });
      console.log(`✅ Created curriculum: ${curriculum.name}`);
    } else {
      console.log(`ℹ️  Curriculum already exists: ${curriculum.name}`);
    }

    results.push(curriculum);
  }

  return results;
}

/**
 * Seed subjects
 */
export async function seedSubjects() {
  console.log("📚 Seeding subjects...");

  const subjectData = [
    // Core subjects
    { code: "MAT", name: "Matematika" },
    { code: "BIND", name: "Bahasa Indonesia" },
    { code: "BING", name: "Bahasa Inggris" },
    { code: "PKN", name: "Pendidikan Pancasila dan Kewarganegaraan" },
    { code: "SEJ", name: "Sejarah" },
    { code: "GEO", name: "Geografi" },
    { code: "EKO", name: "Ekonomi" },
    { code: "SOS", name: "Sosiologi" },
    { code: "FIS", name: "Fisika" },
    { code: "KIM", name: "Kimia" },
    { code: "BIO", name: "Biologi" },
    { code: "SEN", name: "Seni Budaya" },
    { code: "PENJAS", name: "Pendidikan Jasmani dan Olahraga" },
    { code: "TIK", name: "Teknologi Informasi dan Komunikasi" },
    { code: "AGAMA_ISLAM", name: "Pendidikan Agama Islam" },
    { code: "AGAMA_KRISTEN", name: "Pendidikan Agama Kristen" },
    { code: "AGAMA_KATOLIK", name: "Pendidikan Agama Katolik" },
    { code: "AGAMA_HINDU", name: "Pendidikan Agama Hindu" },
    { code: "AGAMA_BUDHA", name: "Pendidikan Agama Budha" },
    { code: "BK", name: "Bimbingan Konseling" },
  ];

  const subjects = [];
  for (const data of subjectData) {
    let subject = await prisma.subject.findFirst({
      where: { code: data.code },
    });

    if (!subject) {
      subject = await prisma.subject.create({
        data: {
          code: data.code,
          name: data.name,
          kkm: 75, // Default KKM
        },
      });
      console.log(`✅ Created subject: ${subject.name} (KKM: 75)`);
    } else {
      // Update KKM if not set
      if (!subject.kkm) {
        subject = await prisma.subject.update({
          where: { id: subject.id },
          data: { kkm: 75 }
        });
        console.log(`✅ Updated KKM for ${subject.name}: 75`);
      } else {
        console.log(`ℹ️  Subject already exists: ${subject.name} (KKM: ${subject.kkm})`);
      }
    }

    subjects.push(subject);
  }

  return subjects;
}

/**
 * Seed subject-curriculum relationships
 */
export async function seedSubjectCurriculums(curriculums: Array<{ id: bigint; code: string | null; name: string; description: string | null; deleted_at: Date | null; created_at: Date; updated_at: Date; }>, subjects: Array<{ id: bigint; code: string | null; name: string; is_practice: boolean; deleted_at: Date | null; created_at: Date; updated_at: Date; }>) {
  console.log("🔗 Seeding subject-curriculum relationships...");

  const relationships = [];

  for (const curriculum of curriculums) {
    for (const subject of subjects) {
      const relationship = await prisma.subjectCurriculum.upsert({
        where: {
          subject_id_curriculum_id: {
            subject_id: subject.id,
            curriculum_id: curriculum.id,
          },
        },
        update: {},
        create: {
          subject_id: subject.id,
          curriculum_id: curriculum.id,
        },
      });
      relationships.push(relationship);
    }
  }

  console.log(`✅ Created ${relationships.length} subject-curriculum relationships`);
  return relationships;
}

/**
 * Seed subject-program relationships
 */
export async function seedSubjectPrograms(programs: Record<string, { id: string; code: string | null; name: string; }>, subjects: Array<{ id: bigint; code: string | null; name: string; is_practice: boolean; deleted_at: Date | null; created_at: Date; updated_at: Date; }>) {
  console.log("🔗 Seeding subject-program relationships...");

  // programs is an object with keys IPA, IPS, BAHASA
  const programSubjects = {
    IPA: ["MAT", "FIS", "KIM", "BIO", "BIND", "BING", "PKN", "SEJ", "SEN", "PENJAS", "TIK", "BK"],
    IPS: ["MAT", "GEO", "EKO", "SOS", "SEJ", "BIND", "BING", "PKN", "SEN", "PENJAS", "TIK", "BK"],
    BAHASA: ["BIND", "BING", "MAT", "SEJ", "PKN", "SEN", "PENJAS", "TIK", "BK"],
  };

  const relationships = [];
  for (const [programCode, subjectCodes] of Object.entries(programSubjects)) {
    const program = programs[programCode];
    if (!program) continue;

    for (const subjectCode of subjectCodes) {
      const subject = subjects.find(s => s.code === subjectCode);
      if (!subject) continue;

      let relationship = await prisma.subjectProgram.findFirst({
        where: {
          subject_id: subject.id,
          program_id: program.id,
        },
      });

      if (!relationship) {
        relationship = await prisma.subjectProgram.create({
          data: {
            subject_id: subject.id,
            program_id: program.id,
          },
        });
        console.log(`✅ Created subject-program relationship: ${subject.name} - ${program.name}`);
      } else {
        console.log(`ℹ️  Subject-program relationship already exists: ${subject.name} - ${program.name}`);
      }

      relationships.push(relationship);
    }
  }

  return relationships;
}