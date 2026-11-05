import { prisma } from "../utils/prisma";
import { generateAssignmentLetterNumber } from "../../../src/lib/staff-ops/server";

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

export async function seedStaffOpsDemo() {
  console.log("Seeding staff operations demo...");

  const staff = await prisma.staff.findMany({
    where: { deleted_at: null, isActive: true },
    orderBy: { name: "asc" },
    take: 5,
  });
  if (staff.length === 0) {
    console.log("No staff found, skipping staff operations demo");
    return;
  }

  const recorder = staff[0];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const item of staff.slice(0, 3)) {
    await prisma.staffAttendance.upsert({
      where: { staff_id_date: { staff_id: item.id, date: today } },
      update: {
        status: "PRESENT",
        source: "DEMO_SEED",
        recorded_by: recorder.id,
      },
      create: {
        staff_id: item.id,
        date: today,
        check_in: new Date(today.getTime() + 7 * 60 * 60 * 1000),
        check_out: new Date(today.getTime() + 15 * 60 * 60 * 1000),
        status: "PRESENT",
        source: "DEMO_SEED",
        recorded_by: recorder.id,
        notes: "Absensi demo.",
      },
    });
  }

  const leaveStaff = staff[1] ?? recorder;
  const existingLeave = await prisma.staffLeaveRequest.findFirst({
    where: { staff_id: leaveStaff.id, status: "PENDING" },
  });
  if (!existingLeave) {
    await prisma.staffLeaveRequest.create({
      data: {
        staff_id: leaveStaff.id,
        type: "LEAVE",
        start_date: addDays(7),
        end_date: addDays(8),
        total_days: 2,
        reason: "Keperluan keluarga.",
        status: "PENDING",
      },
    });
  }

  const dutyStaff = staff[2] ?? recorder;
  const existingDuty = await prisma.staffDutySchedule.findFirst({
    where: { staff_id: dutyStaff.id, duty_date: today, task: "Piket gerbang pagi" },
  });
  if (!existingDuty) {
    await prisma.staffDutySchedule.create({
      data: {
        staff_id: dutyStaff.id,
        duty_date: today,
        shift: "Pagi",
        location: "Gerbang utama",
        task: "Piket gerbang pagi",
        created_by: recorder.id,
      },
    });
  }

  const existingDocument = await prisma.staffDocument.findFirst({
    where: { staff_id: recorder.id, title: "Sertifikat Pendidik Demo" },
  });
  if (!existingDocument) {
    await prisma.staffDocument.create({
      data: {
        staff_id: recorder.id,
        type: "CERTIFICATE",
        title: "Sertifikat Pendidik Demo",
        file_url: "https://example.com/sertifikat-pendidik-demo.pdf",
        file_name: "sertifikat-pendidik-demo.pdf",
        issued_at: addDays(-365),
        expires_at: addDays(45),
        uploaded_by: recorder.id,
        notes: "Dokumen demo untuk reminder masa berlaku.",
      },
    });
  }

  const existingContract = await prisma.staffContract.findFirst({
    where: { staff_id: recorder.id, title: "Kontrak Kerja Demo" },
  });
  if (!existingContract) {
    await prisma.staffContract.create({
      data: {
        staff_id: recorder.id,
        contract_number: "KTR-DEMO-001",
        title: "Kontrak Kerja Demo",
        start_date: addDays(-180),
        end_date: addDays(50),
        reminder_date: addDays(20),
        status: "ACTIVE",
        file_url: "https://example.com/kontrak-kerja-demo.pdf",
        created_by: recorder.id,
      },
    });
  }

  const letterNumber = "ST-DEMO-001";
  await prisma.staffAssignmentLetter.upsert({
    where: { letter_number: letterNumber },
    update: {
      staff_id: recorder.id,
      title: "Surat Tugas Workshop Kurikulum",
      issued_at: today,
      module_source: "PEGAWAI",
    },
    create: {
      staff_id: recorder.id,
      letter_number: letterNumber || generateAssignmentLetterNumber("ST"),
      title: "Surat Tugas Workshop Kurikulum",
      assignment_type: "SURAT_TUGAS",
      issued_at: today,
      start_date: addDays(14),
      end_date: addDays(15),
      file_url: "https://example.com/surat-tugas-workshop.pdf",
      module_source: "PEGAWAI",
      created_by: recorder.id,
    },
  });

  console.log("Staff operations demo seeded");
}

