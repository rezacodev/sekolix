import { prisma } from "../utils/prisma";

export async function seedParentPortalDemo() {
  console.log("Seeding parent portal demo data...");

  const user = await prisma.user.findUnique({ where: { email: "orangtua@sekolix.com" } });
  if (!user) {
    console.log("Parent demo user not found, skipping parent portal seed");
    return;
  }

  const student = await prisma.pesertaDidik.findFirst({
    where: { deleted_at: null },
    orderBy: { fullName: "asc" },
  });

  if (!student) {
    console.log("No student found, skipping parent portal seed");
    return;
  }

  const parent = await prisma.parentGuardian.upsert({
    where: { user_id: user.id },
    update: {
      name: user.name ?? "Orang Tua Demo",
      email: user.email,
      phone: student.fatherName ? student.phone : student.mobile ?? student.phone,
    },
    create: {
      user_id: user.id,
      name: user.name ?? "Orang Tua Demo",
      email: user.email,
      phone: student.mobile ?? student.phone,
      address: student.address,
    },
  });

  await prisma.parentStudent.upsert({
    where: {
      parent_id_student_id: {
        parent_id: parent.id,
        student_id: student.id,
      },
    },
    update: {
      relationship: "WALI",
      is_primary: true,
    },
    create: {
      parent_id: parent.id,
      student_id: student.id,
      relationship: "WALI",
      is_primary: true,
    },
  });

  await prisma.parentNotification.create({
    data: {
      parent_id: parent.id,
      student_id: student.id,
      type: "INFO",
      title: "Selamat datang di Portal Orang Tua",
      message: `Akun Anda sudah terhubung dengan ${student.fullName}.`,
      href: `/parent/anak/${student.id}`,
    },
  });

  console.log(`Parent portal demo linked ${user.email} to ${student.fullName}`);
}
