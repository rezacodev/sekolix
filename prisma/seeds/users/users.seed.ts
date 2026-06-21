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

  // ── Superadmin ───────────────────────────────────────────────────────────
  let superadminUser = await prisma.user.findFirst({ where: { email: "superadmin@sekolix.com" } });
  if (!superadminUser) {
    superadminUser = await prisma.user.create({
      data: {
        email: "superadmin@sekolix.com",
        name: "Super Administrator",
        password: await bcrypt.hash("superadmin123", 10),
        role: "SUPERADMIN",
        isActive: true,
      },
    });
  }

  // ── Admin ─────────────────────────────────────────────────────────────────
  let adminUser = await prisma.user.findFirst({ where: { email: "admin@sekolix.com" } });
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: "admin@sekolix.com",
        name: "Administrator",
        password: await bcrypt.hash("admin123", 10),
        role: "ADMIN",
        isActive: true,
      },
    });
  } else if (adminUser.role !== "ADMIN") {
    await prisma.user.update({ where: { id: adminUser.id }, data: { role: "ADMIN" } });
  }

  let adminStaff = await prisma.staff.findFirst({ where: { userId: adminUser.id } });
  if (!adminStaff) {
    adminStaff = await prisma.staff.create({
      data: {
        userId: adminUser.id,
        name: "Administrator",
        role: "STAFF",
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

  // ── Staff (TU / Tata Usaha) ───────────────────────────────────────────────
  let staffUser = await prisma.user.findFirst({ where: { email: "staff@sekolix.com" } });
  if (!staffUser) {
    staffUser = await prisma.user.create({
      data: {
        email: "staff@sekolix.com",
        name: "Siti Rahayu",
        password: await bcrypt.hash("staff123", 10),
        role: "STAFF",
        isActive: true,
      },
    });
  } else {
    await prisma.user.update({ where: { id: staffUser.id }, data: { role: "STAFF" } });
  }

  let staffRecord = await prisma.staff.findFirst({ where: { userId: staffUser.id } });
  if (!staffRecord) {
    staffRecord = await prisma.staff.create({
      data: {
        userId: staffUser.id,
        name: "Siti Rahayu",
        role: "STAFF",
        nik: generateNIK(),
        placeOfBirth: "Bandung",
        dateOfBirth: new Date(1990, 3, 20),
        gender: "FEMALE",
        religion: "Islam",
        address: "Jl. Pahlawan No. 5, Bandung",
        phone: generatePhone(),
        position: "Tata Usaha",
        jenisPTK: "Tenaga Kependidikan",
        jabatanPTK: "Staf Tata Usaha",
        isActive: true,
      },
    });
  }

  // ── Guru (main teacher) ───────────────────────────────────────────────────
  let mainTeacherUser = await prisma.user.findFirst({ where: { email: "guru@sekolix.com" } });
  if (!mainTeacherUser) {
    mainTeacherUser = await prisma.user.create({
      data: {
        email: "guru@sekolix.com",
        name: "Budi Santoso",
        password: await bcrypt.hash("guru123", 10),
        role: "GURU",
        isActive: true,
      },
    });
  } else {
    await prisma.user.update({ where: { id: mainTeacherUser.id }, data: { role: "GURU" } });
  }

  let mainTeacherStaff = await prisma.staff.findFirst({ where: { userId: mainTeacherUser.id } });
  const staffListLocal = [adminStaff];

  if (!mainTeacherStaff) {
    mainTeacherStaff = await prisma.staff.create({
      data: {
        userId: mainTeacherUser.id,
        name: "Budi Santoso",
        role: "TEACHER",
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

  // ── Dual-role: Superadmin + Teacher ──────────────────────────────────────
  let dualRoleUser = await prisma.user.findFirst({ where: { email: "dualrole@sekolix.com" } });
  if (!dualRoleUser) {
    dualRoleUser = await prisma.user.create({
      data: {
        email: "dualrole@sekolix.com",
        name: "Ahmad Fauzi",
        password: await bcrypt.hash("dualrole123", 10),
        role: "SUPERADMIN",
        isActive: true,
      },
    });
  } else {
    await prisma.user.update({ where: { id: dualRoleUser.id }, data: { role: "SUPERADMIN" } });
  }

  let dualRoleStaff = await prisma.staff.findFirst({ where: { userId: dualRoleUser.id } });
  if (!dualRoleStaff) {
    dualRoleStaff = await prisma.staff.create({
      data: {
        userId: dualRoleUser.id,
        name: "Ahmad Fauzi",
        role: "TEACHER",
        nik: generateNIK(),
        placeOfBirth: "Surabaya",
        dateOfBirth: new Date(1978, 8, 10),
        gender: "MALE",
        religion: "Islam",
        address: "Jl. Merdeka No. 99, Surabaya",
        phone: generatePhone(),
        position: "Guru",
        jenisPTK: "Guru",
        jabatanPTK: "Guru Senior",
        isActive: true,
      },
    });
    staffListLocal.push(dualRoleStaff);
  } else {
    staffListLocal.push(dualRoleStaff);
  }

  // ── Murid ─────────────────────────────────────────────────────────────────
  let muridUser = await prisma.user.findFirst({ where: { email: "murid@sekolix.com" } });
  if (!muridUser) {
    await prisma.user.create({
      data: {
        email: "murid@sekolix.com",
        name: "Rina Wulandari",
        password: await bcrypt.hash("murid123", 10),
        role: "MURID",
        isActive: true,
      },
    });
  } else {
    await prisma.user.update({ where: { id: muridUser.id }, data: { role: "MURID" } });
  }

  // ── Orangtua ──────────────────────────────────────────────────────────────
  let orangtuaUser = await prisma.user.findFirst({ where: { email: "orangtua@sekolix.com" } });
  if (!orangtuaUser) {
    await prisma.user.create({
      data: {
        email: "orangtua@sekolix.com",
        name: "Hendra Kusuma",
        password: await bcrypt.hash("orangtua123", 10),
        role: "ORANGTUA",
        isActive: true,
      },
    });
  } else {
    await prisma.user.update({ where: { id: orangtuaUser.id }, data: { role: "ORANGTUA" } });
  }

  // ── Additional teacher users ──────────────────────────────────────────────

  for (let i = 1; i <= numTeachers; i++) {
    let teacherUser = await prisma.user.findFirst({
      where: { email: `guru${i}@sekolix.com` },
    });

    if (!teacherUser) {
      teacherUser = await prisma.user.create({
        data: {
          email: `guru${i}@sekolix.com`,
          password: await bcrypt.hash("guru123", 10),
          role: "GURU",
          isActive: true,
        },
      });
    } else {
      await prisma.user.update({ where: { id: teacherUser.id }, data: { role: "GURU" } });
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