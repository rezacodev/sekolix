import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Dummy data templates
const firstNames = [
  "Adi", "Budi", "Citra", "Desy", "Eka", "Farhan", "Gita", "Hendra",
  "Indra", "Joko", "Ketut", "Lina", "Murni", "Nanda", "Oka", "Putri",
  "Qori", "Rini", "Siti", "Teguh", "Ursula", "Vina", "Wayan", "Yanti",
  "Zara", "Ahmad", "Bambang", "Dina", "Eni", "Faisal"
];

const lastNames = [
  "Wijaya", "Santoso", "Rahmat", "Kusuma", "Hermawan", "Gunawan",
  "Pratama", "Suryanto", "Handoko", "Samosir", "Setiawan", "Supriyanto",
  "Sutrisno", "Suyanto"
];

const cities = [
  "Jakarta", "Bandung", "Surabaya", "Medan", "Yogyakarta", "Semarang",
  "Makassar", "Tangerang"
];

const religions = ["Islam", "Kristen Protestan", "Kristen Katolik", "Budha", "Hindu"];
const occupations = ["PNS", "Swasta", "Petani", "Pedagang", "Pensiunan", "Buruh", "Profesional"];

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateName() {
  return `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`;
}

function generateNIK() {
  return String(getRandomInt(1000000000000000, 9999999999999999));
}

function generateNISN() {
  return String(getRandomInt(10000000000, 99999999999));
}

function generatePhone() {
  return `08${String(getRandomInt(100000000, 999999999)).slice(0, 9)}`;
}

export async function seedSchoolIdentity() {
  console.log("🏫 Seeding school identity...");

  const schoolData = {
    name: "SMA Negeri 1 Jakarta",
    shortName: "SMAN 1 Jakarta",
    schoolLevel: "SMA",
    address: "Jl. Sudirman No. 1, Jakarta Pusat",
    phone: "(021) 1234567",
    email: "info@sman1jakarta.sch.id",
    website: "https://sman1jakarta.sch.id",
    npsn: "20123456",
    headmaster: "Dr. Ahmad Susanto, M.Pd.",
    headmasterNIP: "198001012010011001",
    accreditation: "A",
    establishedYear: 1960
  };

  let school = await prisma.schoolIdentity.findFirst();

  if (!school) {
    school = await prisma.schoolIdentity.create({
      data: schoolData
    });
    console.log(`✓ Created school identity: ${school.name}`);
  } else {
    console.log(`ℹ️  School identity already exists: ${school.name}`);
  }

  return school;
}

export async function seedTahunAjaran() {
  console.log("📅 Seeding tahun ajaran...");

  const currentYear = new Date().getFullYear();
  const years = [
    {
      label: `${currentYear}/${currentYear + 1}`,
      startDate: new Date(currentYear, 6, 1), // July 1
      endDate: new Date(currentYear + 1, 5, 30), // June 30
      isActive: true
    },
    {
      label: `${currentYear - 1}/${currentYear}`,
      startDate: new Date(currentYear - 1, 6, 1),
      endDate: new Date(currentYear, 5, 30),
      isActive: false
    },
    {
      label: `${currentYear - 2}/${currentYear - 1}`,
      startDate: new Date(currentYear - 2, 6, 1),
      endDate: new Date(currentYear - 1, 5, 30),
      isActive: false
    }
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
      console.log(`✓ Created tahun ajaran: ${year.label}`);
    } else {
      console.log(`ℹ️  Tahun ajaran already exists: ${year.label}`);
    }

    createdYears.push(year);
  }

  return createdYears;
}

export async function seedPrograms() {
  console.log("📚 Seeding programs...");

  const programs = [
    { name: "IPA", description: "Ilmu Pengetahuan Alam" },
    { name: "IPS", description: "Ilmu Pengetahuan Sosial" },
    { name: "Bahasa", description: "Program Bahasa" }
  ];

  const createdPrograms = {};
  for (const programData of programs) {
    let program = await prisma.program.findFirst({
      where: { name: programData.name }
    });

    if (!program) {
      program = await prisma.program.create({
        data: programData
      });
      console.log(`✓ Created program: ${program.name}`);
    } else {
      console.log(`ℹ️  Program already exists: ${program.name}`);
    }

    createdPrograms[program.name] = program;
  }

  return createdPrograms;
}

