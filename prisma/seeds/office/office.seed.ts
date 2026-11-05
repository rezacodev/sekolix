import * as bcrypt from "bcryptjs";
import { prisma } from "../utils/prisma";
import { generateQrPayload, generateValidationCode, renderTemplate } from "../../../src/lib/office/server";

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

export async function seedOfficeDemo() {
  console.log("Seeding office/TU demo...");

  const user = await prisma.user.upsert({
    where: { email: "tu@sekolix.com" },
    update: { name: "Petugas Tata Usaha", role: "STAFF", isActive: true },
    create: {
      email: "tu@sekolix.com",
      name: "Petugas Tata Usaha",
      password: await bcrypt.hash("tu123456", 10),
      role: "STAFF",
      isActive: true,
    },
  });

  let staff = await prisma.staff.findFirst({ where: { userId: user.id } });
  if (staff) {
    staff = await prisma.staff.update({
      where: { id: staff.id },
      data: { name: "Petugas Tata Usaha", role: "STAFF", position: "Tata Usaha", jenisPTK: "Tenaga Kependidikan", jabatanPTK: "Tata Usaha", isActive: true },
    });
  } else {
    staff = await prisma.staff.create({
      data: {
        userId: user.id,
        name: "Petugas Tata Usaha",
        role: "STAFF",
        nik: `TU${user.id.slice(0, 14)}`,
        gender: "FEMALE",
        position: "Tata Usaha",
        jenisPTK: "Tenaga Kependidikan",
        jabatanPTK: "Tata Usaha",
        isActive: true,
      },
    });
  }

  const role = await prisma.accessRole.findUnique({ where: { slug: "TU" } });
  if (role) {
    await prisma.userAccessRole.upsert({
      where: { user_id_role_id: { user_id: user.id, role_id: role.id } },
      update: { is_active: true, expires_at: null },
      create: { user_id: user.id, role_id: role.id, assigned_by: "system" },
    });
  }

  const template = await prisma.letterTemplate.upsert({
    where: { code: "KET-SISWA" },
    update: {
      name: "Surat Keterangan Siswa",
      audience: "STUDENT",
      subject: "Surat Keterangan Siswa",
      body: "Yang bertanda tangan di bawah ini menerangkan bahwa {{nama_siswa}} dengan NISN {{nisn}} adalah peserta didik aktif di {{sekolah}}. Surat ini dibuat untuk {{keperluan}}.",
      is_active: true,
    },
    create: {
      code: "KET-SISWA",
      name: "Surat Keterangan Siswa",
      audience: "STUDENT",
      subject: "Surat Keterangan Siswa",
      body: "Yang bertanda tangan di bawah ini menerangkan bahwa {{nama_siswa}} dengan NISN {{nisn}} adalah peserta didik aktif di {{sekolah}}. Surat ini dibuat untuk {{keperluan}}.",
      variables: { nama_siswa: "Nama siswa", nisn: "NISN", keperluan: "Keperluan surat" },
      created_by: staff.id,
    },
  });

  const incoming = await prisma.incomingLetter.upsert({
    where: { agenda_number: "SM-DEMO-001" },
    update: { sender: "Dinas Pendidikan", subject: "Undangan Rapat Koordinasi", status: "RECEIVED" },
    create: {
      agenda_number: "SM-DEMO-001",
      letter_number: "421/DISDIK/2026",
      received_at: new Date(),
      letter_date: addDays(-1),
      sender: "Dinas Pendidikan",
      subject: "Undangan Rapat Koordinasi",
      summary: "Undangan koordinasi operator sekolah.",
      status: "RECEIVED",
      classification: "Dinas",
      received_by: staff.id,
      created_by: staff.id,
    },
  });

  const validationCode = "TUDEMOLETTER001";
  const outgoing = await prisma.outgoingLetter.upsert({
    where: { letter_number: "SK-DEMO-001" },
    update: { recipient: "Dinas Pendidikan", subject: "Balasan Kehadiran Rapat", status: "WAITING_APPROVAL" },
    create: {
      letter_number: "SK-DEMO-001",
      agenda_number: "AG-DEMO-001",
      template_id: template.id,
      recipient: "Dinas Pendidikan",
      recipient_type: "INSTANSI",
      subject: "Balasan Kehadiran Rapat",
      body: "Sekolah menyatakan hadir dalam rapat koordinasi.",
      letter_date: new Date(),
      status: "WAITING_APPROVAL",
      validation_code: validationCode,
      qr_code: generateQrPayload(validationCode),
      created_by: staff.id,
      signed_by: staff.id,
    },
  });

  const existingApproval = await prisma.letterApproval.findFirst({ where: { outgoing_letter_id: outgoing.id, status: "PENDING" } });
  if (!existingApproval) {
    await prisma.letterApproval.create({ data: { outgoing_letter_id: outgoing.id, requested_by: staff.id, status: "PENDING" } });
  }

  const existingDisposition = await prisma.letterDisposition.findFirst({ where: { incoming_letter_id: incoming.id, assigned_to: staff.id } });
  if (!existingDisposition) {
    await prisma.letterDisposition.create({
      data: {
        incoming_letter_id: incoming.id,
        assigned_to: staff.id,
        from_staff_id: staff.id,
        instruction: "Siapkan draft balasan dan konfirmasi kehadiran.",
        due_date: addDays(2),
      },
    });
  }

  const student = await prisma.pesertaDidik.findFirst({ where: { deleted_at: null } });
  if (student) {
    const generatedValidation = "TUGENERATED001";
    const variables = { nama_siswa: student.fullName, nisn: student.nisn ?? "-", sekolah: "Sekolix", keperluan: "administrasi lomba" };
    const generated = await prisma.generatedLetter.upsert({
      where: { validation_code: generatedValidation },
      update: { subject_name: student.fullName, content: renderTemplate(template.body, variables) },
      create: {
        template_id: template.id,
        student_id: student.id,
        subject_name: student.fullName,
        subject_identifier: student.nisn,
        variables,
        content: renderTemplate(template.body, variables),
        validation_code: generatedValidation,
        qr_code: generateQrPayload(generatedValidation),
        created_by: staff.id,
      },
    });

    await prisma.archiveRecord.upsert({
      where: { code: "ARS-DEMO-001" },
      update: { title: "Arsip Surat Keterangan Demo", generated_letter_id: generated.id },
      create: {
        code: "ARS-DEMO-001",
        title: "Arsip Surat Keterangan Demo",
        category: "SURAT_KETERANGAN",
        visibility: "INTERNAL",
        generated_letter_id: generated.id,
        tags: ["demo", "siswa"],
        created_by: staff.id,
      },
    });
  }

  console.log("Office/TU demo seeded");
}

