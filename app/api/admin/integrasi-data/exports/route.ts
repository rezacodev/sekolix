import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { getDefaultIntegrationProfile } from "@/lib/data-integration/persistence";
import { getIntegrationTemplateColumns, jsonSafe, supportedEntityOrDefault } from "@/lib/data-integration/server";
import { buildExcelBuffer } from "@/lib/reports/excel";

async function buildRows(entity: string) {
  if (entity === "students") {
    const students = await db.pesertaDidik.findMany({
      where: { deleted_at: null },
      include: { rombels: true },
      orderBy: { fullName: "asc" },
      take: 5000,
    });
    return students.map((student) => ({
      nik: student.nik,
      nisn: student.nisn,
      fullName: student.fullName,
      phone: student.phone,
      email: student.email,
      gender: student.gender,
      placeOfBirth: student.placeOfBirth,
      dateOfBirth: student.dateOfBirth?.toISOString().slice(0, 10),
      religion: student.religion,
      address: student.address,
      city: student.city,
      province: student.province,
      postalCode: student.postalCode,
      fatherName: student.fatherName,
      motherName: student.motherName,
      guardianName: student.guardianName,
      rombelName: student.rombels.map((rombel) => rombel.name).join(", "),
    }));
  }

  if (entity === "staff") {
    const staff = await db.staff.findMany({
      where: { deleted_at: null },
      orderBy: { name: "asc" },
      take: 5000,
    });
    return staff.map((person) => ({
      nik: person.nik,
      nip: person.nip,
      nuptk: person.nuptk,
      name: person.name,
      role: person.role,
      position: person.position,
      jenisPTK: person.jenisPTK,
      email: person.email,
      phone: person.phone,
    }));
  }

  if (entity === "rombels") {
    const rombels = await db.rombel.findMany({
      where: { deleted_at: null },
      include: { class: true, program: true, tahunAjaran: true },
      orderBy: { name: "asc" },
      take: 5000,
    });
    return rombels.map((rombel) => ({
      id: rombel.id.toString(),
      name: rombel.name,
      className: rombel.class.name,
      programName: rombel.program.name,
      academicYear: rombel.tahunAjaran?.label,
      capacity: rombel.capacity,
      studentCount: rombel.student_count,
    }));
  }

  if (entity === "subjects") {
    const subjects = await db.subject.findMany({
      where: { deleted_at: null },
      orderBy: [{ code: "asc" }, { name: "asc" }],
      take: 5000,
    });
    return subjects.map((subject) => ({
      id: subject.id.toString(),
      code: subject.code,
      name: subject.name,
      kkm: subject.kkm,
      isPractice: subject.is_practice,
    }));
  }

  const grades = await db.grade.findMany({
    where: { deleted_at: null },
    include: { student: true, assessment: { include: { subject: true } } },
    orderBy: { created_at: "desc" },
    take: 5000,
  });
  return grades.map((grade) => ({
    studentName: grade.student.fullName,
    nisn: grade.student.nisn,
    subjectCode: grade.assessment.subject.code,
    subjectName: grade.assessment.subject.name,
    assessmentTitle: grade.assessment.title,
    score: grade.score.toString(),
    notes: grade.notes,
  }));
}

export async function GET(request: Request) {
  const access = await requireApiPermission("export", "integrasi-data");
  if (!access.ok) return access.response;

  const url = new URL(request.url);
  const entity = supportedEntityOrDefault(url.searchParams.get("entity"));
  const format = (url.searchParams.get("format") ?? "xlsx").toLowerCase();
  const profile = url.searchParams.get("profileId")
    ? await db.dataIntegrationProfile.findUnique({ where: { id: url.searchParams.get("profileId") ?? "" } })
    : await getDefaultIntegrationProfile();
  if (!profile) return NextResponse.json({ error: "Profil integrasi belum tersedia" }, { status: 400 });

  const rows = await buildRows(entity);
  const today = new Date().toISOString().slice(0, 10);
  const filename = `integrasi-${entity}-${today}.${format === "json" ? "json" : "xlsx"}`;
  await db.exportBatch.create({
    data: {
      profile_id: profile.id,
      entity,
      format: format.toUpperCase(),
      file_name: filename,
      row_count: rows.length,
      created_by: access.context.user.id,
      metadata: jsonSafe({ profileCode: profile.code }) as object,
    },
  });
  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "integrasi-data",
    action: "export",
    entityType: "ExportBatch",
    metadata: { entity, format, count: rows.length },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "ExportBatch",
    entityId: filename,
    action: "export",
    after: { entity, format, count: rows.length },
  });

  if (format === "json") {
    return NextResponse.json({ data: rows, profile, filename });
  }

  const buffer = await buildExcelBuffer([
    { name: entity, columns: getIntegrationTemplateColumns(entity), rows },
  ]);
  return new NextResponse(buffer, {
    headers: {
      "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "content-disposition": `attachment; filename="${filename}"`,
    },
  });
}
