import * as bcrypt from "bcryptjs";
import { prisma } from "../utils/prisma";
import { generateSummonLetterNumber } from "../../../src/lib/bk/server";

export async function seedBkDemo() {
  console.log("Seeding BK/kesiswaan demo...");

  const bkUser = await prisma.user.upsert({
    where: { email: "bk@sekolix.com" },
    update: { name: "Guru BK", role: "STAFF", isActive: true },
    create: {
      email: "bk@sekolix.com",
      name: "Guru BK",
      password: await bcrypt.hash("bk123", 10),
      role: "STAFF",
      isActive: true,
    },
  });

  let bkStaff = await prisma.staff.findFirst({ where: { userId: bkUser.id } });
  if (bkStaff) {
    bkStaff = await prisma.staff.update({
      where: { id: bkStaff.id },
      data: {
        name: "Guru BK",
        role: "STAFF",
        position: "Guru BK",
        jenisPTK: "Guru",
        jabatanPTK: "Guru Bimbingan Konseling",
        isActive: true,
      },
    });
  } else {
    bkStaff = await prisma.staff.create({
      data: {
        userId: bkUser.id,
        name: "Guru BK",
        role: "STAFF",
        nik: `BK${bkUser.id.slice(0, 14)}`,
        gender: "FEMALE",
        position: "Guru BK",
        jenisPTK: "Guru",
        jabatanPTK: "Guru Bimbingan Konseling",
        isActive: true,
      },
    });
  }

  const bkRole = await prisma.accessRole.findUnique({ where: { slug: "BK" } });
  if (bkRole) {
    await prisma.userAccessRole.upsert({
      where: { user_id_role_id: { user_id: bkUser.id, role_id: bkRole.id } },
      update: { is_active: true, expires_at: null },
      create: {
        user_id: bkUser.id,
        role_id: bkRole.id,
        assigned_by: "system",
      },
    });
  }

  const lateRule = await prisma.disciplineRule.upsert({
    where: { code: "TERLAMBAT" },
    update: { title: "Terlambat Masuk Sekolah", points: 5, severity: "LOW", is_active: true },
    create: {
      code: "TERLAMBAT",
      title: "Terlambat Masuk Sekolah",
      category: "KEDISIPLINAN",
      severity: "LOW",
      points: 5,
      description: "Siswa hadir setelah waktu masuk sekolah.",
    },
  });

  await prisma.disciplineRule.upsert({
    where: { code: "BOLOS" },
    update: { title: "Meninggalkan Kelas Tanpa Izin", points: 20, severity: "HIGH", is_active: true },
    create: {
      code: "BOLOS",
      title: "Meninggalkan Kelas Tanpa Izin",
      category: "KEDISIPLINAN",
      severity: "HIGH",
      points: 20,
      description: "Siswa meninggalkan kelas atau sekolah tanpa izin.",
    },
  });

  const student = await prisma.pesertaDidik.findFirst({
    where: { deleted_at: null },
    include: { parentLinks: true },
  });
  if (!student) {
    console.log("BK demo skipped: no student found");
    return;
  }

  let counselingCase = await prisma.studentCounselingCase.findFirst({
    where: { student_id: student.id, title: "Pendampingan Kedisiplinan Kehadiran" },
  });
  if (!counselingCase) {
    counselingCase = await prisma.studentCounselingCase.create({
      data: {
        student_id: student.id,
        counselor_id: bkStaff.id,
        category: "KEDISIPLINAN",
        title: "Pendampingan Kedisiplinan Kehadiran",
        description: "Pendampingan awal untuk meningkatkan konsistensi kehadiran dan ketepatan waktu.",
        status: "IN_PROGRESS",
        priority: "MEDIUM",
        visibility: "PARENT_VISIBLE",
        parent_visible: true,
        created_by: bkUser.id,
      },
    });
  }

  const sessionExists = await prisma.counselingSession.findFirst({ where: { case_id: counselingCase.id } });
  if (!sessionExists) {
    await prisma.counselingSession.create({
      data: {
        case_id: counselingCase.id,
        student_id: student.id,
        counselor_id: bkStaff.id,
        session_date: new Date(),
        summary: "Siswa sudah diajak berdiskusi mengenai kendala kedatangan pagi.",
        follow_up_plan: "Pantau kehadiran dua pekan ke depan dan libatkan wali kelas.",
        visibility: "PARENT_VISIBLE",
        parent_visible: true,
      },
    });
  }

  const recordExists = await prisma.disciplineRecord.findFirst({
    where: { student_id: student.id, rule_id: lateRule.id },
  });
  if (!recordExists) {
    await prisma.disciplineRecord.create({
      data: {
        student_id: student.id,
        rule_id: lateRule.id,
        case_id: counselingCase.id,
        recorded_by: bkStaff.id,
        incident_date: new Date(),
        description: "Terlambat masuk sekolah pada jam pertama.",
        points: lateRule.points,
        action_taken: "Pembinaan lisan dan komitmen perbaikan.",
        status: "FOLLOW_UP",
        parent_visible: true,
      },
    });
  }

  const achievementExists = await prisma.studentAchievement.findFirst({
    where: { student_id: student.id, title: "Teladan Kerapian Kelas" },
  });
  if (!achievementExists) {
    await prisma.studentAchievement.create({
      data: {
        student_id: student.id,
        verified_by: bkStaff.id,
        title: "Teladan Kerapian Kelas",
        category: "CHARACTER",
        level: "SCHOOL",
        organizer: "Sekolah",
        achievement_date: new Date(),
        description: "Mendapat apresiasi kelas untuk kepedulian terhadap lingkungan belajar.",
        parent_visible: true,
      },
    });
  }

  const parentId = student.parentLinks[0]?.parent_id ?? null;
  if (parentId) {
    const letterExists = await prisma.parentSummonLetter.findFirst({ where: { case_id: counselingCase.id } });
    if (!letterExists) {
      await prisma.parentSummonLetter.create({
        data: {
          case_id: counselingCase.id,
          student_id: student.id,
          parent_id: parentId,
          created_by: bkStaff.id,
          letter_number: generateSummonLetterNumber(),
          scheduled_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          agenda: "Diskusi pendampingan kehadiran dan dukungan kebiasaan pagi di rumah.",
          status: "SENT",
          parent_visible: true,
        },
      });
    }
  }

  console.log("BK/kesiswaan demo seeded");
}