export async function seedAcademicEvents(years) {
  console.log("📅 Seeding academic events...");

  const activeYear = years.find(y => y.isActive);
  if (!activeYear) {
    console.log("⚠️  No active year found, skipping academic events");
    return [];
  }

  const events = [
    {
      title: "Awal Tahun Ajaran",
      description: "Kegiatan pembukaan tahun ajaran baru",
      startDate: activeYear.startDate,
      endDate: new Date(activeYear.startDate.getTime() + (1000 * 60 * 60 * 24)), // +1 day
      tahunAjaranId: activeYear.id
    },
    {
      title: "Ujian Tengah Semester",
      description: "UTS Ganjil Tahun Ajaran 2025/2026",
      startDate: new Date(activeYear.startDate.getTime() + (1000 * 60 * 60 * 24 * 60)), // +60 days
      endDate: new Date(activeYear.startDate.getTime() + (1000 * 60 * 60 * 24 * 65)), // +65 days
      tahunAjaranId: activeYear.id
    },
    {
      title: "Ujian Akhir Semester",
      description: "UAS Ganjil Tahun Ajaran 2025/2026",
      startDate: new Date(activeYear.startDate.getTime() + (1000 * 60 * 60 * 24 * 120)), // +120 days
      endDate: new Date(activeYear.startDate.getTime() + (1000 * 60 * 60 * 24 * 125)), // +125 days
      tahunAjaranId: activeYear.id
    }
  ];

  const createdEvents = [];
  for (const eventData of events) {
    let event = await prisma.academicEvent.findFirst({
      where: {
        title: eventData.title,
        tahunAjaranId: eventData.tahunAjaranId
      }
    });

    if (!event) {
      event = await prisma.academicEvent.create({
        data: eventData
      });
      console.log(`✓ Created academic event: ${event.title}`);
    } else {
      console.log(`ℹ️  Academic event already exists: ${event.title}`);
    }

    createdEvents.push(event);
  }

  return createdEvents;
}

export async function seedUsersAndStaff(school, numTeachers = 15) {
  console.log(`👥 Seeding users and ${numTeachers} staff...`);

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  let adminUser = await prisma.user.findFirst({
    where: { email: "admin@sekolix.com" }
  });

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        name: "Administrator",
        email: "admin@sekolix.com",
        password: adminPassword,
        role: "ADMIN"
      }
    });
    console.log(`✓ Created admin user: ${adminUser.email}`);
  }

  // Create staff
  const staffList = [];
  for (let i = 0; i < numTeachers; i++) {
    const staffName = generateName();
    const staffEmail = `teacher${i + 1}@sekolix.com`;

    // Create user first
    let user = await prisma.user.findFirst({
      where: { email: staffEmail }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: staffName,
          email: staffEmail,
          password: await bcrypt.hash("teacher123", 10),
          role: "USER"
        }
      });
    }

    // Create staff linked to user
    const staffData = {
      user: {
        connect: { id: user.id }
      },
      nik: generateNIK(),
      nuptk: `NUPTK${String(i + 1).padStart(6, '0')}`,
      name: staffName,
      placeOfBirth: getRandomItem(cities),
      dateOfBirth: new Date(
        getRandomInt(1980, 1990),
        getRandomInt(0, 11),
        getRandomInt(1, 28)
      ),
      gender: getRandomItem(["L", "P"]),
      religion: getRandomItem(religions),
      address: `Jl. ${getRandomItem(firstNames)} No. ${getRandomInt(1, 100)}, ${getRandomItem(cities)}`,
      phone: generatePhone(),
      email: staffEmail,
      position: i === 0 ? "Guru Senior" : "Guru",
      statusKepegawaian: "PNS",
      jenisPTK: "Guru",
      jabatanPTK: i === 0 ? "Guru Senior" : "Guru"
    };

    let staff = await prisma.staff.findFirst({
      where: { email: staffData.email }
    });

    if (!staff) {
      staff = await prisma.staff.create({
        data: staffData
      });
      console.log(`✓ Created staff: ${staff.name}`);
    } else {
      console.log(`ℹ️  Staff already exists: ${staff.name}`);
    }

    staffList.push(staff);
  }

  return { admin: adminUser, staff: staffList };
}

