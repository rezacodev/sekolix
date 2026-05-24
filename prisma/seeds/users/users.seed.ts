import { prisma } from "../utils/prisma";
import * as bcrypt from "bcryptjs";
import { DayOfWeek, Prisma } from "@prisma/client";
import {
  generateName,
  generateNIK,
  generatePhone,
  getRandomItem,
  cities,
  religions
} from "../utils/seed-utils.seed";

/**
 * Seed users and staff
 */
export async function seedUsersAndStaff(school: { id: string; name: string; shortName: string | null; schoolLevel: string; npsn: string | null; address: string | null; postalCode: string | null; phone: string | null; email: string | null; website: string | null; logoUrl: string | null; logoDarkUrl: string | null; faviconUrl: string | null; coverImageUrl: string | null; headmaster: string | null; headmasterNIP: string | null; accreditation: string | null; establishedYear: number | null; timezone: string | null; language: string | null; metaDescription: string | null; socialLinks: Prisma.JsonValue; defaultTheme: string | null; settings: Prisma.JsonValue; isPublic: boolean; createdAt: Date; updatedAt: Date; }, numTeachers = 15) {
  console.log("👤 Seeding users and staff...");

  // Create admin user
  let adminUser = await prisma.user.findFirst({
    where: { email: "admin@sekolix.com" },
  });

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: "admin@sekolix.com",
        password: await bcrypt.hash("admin123", 10),
        role: "ADMIN",
        isActive: true,
      },
    });
  }

  // Create admin staff record
  let adminStaff = await prisma.staff.findFirst({
    where: { userId: adminUser.id },
  });

  if (!adminStaff) {
    adminStaff = await prisma.staff.create({
      data: {
        userId: adminUser.id,
        name: "Administrator",
        role: "STAFF", // Admin is staff, not teacher
        nik: generateNIK(),
        placeOfBirth: "Jakarta",
        dateOfBirth: new Date(1980, 0, 1),
        gender: "MALE",
        religion: "Islam",
        address: "Jl. Sudirman No. 1, Jakarta Pusat",
        phone: generatePhone(),
        position: "Administrator",
        jenisPTK: "Tenaga Kependidikan",
        jabatanPTK: "Administrator",
        isActive: true,
      },
    });
  }

  // Create main teacher user for testing (guru@sekolix.com)
  let mainTeacherUser = await prisma.user.findFirst({
    where: { email: "guru@sekolix.com" },
  });

  if (!mainTeacherUser) {
    mainTeacherUser = await prisma.user.create({
      data: {
        email: "guru@sekolix.com",
        name: "Budi Santoso",
        password: await bcrypt.hash("guru123", 10),
        role: "USER",
        isActive: true,
      },
    });
  }

  let mainTeacherStaff = await prisma.staff.findFirst({
    where: { userId: mainTeacherUser.id },
  });

  const staffListLocal = [adminStaff];

  if (!mainTeacherStaff) {
    mainTeacherStaff = await prisma.staff.create({
      data: {
        userId: mainTeacherUser.id,
        name: "Budi Santoso",
        role: "TEACHER", // Set role sebagai TEACHER
        nik: generateNIK(),
        placeOfBirth: "Jakarta",
        dateOfBirth: new Date(1985, 5, 15),
        gender: "MALE",
        religion: "Islam",
        address: "Jl. Guru No. 123, Jakarta Selatan",
        phone: generatePhone(),
        position: "Guru",
        jenisPTK: "Guru",
        jabatanPTK: "Guru Mata Pelajaran",
        isActive: true,
      },
    });
    staffListLocal.push(mainTeacherStaff);
  } else {
    staffListLocal.push(mainTeacherStaff);
  }

  // Create teacher users and staff

  for (let i = 1; i <= numTeachers; i++) {
    let teacherUser = await prisma.user.findFirst({
      where: { email: `guru${i}@sekolix.com` },
    });

    if (!teacherUser) {
      teacherUser = await prisma.user.create({
        data: {
          email: `guru${i}@sekolix.com`,
          password: await bcrypt.hash("guru123", 10),
          role: "USER",
          isActive: true,
        },
      });
    }

    let teacherStaff = await prisma.staff.findFirst({
      where: { userId: teacherUser.id },
    });

    if (!teacherStaff) {
      teacherStaff = await prisma.staff.create({
        data: {
          userId: teacherUser.id,
          name: generateName(),
          role: "TEACHER", // Set role sebagai TEACHER untuk semua guru
          nik: generateNIK(),
          placeOfBirth: getRandomItem(cities),
          dateOfBirth: new Date(1980 + Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          gender: Math.random() > 0.5 ? "MALE" : "FEMALE",
          religion: getRandomItem(religions),
          address: `${getRandomItem(cities)}, Indonesia`,
          phone: generatePhone(),
          position: "Guru",
          jenisPTK: "Guru",
          jabatanPTK: "Guru Mata Pelajaran",
          isActive: true,
        },
      });
    }

    staffListLocal.push(teacherStaff);
  }

  console.log(`✅ Created ${staffListLocal.length} staff members`);
  return staffListLocal;
}

