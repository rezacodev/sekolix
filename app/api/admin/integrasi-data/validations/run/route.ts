import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { jsonSafe } from "@/lib/data-integration/server";

type IssueInput = {
  entity: string;
  record_id?: string | null;
  field: string;
  severity: "INFO" | "WARNING" | "ERROR";
  message: string;
  source: string;
  metadata?: Prisma.InputJsonValue;
};

function asJson(value: unknown): Prisma.InputJsonValue {
  return jsonSafe(value) as Prisma.InputJsonValue;
}

export async function POST(request: Request) {
  const access = await requireApiPermission("update", "integrasi-data");
  if (!access.ok) return access.response;

  const [students, subjects, staff, rombels] = await Promise.all([
    db.pesertaDidik.findMany({ where: { deleted_at: null }, include: { rombels: true } }),
    db.subject.findMany({ where: { deleted_at: null } }),
    db.staff.findMany({ where: { deleted_at: null } }),
    db.rombel.findMany({ where: { deleted_at: null }, include: { students: true } }),
  ]);

  const issues: IssueInput[] = [];
  const nikMap = new Map<string, string[]>();
  const nisnMap = new Map<string, string[]>();

  for (const student of students) {
    if (student.nik) nikMap.set(student.nik, [...(nikMap.get(student.nik) ?? []), student.id]);
    if (student.nisn) nisnMap.set(student.nisn, [...(nisnMap.get(student.nisn) ?? []), student.id]);
    if (!student.nik || student.nik.replace(/\D+/g, "").length !== 16) {
      issues.push({ entity: "students", record_id: student.id, field: "nik", severity: "ERROR", message: "NIK siswa kosong atau tidak 16 digit.", source: "SYSTEM" });
    }
    if (!student.nisn || student.nisn.replace(/\D+/g, "").length !== 10) {
      issues.push({ entity: "students", record_id: student.id, field: "nisn", severity: "ERROR", message: "NISN siswa kosong atau tidak 10 digit.", source: "SYSTEM" });
    }
    if (student.rombels.length === 0) {
      issues.push({ entity: "students", record_id: student.id, field: "rombel", severity: "WARNING", message: "Siswa belum terhubung ke rombel.", source: "SYSTEM" });
    }
    if (!student.fatherName && !student.motherName && !student.guardianName) {
      issues.push({ entity: "students", record_id: student.id, field: "parent", severity: "WARNING", message: "Data orang tua/wali belum lengkap.", source: "SYSTEM" });
    }
  }

  for (const [nik, ids] of nikMap.entries()) {
    if (ids.length > 1) {
      for (const id of ids) {
        issues.push({ entity: "students", record_id: id, field: "nik", severity: "ERROR", message: "NIK siswa terindikasi duplikat.", source: "SYSTEM", metadata: asJson({ nik, ids }) });
      }
    }
  }
  for (const [nisn, ids] of nisnMap.entries()) {
    if (ids.length > 1) {
      for (const id of ids) {
        issues.push({ entity: "students", record_id: id, field: "nisn", severity: "ERROR", message: "NISN siswa terindikasi duplikat.", source: "SYSTEM", metadata: asJson({ nisn, ids }) });
      }
    }
  }

  for (const subject of subjects) {
    if (!subject.code) {
      issues.push({ entity: "subjects", record_id: subject.id.toString(), field: "code", severity: "ERROR", message: "Kode mapel wajib diisi untuk integrasi.", source: "SYSTEM" });
    }
  }

  for (const person of staff) {
    if (!person.name) {
      issues.push({ entity: "staff", record_id: person.id, field: "name", severity: "ERROR", message: "Nama GTK wajib diisi.", source: "SYSTEM" });
    }
    if (!person.nik && !person.nip && !person.nuptk) {
      issues.push({ entity: "staff", record_id: person.id, field: "identity", severity: "WARNING", message: "GTK belum memiliki NIK/NIP/NUPTK.", source: "SYSTEM" });
    }
  }

  for (const rombel of rombels) {
    if (rombel.students.length !== rombel.student_count) {
      issues.push({
        entity: "rombels",
        record_id: rombel.id.toString(),
        field: "student_count",
        severity: "INFO",
        message: "Jumlah siswa rombel berbeda dengan relasi siswa aktual.",
        source: "SYSTEM",
        metadata: asJson({ recorded: rombel.student_count, actual: rombel.students.length }),
      });
    }
  }

  await db.$transaction([
    db.dataValidationIssue.deleteMany({ where: { source: "SYSTEM", status: "OPEN" } }),
    ...(issues.length ? [db.dataValidationIssue.createMany({ data: issues })] : []),
  ]);

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "integrasi-data",
    action: "run_validation",
    entityType: "DataValidationIssue",
    metadata: { count: issues.length },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "DataValidationIssue",
    entityId: "system-scan",
    action: "validate",
    after: { count: issues.length },
  });

  return NextResponse.json({ data: { count: issues.length } });
}