export async function seedClassGroups(classes, programs, years) {
  console.log("👨‍🎓 Seeding class groups (rombongan belajar)...");

  if (!years || years.length === 0) {
    console.log("⚠️  No years found, skipping class groups");
    return [];
  }

  const classGroups = [];
  const letters = ["A", "B", "C"];
  const programValues = Object.values(programs);

  // Create rombels for each year
  for (const year of years) {
    console.log(`  Creating rombels for ${year.label}...`);
    
    for (const klass of classes) {
      const numGroups = getRandomInt(2, 3);
      for (let i = 0; i < numGroups; i++) {
        const groupName = `${klass.name} ${letters[i]}`;
        let classGroup = await prisma.rombel.findFirst({
          where: {
            name: groupName,
            class_id: klass.id,
            tahunAjaranId: year.id
          }
        });

        if (!classGroup) {
          classGroup = await prisma.rombel.create({
            data: {
              class_id: klass.id,
              program_id: programValues[i % programValues.length].id,
              tahunAjaranId: year.id,
              name: groupName,
              capacity: getRandomInt(30, 35),
              student_count: 0
            }
          });
          console.log(`    ✓ Created rombel: ${classGroup.name} (${year.label})`);
        } else {
          console.log(`    ℹ️  Rombel already exists: ${classGroup.name} (${year.label})`);
        }

        classGroups.push(classGroup);
      }
    }
  }

  return classGroups;
}

export async function seedTeacherSubjects(staffList, subjects, classes) {
  console.log("👨‍🏫 Assigning teachers to subjects...");

  let assignmentCount = 0;

  for (let i = 0; i < Math.min(15, staffList.length); i++) {
    const staff = staffList[i];
    const numSubjects = getRandomInt(1, 3);

    for (let j = 0; j < numSubjects; j++) {
      const subject = subjects[getRandomInt(0, subjects.length - 1)];
      const classItem = classes[getRandomInt(0, classes.length - 1)];

      // Check if assignment already exists
      const existing = await prisma.teacherSubject.findFirst({
        where: {
          teacher_id: staff.id,
          subject_id: subject.id,
          class_id: classItem.id
        }
      });

      if (!existing) {
        await prisma.teacherSubject.create({
          data: {
            teacher_id: staff.id,
            subject_id: subject.id,
            class_id: classItem.id
          }
        });
        assignmentCount++;
        console.log(`✓ Assigned ${subject.name} to ${staff.name} for class ${classItem.name}`);
      }
    }
  }

  return assignmentCount;
}

export async function seedClassSchedules(classGroups, subjects, staffList) {
  console.log("⏰ Seeding class schedules...");

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  const timeSlots = [
    { start: new Date('1970-01-01T07:00:00.000Z'), end: new Date('1970-01-01T07:45:00.000Z') },
    { start: new Date('1970-01-01T07:45:00.000Z'), end: new Date('1970-01-01T08:30:00.000Z') },
    { start: new Date('1970-01-01T08:45:00.000Z'), end: new Date('1970-01-01T09:30:00.000Z') },
    { start: new Date('1970-01-01T09:30:00.000Z'), end: new Date('1970-01-01T10:15:00.000Z') },
    { start: new Date('1970-01-01T10:30:00.000Z'), end: new Date('1970-01-01T11:15:00.000Z') },
    { start: new Date('1970-01-01T11:15:00.000Z'), end: new Date('1970-01-01T12:00:00.000Z') }
  ];

  let scheduleCount = 0;

  for (const classGroup of classGroups) {
    for (const day of days) {
      const numSubjects = getRandomInt(4, 6);

      for (let i = 0; i < numSubjects; i++) {
        const subject = subjects[getRandomInt(0, subjects.length - 1)];
        const timeSlot = timeSlots[i];
        const teacher = staffList[getRandomInt(0, staffList.length - 1)];

        // Find or create TeacherSubject mapping first
        let teacherSubject = await prisma.teacherSubject.findFirst({
          where: {
            teacher_id: teacher.id,
            subject_id: subject.id,
            rombel_id: classGroup.id
          }
        });

        if (!teacherSubject) {
          // Try to create, but catch if already exists (race condition)
          try {
            teacherSubject = await prisma.teacherSubject.create({
              data: {
                teacher_id: teacher.id,
                subject_id: subject.id,
                class_id: classGroup.class_id,
                rombel_id: classGroup.id
              }
            });
          } catch (error) {
            // If unique constraint error, fetch the existing one
            if (error.code === 'P2002') {
              teacherSubject = await prisma.teacherSubject.findFirst({
                where: {
                  teacher_id: teacher.id,
                  subject_id: subject.id,
                  class_id: classGroup.class_id
                }
              });
            } else {
              throw error;
            }
          }
        }

        // Check if schedule already exists
        const existing = await prisma.classSchedule.findFirst({
          where: {
            rombel_id: classGroup.id,
            teacher_subject_id: teacherSubject.id,
            day: day
          }
        });

        if (!existing) {
          await prisma.classSchedule.create({
            data: {
              class_id: classGroup.class_id,
              rombel_id: classGroup.id,
              teacher_subject_id: teacherSubject.id,
              day: day,
              period: i + 1, // Jam ke-1, ke-2, dst
              start_time: timeSlot.start,
              end_time: timeSlot.end,
              room: `Ruang ${getRandomInt(101, 120)}`
            }
          });
          scheduleCount++;
        }
      }
    }
  }

  return scheduleCount;
}

