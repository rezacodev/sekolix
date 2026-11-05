import * as bcrypt from "bcryptjs";
import { prisma } from "../utils/prisma";
import { generateInvoiceNumber } from "../../../src/lib/finance/server";

export async function seedFinanceDemo() {
  console.log("Seeding finance/SPP demo...");

  const bendaharaUser = await prisma.user.upsert({
    where: { email: "bendahara@sekolix.com" },
    update: { name: "Bendahara Sekolah", role: "STAFF", isActive: true },
    create: {
      email: "bendahara@sekolix.com",
      name: "Bendahara Sekolah",
      password: await bcrypt.hash("bendahara123", 10),
      role: "STAFF",
      isActive: true,
    },
  });

  const existingStaff = await prisma.staff.findFirst({ where: { userId: bendaharaUser.id } });
  if (existingStaff) {
    await prisma.staff.update({
      where: { id: existingStaff.id },
      data: {
      name: "Bendahara Sekolah",
      role: "STAFF",
      position: "Bendahara",
      jenisPTK: "Tenaga Kependidikan",
      jabatanPTK: "Bendahara",
      isActive: true,
      },
    });
  } else {
    await prisma.staff.create({
      data: {
      userId: bendaharaUser.id,
      name: "Bendahara Sekolah",
      role: "STAFF",
      nik: `BEN${bendaharaUser.id.slice(0, 13)}`,
      gender: "FEMALE",
      position: "Bendahara",
      jenisPTK: "Tenaga Kependidikan",
      jabatanPTK: "Bendahara",
      isActive: true,
      },
    });
  }

  const bendaharaRole = await prisma.accessRole.findUnique({ where: { slug: "BENDAHARA" } });
  if (bendaharaRole) {
    await prisma.userAccessRole.upsert({
      where: { user_id_role_id: { user_id: bendaharaUser.id, role_id: bendaharaRole.id } },
      update: { is_active: true, expires_at: null },
      create: {
        user_id: bendaharaUser.id,
        role_id: bendaharaRole.id,
        assigned_by: "system",
      },
    });
  }

  const spp = await prisma.financialBillingType.upsert({
    where: { code: "SPP" },
    update: { name: "SPP Bulanan", amount: 350000, frequency: "MONTHLY", is_active: true },
    create: {
      code: "SPP",
      name: "SPP Bulanan",
      description: "Iuran pendidikan bulanan siswa",
      amount: 350000,
      frequency: "MONTHLY",
      is_active: true,
      created_by: bendaharaUser.id,
    },
  });

  await prisma.financialBillingType.upsert({
    where: { code: "DAFTAR_ULANG" },
    update: { name: "Daftar Ulang", amount: 1250000, frequency: "YEARLY", is_active: true },
    create: {
      code: "DAFTAR_ULANG",
      name: "Daftar Ulang",
      description: "Biaya daftar ulang tahunan",
      amount: 1250000,
      frequency: "YEARLY",
      is_active: true,
      created_by: bendaharaUser.id,
    },
  });

  const activeYear = await prisma.tahunAjaran.findFirst({ where: { isActive: true } });
  const students = await prisma.pesertaDidik.findMany({
    where: { deleted_at: null },
    include: { rombels: { take: 1 }, parentLinks: true },
    take: 5,
  });

  const dueDate = new Date();
  dueDate.setDate(10);

  for (const student of students) {
    const existing = await prisma.studentInvoice.findFirst({
      where: {
        student_id: student.id,
        billing_type_id: spp.id,
        academic_year_id: activeYear?.id ?? null,
        period_month: dueDate.getMonth() + 1,
        period_year: dueDate.getFullYear(),
        status: { not: "CANCELLED" },
      },
    });
    if (existing) continue;

    const invoice = await prisma.studentInvoice.create({
      data: {
        invoice_number: generateInvoiceNumber("SPP"),
        student_id: student.id,
        billing_type_id: spp.id,
        academic_year_id: activeYear?.id ?? null,
        rombel_id: student.rombels[0]?.id ?? null,
        period_month: dueDate.getMonth() + 1,
        period_year: dueDate.getFullYear(),
        due_date: dueDate,
        subtotal: spp.amount,
        total_amount: spp.amount,
        paid_amount: 0,
        status: "UNPAID",
        created_by: bendaharaUser.id,
      },
    });

    if (student.parentLinks.length > 0) {
      await prisma.parentNotification.createMany({
        data: student.parentLinks.map((link) => ({
          parent_id: link.parent_id,
          student_id: student.id,
          type: "BILLING",
          title: "Tagihan SPP diterbitkan",
          message: `Tagihan SPP ${invoice.invoice_number} telah diterbitkan.`,
          href: "/parent/tagihan",
        })),
      });
    }
  }

  console.log("Finance/SPP demo seeded");
}
