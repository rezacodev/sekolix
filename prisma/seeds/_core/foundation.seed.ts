import { prisma } from "../utils/prisma";

/**
 * Seed school identity
 */
export async function seedSchoolIdentity() {
  console.log("🏫 Seeding school identity...");

  const school = await prisma.schoolIdentity.upsert({
    where: { id: "school-main" },
    update: {},
    create: {
      name: "SMA Negeri 1 Jakarta",
      schoolLevel: "SMA",
      address: "Jl. Sudirman No. 1, Jakarta Pusat",
      phone: "(021) 1234567",
      email: "info@sman1jakarta.sch.id",
      website: "https://sman1jakarta.sch.id",
      npsn: "20123456",
      accreditation: "A",
      headmaster: "Dr. Siti Nurhaliza, M.Pd.",
      establishedYear: 1950,
    },
  });

  console.log(`✅ Created school: ${school.name}`);
  return school;
}

/**
 * Seed academic years
 */
export async function seedTahunAjaran() {
  console.log("📅 Seeding academic years...");

  const currentYear = new Date().getFullYear();
  const years = [
    {
      label: `${currentYear}/${currentYear + 1}`,
      startDate: new Date(currentYear, 6, 1), // July 1st
      endDate: new Date(currentYear + 1, 5, 31), // June 31st
      isActive: true,
    },
    {
      label: `${currentYear - 1}/${currentYear}`,
      startDate: new Date(currentYear - 1, 6, 1),
      endDate: new Date(currentYear, 5, 31),
      isActive: false,
    },
  ];

  const createdYears = [];
  for (const yearData of years) {
    let year = await prisma.tahunAjaran.findFirst({
      where: { label: yearData.label }
    });

    if (!year) {
      year = await prisma.tahunAjaran.create({
        data: yearData
      });
      console.log(`✅ Created academic year: ${year.label}`);
    } else {
      console.log(`ℹ️  Academic year already exists: ${year.label}`);
    }

    createdYears.push(year);
  }

  return createdYears;
}

/**
 * Seed academic programs
 */
export async function seedPrograms() {
  console.log("📚 Seeding academic programs...");

  const programs = {
    IPA: {
      code: "IPA",
      name: "Ilmu Pengetahuan Alam",
      description: "Program studi dengan fokus pada matematika, fisika, kimia, dan biologi",
      isActive: true,
    },
    IPS: {
      code: "IPS",
      name: "Ilmu Pengetahuan Sosial",
      description: "Program studi dengan fokus pada sejarah, geografi, ekonomi, dan sosiologi",
      isActive: true,
    },
    BAHASA: {
      code: "BAHASA",
      name: "Bahasa",
      description: "Program studi dengan fokus pada bahasa Indonesia, Inggris, dan bahasa asing lainnya",
      isActive: true,
    },
  };

  const createdPrograms: Record<string, { id: string; code: string | null; name: string; description: string | null; isActive: boolean; }> = {};
  for (const [key, programData] of Object.entries(programs)) {
    let program = await prisma.program.findFirst({
      where: { code: programData.code }
    });

    if (!program) {
      program = await prisma.program.create({
        data: programData
      });
      console.log(`✅ Created program: ${program.name}`);
    } else {
      console.log(`ℹ️  Program already exists: ${program.name}`);
    }

    createdPrograms[key] = program;
  }

  return createdPrograms;
}

/**
 * Seed academic events
 */
export async function seedAcademicEvents(years: Array<{ id: string; label: string; yearCode: string | null; startDate: Date | null; endDate: Date | null; isActive: boolean; }>) {
  console.log("📅 Seeding academic events...");

  const events: Array<{ id: string; title: string; description: string | null; startDate: Date | null; endDate: Date | null; tahunAjaranId: string; }> = [];
  const currentYear = years.find(y => y.isActive);

  if (!currentYear) {
    console.log("⚠️  No active academic year found, skipping events");
    return events;
  }
  if (!currentYear.startDate) {
    console.log("⚠️  Active academic year has no start date, skipping academic events");
    return events;
  }
  const eventTemplates = [
    {
      title: "Penerimaan Siswa Baru",
      startDate: new Date(currentYear.startDate.getFullYear(), 0, 15), // January 15
      endDate: new Date(currentYear.startDate.getFullYear(), 2, 15), // March 15
      description: "Pendaftaran siswa baru untuk tahun ajaran baru",
    },
    {
      title: "Ujian Tengah Semester 1",
      startDate: new Date(currentYear.startDate.getFullYear(), 9, 1), // October 1
      endDate: new Date(currentYear.startDate.getFullYear(), 9, 15), // October 15
      description: "Ujian tengah semester ganjil",
    },
    {
      title: "Ujian Akhir Semester 1",
      startDate: new Date(currentYear.startDate.getFullYear(), 11, 1), // December 1
      endDate: new Date(currentYear.startDate.getFullYear(), 11, 20), // December 20
      description: "Ujian akhir semester ganjil",
    },
    {
      title: "Libur Semester 1",
      startDate: new Date(currentYear.startDate.getFullYear(), 11, 21), // December 21
      endDate: new Date(currentYear.startDate.getFullYear() + 1, 0, 5), // January 5
      description: "Libur akhir tahun dan tahun baru",
    },
    {
      title: "Ujian Tengah Semester 2",
      startDate: new Date(currentYear.startDate.getFullYear() + 1, 2, 1), // March 1
      endDate: new Date(currentYear.startDate.getFullYear() + 1, 2, 15), // March 15
      description: "Ujian tengah semester genap",
    },
    {
      title: "Ujian Akhir Semester 2",
      startDate: new Date(currentYear.startDate.getFullYear() + 1, 4, 1), // May 1
      endDate: new Date(currentYear.startDate.getFullYear() + 1, 4, 20), // May 20
      description: "Ujian akhir semester genap dan ujian nasional",
    },
  ];

  for (const template of eventTemplates) {
    let event = await prisma.academicEvent.findFirst({
      where: {
        title: template.title,
        tahunAjaranId: currentYear.id,
      },
    });

    if (!event) {
      event = await prisma.academicEvent.create({
        data: {
          title: template.title,
          startDate: template.startDate,
          endDate: template.endDate,
          description: template.description,
          tahunAjaranId: currentYear.id,
        },
      });
      console.log(`✅ Created academic event: ${event.title}`);
    } else {
      console.log(`ℹ️  Academic event already exists: ${event.title}`);
    }

    events.push(event);
  }

  return events;
}