export async function seedPesertaDidik(classGroups, years, programs, numStudents = 120) {
  console.log(`🎓 Seeding ${numStudents} peserta didik...`);

  const students = [];
  const programList = Object.values(programs);

  // Distribute students across all years
  const studentsPerYear = Math.floor(numStudents / years.length);
  
  for (const year of years) {
    console.log(`  Creating students for ${year.label}...`);
    
    // Get rombels for this year
    const yearRombels = classGroups.filter(cg => cg.tahunAjaranId === year.id);
    if (yearRombels.length === 0) {
      console.log(`    ⚠️  No rombels found for ${year.label}, skipping...`);
      continue;
    }

    const currentYearStudents = Math.min(studentsPerYear, numStudents - students.length);

    for (let i = 0; i < currentYearStudents; i++) {
      const classGroup = yearRombels[getRandomInt(0, yearRombels.length - 1)];
      const program = programList[getRandomInt(0, programList.length - 1)];
      const fullName = generateName();
      const nik = generateNIK();
      const nisn = generateNISN();
      const gender = getRandomItem(["Laki-laki", "Perempuan"]);
      const birthYear = 2007 + getRandomInt(0, 2); // Born 2007-2009
      const birthMonth = getRandomInt(0, 11);
      const birthDay = getRandomInt(1, 28);

      const studentData = {
        nik: nik,
        phone: generatePhone(),
        fullName: fullName,
        email: `${fullName.toLowerCase().replace(/\s+/g, '.')}@student.example.com`,
        schoolOrigin: `SMP Negeri ${getRandomInt(1, 10)} ${getRandomItem(cities)}`,
        programId: program.id,
        entryYearId: year.id,
        status: "accepted",
        profileCompleted: true,
        
        // Personal Data
        gender: gender,
        nisn: nisn,
        noKK: String(getRandomInt(1000000000000000, 9999999999999999)),
        placeOfBirth: getRandomItem(cities),
        dateOfBirth: new Date(birthYear, birthMonth, birthDay),
        nationality: "Indonesia",
        religion: getRandomItem(religions),
        motherTongue: "Bahasa Indonesia",
        address: `Jl. ${getRandomItem(["Merdeka", "Sudirman", "Gatot Subroto", "Ahmad Yani"])} No. ${getRandomInt(1, 100)}`,
        village: `Kelurahan ${getRandomItem(["Menteng", "Senayan", "Kebayoran", "Tanah Abang"])}`,
        district: `Kecamatan ${getRandomItem(["Jakarta Pusat", "Jakarta Selatan", "Jakarta Timur"])}`,
        city: getRandomItem(cities),
        province: "DKI Jakarta",
        postalCode: String(getRandomInt(10000, 99999)),
        
        // Father Data
        fatherName: generateName(),
        fatherNik: generateNIK(),
        fatherBirthYear: 1970 + getRandomInt(0, 15),
        fatherEducation: getRandomItem(["SD", "SMP", "SMA", "D3", "S1", "S2"]),
        fatherOccupation: getRandomItem(occupations),
        fatherIncome: getRandomItem(["< 1 Juta", "1-3 Juta", "3-5 Juta", "> 5 Juta"]),
        
        // Mother Data
        motherName: generateName(),
        motherNik: generateNIK(),
        motherBirthYear: 1972 + getRandomInt(0, 15),
        motherEducation: getRandomItem(["SD", "SMP", "SMA", "D3", "S1", "S2"]),
        motherOccupation: getRandomItem(occupations),
        motherIncome: getRandomItem(["< 1 Juta", "1-3 Juta", "3-5 Juta", "> 5 Juta"]),
        
        // Student Details
        livesWith: getRandomItem(["Orang Tua", "Wali", "Kost"]),
        weight: 45 + getRandomInt(0, 30),
        height: 150 + getRandomInt(0, 30),
        distanceToSchool: getRandomInt(1, 20),
        transportationMode: getRandomItem(["Jalan Kaki", "Sepeda", "Motor", "Mobil", "Angkutan Umum"]),
        anakKe: getRandomInt(1, 4),
        jumlahSaudara: getRandomInt(0, 4),
        mobile: generatePhone(),
        
        rombels: {
          connect: { id: classGroup.id }
        }
      };

      let student = await prisma.pesertaDidik.findFirst({
        where: { nik: nik }
      });

      if (!student) {
        student = await prisma.pesertaDidik.create({
          data: studentData
        });
        console.log(`    ✓ Created student: ${fullName} - ${classGroup.name} (${year.label})`);
      } else {
        console.log(`    ℹ️  Student already exists: ${fullName}`);
      }

      students.push(student);
    }
  }

  // Update student counts for all rombels
  console.log("  Updating student counts for all rombels...");
  for (const rombel of classGroups) {
    const studentCount = await prisma.pesertaDidik.count({
      where: {
        rombels: {
          some: {
            id: rombel.id
          }
        }
      }
    });

    await prisma.rombel.update({
      where: { id: rombel.id },
      data: { student_count: studentCount }
    });
  }
  console.log("  ✓ Student counts updated");

  return students;
}

