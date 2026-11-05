import { prisma } from "../utils/prisma";

function addDays(days: number, hour = 15) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date;
}

export async function seedExtracurricularDemo() {
  console.log("Seeding extracurricular demo...");

  const [staff, students] = await Promise.all([
    prisma.staff.findMany({ where: { deleted_at: null, isActive: true }, orderBy: { name: "asc" }, take: 5 }),
    prisma.pesertaDidik.findMany({ where: { deleted_at: null }, orderBy: { fullName: "asc" }, take: 8 }),
  ]);
  if (staff.length === 0 || students.length === 0) {
    console.log("Skipping extracurricular demo because staff or students are missing");
    return;
  }

  const basket = await prisma.extracurricular.upsert({
    where: { code: "BASKET" },
    update: { name: "Basket", category: "Olahraga", is_active: true },
    create: {
      code: "BASKET",
      name: "Basket",
      category: "Olahraga",
      description: "Latihan teknik dasar, strategi tim, dan sparing basket.",
      location: "Lapangan olahraga",
      capacity: 30,
      created_by: staff[0].id,
    },
  });
  const pramuka = await prisma.extracurricular.upsert({
    where: { code: "PRAMUKA" },
    update: { name: "Pramuka", category: "Kepemimpinan", is_active: true },
    create: {
      code: "PRAMUKA",
      name: "Pramuka",
      category: "Kepemimpinan",
      description: "Pembinaan karakter, kemandirian, dan kegiatan lapangan.",
      location: "Aula sekolah",
      capacity: 80,
      created_by: staff[0].id,
    },
  });

  for (const [club, coach, isPrimary] of [[basket, staff[0], true], [pramuka, staff[1] ?? staff[0], true]] as const) {
    await prisma.extracurricularCoach.upsert({
      where: { extracurricular_id_staff_id: { extracurricular_id: club.id, staff_id: coach.id } },
      update: { role: "PEMBINA", is_primary: isPrimary },
      create: { extracurricular_id: club.id, staff_id: coach.id, role: "PEMBINA", is_primary: isPrimary },
    });
  }

  for (const student of students.slice(0, 4)) {
    await prisma.extracurricularMember.upsert({
      where: { extracurricular_id_student_id: { extracurricular_id: basket.id, student_id: student.id } },
      update: { status: "ACTIVE" },
      create: { extracurricular_id: basket.id, student_id: student.id, status: "ACTIVE", notes: "Anggota seed demo." },
    });
  }

  const schedule = await prisma.extracurricularSchedule.create({
    data: {
      extracurricular_id: basket.id,
      title: "Latihan rutin basket",
      type: "TRAINING",
      start_at: addDays(3),
      end_at: addDays(3, 17),
      location: "Lapangan olahraga",
      description: "Latihan passing, dribble, dan scrimmage.",
    },
  });

  for (const student of students.slice(0, 3)) {
    const member = await prisma.extracurricularMember.findUnique({
      where: { extracurricular_id_student_id: { extracurricular_id: basket.id, student_id: student.id } },
    });
    await prisma.extracurricularAttendance.upsert({
      where: { schedule_id_student_id: { schedule_id: schedule.id, student_id: student.id } },
      update: { status: "PRESENT", recorded_by: staff[0].id },
      create: { schedule_id: schedule.id, student_id: student.id, member_id: member?.id ?? null, status: "PRESENT", recorded_by: staff[0].id },
    });
  }

  if (students[4]) {
    await prisma.extracurricularRegistration.upsert({
      where: { extracurricular_id_student_id: { extracurricular_id: pramuka.id, student_id: students[4].id } },
      update: { status: "PENDING", motivation: "Ingin belajar kepemimpinan." },
      create: { extracurricular_id: pramuka.id, student_id: students[4].id, status: "PENDING", motivation: "Ingin belajar kepemimpinan." },
    });
  }

  await prisma.extracurricularAchievement.create({
    data: {
      extracurricular_id: basket.id,
      student_id: students[0].id,
      title: "Juara 2 Turnamen Basket Kecamatan",
      level: "Kecamatan",
      organizer: "MGMP PJOK",
      achieved_at: addDays(-20),
      rank: "Juara 2",
      description: "Prestasi tim basket sekolah.",
      portfolio_visible: true,
      verified_by: staff[0].id,
    },
  });

  const event = await prisma.event.create({
    data: {
      title: "Ekstrakurikuler Basket: Latihan Terbuka",
      slug: `ekskul-basket-latihan-terbuka-${schedule.id.slice(0, 8)}`,
      description: "Latihan terbuka untuk siswa yang ingin mengenal ekskul basket.",
      startDate: addDays(10),
      endDate: addDays(10, 17),
      location: "Lapangan olahraga",
      isPublished: true,
    },
  });
  await prisma.extracurricularSchedule.update({ where: { id: schedule.id }, data: { is_published: true, published_event_id: event.id } });

  console.log("Extracurricular demo seeded");
}