/**
 * Seed teacher subject assignments
 */
export async function seedTeacherSubjects(staffList: Array<{ id: string; position: string; }>, subjects: Array<{ id: bigint; code: string | null; name: string; is_practice: boolean; deleted_at: Date | null; created_at: Date; updated_at: Date; }>, classes: Array<{ id: bigint; name: string; deleted_at: Date | null; created_at: Date; updated_at: Date; level?: number; }>) {
  console.log("👨‍🏫 Seeding teacher subject assignments...");

  const assignments = [];
  const teachers = staffList.filter(s => s.position === "Guru");

  // Assign subjects to teachers
  for (const teacher of teachers) {
    // Each teacher gets 2-4 subjects
    const numSubjects = Math.floor(Math.random() * 3) + 2;
    const assignedSubjects = subjects
      .sort(() => Math.random() - 0.5)
      .slice(0, numSubjects);

    for (const subject of assignedSubjects) {
      // Find classes that have this subject
      const relevantClasses = classes.filter(c =>
        c.level && c.level >= 10 && c.level <= 12 // Only SMA classes
      );

      for (const classData of relevantClasses) {
        const assignment = await prisma.teacherSubject.upsert({
          where: {
            teacher_id_subject_id_class_id: {
              teacher_id: teacher.id,
              subject_id: subject.id,
              class_id: classData.id,
            },
          },
          update: {},
          create: {
            teacher_id: teacher.id,
            subject_id: subject.id,
            class_id: classData.id,
          },
        });
        assignments.push(assignment);
      }
    }
  }

  console.log(`✅ Created ${assignments.length} teacher subject assignments`);
  return assignments;
}

/**
 * Seed class schedules
 */
export async function seedClassSchedules(classGroups: Array<{ id: bigint; name: string; class_id: bigint; program_id: string; tahunAjaranId: string | null; capacity: number | null; student_count: number; deleted_at: Date | null; created_at: Date; updated_at: Date; }>) {
  console.log("⏰ Seeding class schedules...");

  const schedules = [];
  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
  const timeSlots = [
    { start: "07:00", end: "07:45" },
    { start: "07:45", end: "08:30" },
    { start: "08:45", end: "09:30" },
    { start: "09:30", end: "10:15" },
    { start: "10:30", end: "11:15" },
    { start: "11:15", end: "12:00" },
    { start: "12:30", end: "13:15" },
    { start: "13:15", end: "14:00" },
  ];

  for (const classGroup of classGroups) {
    let scheduleIndex = 0;

    // Get subjects for this class group's program and level
    const classSubjects = await prisma.subjectClass.findMany({
      where: {
        class_id: classGroup.class_id,
        subject: {
          programs: {
            some: {
              program_id: classGroup.program_id,
            },
          },
        },
      },
      include: {
        subject: {
          include: {
            teacherSubjects: {
              where: {
                class_id: classGroup.class_id,
              },
              include: {
                teacher: true,
              },
            },
          },
        },
      },
    });

    for (const day of days) {
      for (const timeSlot of timeSlots) {
        if (scheduleIndex >= classSubjects.length) break;

        const subjectClass = classSubjects[scheduleIndex];
        const availableTeachers = subjectClass.subject.teacherSubjects;

        if (availableTeachers.length > 0) {
          const teacher = getRandomItem(availableTeachers);

          const schedule = await prisma.classSchedule.create({
            data: {
              class_id: classGroup.class_id,
              rombel_id: classGroup.id,
              teacher_subject_id: teacher.id,
              day: day as DayOfWeek,
              start_time: new Date(`1970-01-01T${timeSlot.start}Z`),
              end_time: new Date(`1970-01-01T${timeSlot.end}Z`),
              room: `R-${Math.floor(Math.random() * 20) + 1}`,
            },
          });
          schedules.push(schedule);
        }

        scheduleIndex++;
      }
    }
  }

  console.log(`✅ Created ${schedules.length} class schedule entries`);
  return schedules;
}