export async function seedAssessments(subjects, numAssessments = 50) {
  console.log(`📊 Seeding ${numAssessments} assessments...`);

  const assessmentTypes = ['TUGAS', 'UTS', 'UAS', 'PRAKTIK', 'ULANGAN_HARIAN'];
  const assessments = [];

  for (let i = 0; i < numAssessments; i++) {
    const subject = subjects[getRandomInt(0, subjects.length - 1)];
    const type = getRandomItem(assessmentTypes);
    const title = `${type} ${subject.name} ${getRandomInt(1, 5)}`;

    const assessmentData = {
      subject_id: subject.id,
      title: title,
      type: type,
      weight: getRandomInt(1, 5),
      max_score: 100
    };

    let assessment = await prisma.assessment.findFirst({
      where: {
        subject_id: assessmentData.subject_id,
        title: assessmentData.title,
        type: assessmentData.type
      }
    });

    if (!assessment) {
      assessment = await prisma.assessment.create({
        data: assessmentData
      });
      console.log(`✓ Created assessment: ${assessment.title}`);
      assessments.push(assessment);
    } else {
      console.log(`ℹ️  Assessment already exists: ${assessment.title}`);
    }
  }

  return assessments;
}

export async function seedGrades(assessments, students, numGrades = 500) {
  console.log(`📈 Seeding ${numGrades} grades...`);

  let gradeCount = 0;

  for (let i = 0; i < numGrades; i++) {
    const assessment = assessments[getRandomInt(0, assessments.length - 1)];
    const student = students[getRandomInt(0, students.length - 1)];

    const gradeData = {
      student_id: student.id,
      assessment_id: assessment.id,
      score: getRandomInt(60, 100),
      notes: `Nilai untuk ${assessment.title}`
    };

    let grade = await prisma.grade.findFirst({
      where: {
        student_id: gradeData.student_id,
        assessment_id: gradeData.assessment_id
      }
    });

    if (!grade) {
      grade = await prisma.grade.create({
        data: gradeData
      });
      console.log(`✓ Created grade for ${student.fullName} on ${assessment.title}`);
      gradeCount++;
    } else {
      console.log(`ℹ️  Grade already exists for ${student.fullName} on ${assessment.title}`);
    }
  }

  return gradeCount;
}

export async function seedReportCards(students, years, numReportCards = 50) {
  console.log(`🎖️  Seeding ${numReportCards} report cards...`);

  const activeYear = years.find(y => y.isActive);
  let reportCardCount = 0;

  for (let i = 0; i < Math.min(numReportCards, students.length); i++) {
    const student = students[i];

    const reportCardData = {
      student_id: student.id,
      academic_year_id: activeYear.id,
      semester: getRandomItem(['GANJIL', 'GENAP']),
      average_score: getRandomInt(70, 95),
      notes: "Performa baik, perlu ditingkatkan di beberapa mata pelajaran"
    };

    let reportCard = await prisma.reportCard.findFirst({
      where: {
        student_id: reportCardData.student_id,
        academic_year_id: reportCardData.academic_year_id,
        semester: reportCardData.semester
      }
    });

    if (!reportCard) {
      reportCard = await prisma.reportCard.create({
        data: reportCardData
      });
      reportCardCount++;
    }
  }

  return reportCardCount;
}

export async function seedExamResults(students, subjects, numResults = 100) {
  console.log(`🧪 Seeding ${numResults} exam results...`);

  let examResultCount = 0;

  for (let i = 0; i < numResults; i++) {
    const student = students[getRandomInt(0, students.length - 1)];
    const subject = subjects[getRandomInt(0, subjects.length - 1)];

    // Create exam first
    const examData = {
      subject_id: subject.id,
      title: `Ujian ${subject.name} ${getRandomInt(1, 5)}`,
      description: `Ujian untuk mata pelajaran ${subject.name}`,
      duration: getRandomInt(60, 120),
      total_questions: getRandomInt(20, 50),
      passing_score: 70
    };

    let exam = await prisma.exam.findFirst({
      where: {
        subject_id: examData.subject_id,
        title: examData.title
      }
    });

    if (!exam) {
      exam = await prisma.exam.create({
        data: examData
      });
    }

    // Create exam result
    const examResultData = {
      exam_id: exam.id,
      student_id: student.id,
      score: getRandomInt(50, 100),
      started_at: new Date(),
      finished_at: new Date()
    };

    let examResult = await prisma.examResult.findFirst({
      where: {
        exam_id: examResultData.exam_id,
        student_id: examResultData.student_id
      }
    });

    if (!examResult) {
      examResult = await prisma.examResult.create({
        data: examResultData
      });
      console.log(`✓ Created exam result for ${student.fullName} on ${exam.title}`);
      examResultCount++;
    } else {
      console.log(`ℹ️  Exam result already exists for ${student.fullName} on ${exam.title}`);
    }
  }

  return examResultCount;
}

export async function seedCurriculums() {
  console.log("📚 Seeding curriculums...");

  const curriculums = [
    { name: "Kurikulum Merdeka 2023", code: "KM2023" },
    { name: "Kurikulum Nasional 2024", code: "KN2024" },
    { name: "Kurikulum Merdeka 2022", code: "KM2022" },
    { name: "Kurikulum Nasional 2023", code: "KN2023" },
    { name: "Kurikulum 2013 Revisi", code: "K132019" },
  ];

  const createdCurriculums = [];

  for (const curr of curriculums) {
    let curriculum = await prisma.curriculum.findFirst({
      where: { name: curr.name }
    });

    if (!curriculum) {
      curriculum = await prisma.curriculum.create({
        data: {
          name: curr.name,
          code: curr.code
        }
      });
      console.log(`✓ Created curriculum: ${curriculum.name}`);
    } else {
      console.log(`ℹ️  Curriculum already exists: ${curriculum.name}`);
    }

    createdCurriculums.push(curriculum);
  }

  console.log(`✓ Seeded ${createdCurriculums.length} curriculums`);
  return createdCurriculums;
}

export async function seedSubjects() {
  console.log("📖 Seeding subjects...");

  const subjects = [
    { name: "Matematika", code: "MTK", is_practice: false },
    { name: "Bahasa Indonesia", code: "BIND", is_practice: false },
    { name: "Bahasa Inggris", code: "BING", is_practice: false },
    { name: "IPA", code: "IPA", is_practice: false },
    { name: "IPS", code: "IPS", is_practice: false },
    { name: "PKN", code: "PKN", is_practice: false },
    { name: "Seni Budaya", code: "SENI", is_practice: true },
    { name: "Penjasorkes", code: "PJOK", is_practice: true },
    { name: "TIK", code: "TIK", is_practice: true },
    { name: "Bahasa Jawa", code: "BJAWA", is_practice: false },
    { name: "Fisika", code: "FIS", is_practice: false },
    { name: "Kimia", code: "KIM", is_practice: false },
    { name: "Biologi", code: "BIO", is_practice: false },
    { name: "Sejarah", code: "SEJ", is_practice: false },
    { name: "Geografi", code: "GEO", is_practice: false },
    { name: "Ekonomi", code: "EKO", is_practice: false },
    { name: "Sosiologi", code: "SOS", is_practice: false },
    { name: "Bahasa Mandarin", code: "BMAND", is_practice: false },
    { name: "Prakarya", code: "PRAK", is_practice: true },
    { name: "BK", code: "BK", is_practice: false },
  ];

  const createdSubjects = [];

  for (const subj of subjects) {
    let subject = await prisma.subject.findFirst({
      where: { code: subj.code }
    });

    if (!subject) {
      subject = await prisma.subject.create({
        data: {
          name: subj.name,
          code: subj.code,
          is_practice: subj.is_practice
        }
      });
      console.log(`✓ Created subject: ${subject.name} (${subject.code})`);
    } else {
      console.log(`ℹ️  Subject already exists: ${subject.name} (${subject.code})`);
    }

    createdSubjects.push(subject);
  }

  console.log(`✓ Seeded ${createdSubjects.length} subjects`);
  return createdSubjects;
}

export async function seedSubjectCurriculums(curriculums, subjects) {
  console.log("🔗 Seeding subject-curriculum relationships...");

  const relationships = [
    // Kurikulum Merdeka 2023 (SMA) - subjects
    { curriculumName: "Kurikulum Merdeka 2023", subjectCodes: ["MTK", "BIND", "BING", "IPA", "IPS", "PKN", "SENI", "PJOK", "TIK", "BJAWA"] },
    // Kurikulum Nasional 2024 (SMA) - subjects
    { curriculumName: "Kurikulum Nasional 2024", subjectCodes: ["MTK", "BIND", "BING", "FIS", "KIM", "BIO", "SEJ", "GEO", "EKO", "SOS", "PKN", "SENI", "PJOK", "TIK"] },
    // Kurikulum Merdeka 2022 (SMP) - subjects
    { curriculumName: "Kurikulum Merdeka 2022", subjectCodes: ["MTK", "BIND", "BING", "IPA", "IPS", "PKN", "SENI", "PJOK", "TIK", "BJAWA", "BK"] },
    // Kurikulum Nasional 2023 (SMP) - subjects
    { curriculumName: "Kurikulum Nasional 2023", subjectCodes: ["MTK", "BIND", "BING", "IPA", "IPS", "PKN", "SENI", "PJOK", "TIK", "BJAWA", "BK", "PRAK"] },
    // Kurikulum 2013 Revisi (SD) - subjects
    { curriculumName: "Kurikulum 2013 Revisi", subjectCodes: ["MTK", "BIND", "BING", "IPA", "IPS", "PKN", "SENI", "PJOK", "TIK", "BJAWA", "BK", "PRAK"] },
  ];

  let relationshipCount = 0;

  for (const rel of relationships) {
    const curriculum = curriculums.find(c => c.name === rel.curriculumName);
    if (!curriculum) {
      console.log(`⚠️  Curriculum not found: ${rel.curriculumName}`);
      continue;
    }

    for (const subjectCode of rel.subjectCodes) {
      const subject = subjects.find(s => s.code === subjectCode);
      if (!subject) {
        console.log(`⚠️  Subject not found: ${subjectCode}`);
        continue;
      }

      // Check if relationship already exists
      const existing = await prisma.subjectCurriculum.findFirst({
        where: {
          subject_id: subject.id,
          curriculum_id: curriculum.id
        }
      });

      if (!existing) {
        await prisma.subjectCurriculum.create({
          data: {
            subject_id: subject.id,
            curriculum_id: curriculum.id
          }
        });
        relationshipCount++;
        console.log(`✓ Linked ${subject.name} to ${curriculum.name}`);
      }
    }
  }

  console.log(`✓ Created ${relationshipCount} subject-curriculum relationships`);
  return relationshipCount;
}

export async function seedSubjectPrograms(programs, subjects) {
  console.log("🔗 Seeding subject-program relationships...");

  // Convert programs object to array if needed
  const programsArray = Array.isArray(programs) ? programs : Object.values(programs);

  const relationships = [
    // Program IPA - subjects for science program
    { programName: "IPA", subjectCodes: ["MTK", "BIND", "BING", "FIS", "KIM", "BIO", "PKN", "SENI", "PJOK", "TIK", "BJAWA", "BK"] },
    // Program IPS - subjects for social studies program  
    { programName: "IPS", subjectCodes: ["MTK", "BIND", "BING", "SEJ", "GEO", "EKO", "SOS", "PKN", "SENI", "PJOK", "TIK", "BJAWA", "BK"] },
    // Program Bahasa - subjects for language program
    { programName: "Bahasa", subjectCodes: ["MTK", "BIND", "BING", "BMAND", "SEJ", "GEO", "PKN", "SENI", "PJOK", "TIK", "BJAWA", "BK", "PRAK"] },
  ];

  let relationshipCount = 0;

  for (const rel of relationships) {
    const program = programsArray.find(p => p.name === rel.programName);
    if (!program) {
      console.log(`⚠️  Program not found: ${rel.programName}`);
      continue;
    }

    for (const subjectCode of rel.subjectCodes) {
      const subject = subjects.find(s => s.code === subjectCode);
      if (!subject) {
        console.log(`⚠️  Subject not found: ${subjectCode}`);
        continue;
      }

      // Check if relationship already exists
      const existing = await prisma.subjectProgram.findFirst({
        where: {
          subject_id: subject.id,
          program_id: program.id
        }
      });

      if (!existing) {
        await prisma.subjectProgram.create({
          data: {
            subject_id: subject.id,
            program_id: program.id
          }
        });
        relationshipCount++;
        console.log(`✓ Linked ${subject.name} to ${program.name}`);
      }
    }
  }

  console.log(`✓ Created ${relationshipCount} subject-program relationships`);
  return relationshipCount;
}

export async function seedClasses() {
  console.log("🎓 Seeding classes...");

  // Get school level from school identity
  const schoolIdentity = await prisma.schoolIdentity.findFirst();
  const schoolLevel = schoolIdentity?.schoolLevel || "SMA"; // Default to SMA if not found

  console.log(`🏫 School level detected: ${schoolLevel}`);

  // Define classes based on school level
  const levelClasses = {
    "SD": [
      { name: "1", level: "SD" },
      { name: "2", level: "SD" },
      { name: "3", level: "SD" },
      { name: "4", level: "SD" },
      { name: "5", level: "SD" },
      { name: "6", level: "SD" },
    ],
    "SMP": [
      { name: "7", level: "SMP" },
      { name: "8", level: "SMP" },
      { name: "9", level: "SMP" },
    ],
    "SMA": [
      { name: "10", level: "SMA" },
      { name: "11", level: "SMA" },
      { name: "12", level: "SMA" },
    ],
    "SMK": [
      { name: "10", level: "SMK" },
      { name: "11", level: "SMK" },
      { name: "12", level: "SMK" },
    ]
  };

  const classes = levelClasses[schoolLevel] || levelClasses["SMA"]; // Default to SMA classes

  const createdClasses = [];

  for (const cls of classes) {
    let classRecord = await prisma.class.findFirst({
      where: { name: cls.name }
    });

    if (!classRecord) {
      classRecord = await prisma.class.create({
        data: {
          name: cls.name
        }
      });
      console.log(`✓ Created class: ${cls.level} - ${classRecord.name}`);
    } else {
      console.log(`ℹ️  Class already exists: ${classRecord.name}`);
    }

    createdClasses.push({ ...classRecord, level: cls.level });
  }

  console.log(`✓ Seeded ${createdClasses.length} classes for ${schoolLevel} level`);
  return createdClasses;
}

export async function seedSubjectClasses(classes, subjects) {
  console.log("🔗 Skipping subject-class relationships (will be generated per rombel via UI)");
  // Don't create any subject-class relationships during seeding
  // Let users generate them per rombel using the UI
  return 0;
}