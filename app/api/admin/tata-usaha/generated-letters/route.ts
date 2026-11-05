import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { buildSubjectVariables, generateQrPayload, generateValidationCode, getStaffIdForUser, normalizeJson, renderTemplate } from "@/lib/office/server";

const generateSchema = z.object({
  templateId: z.string().min(1),
  studentId: z.string().optional().nullable(),
  staffId: z.string().optional().nullable(),
  subjectName: z.string().trim().max(180).optional().nullable(),
  subjectIdentifier: z.string().trim().max(120).optional().nullable(),
  variables: z.record(z.string(), z.unknown()).optional().default({}),
});

export async function GET() {
  const access = await requireApiPermission("read", "tata-usaha");
  if (!access.ok) return access.response;
  const letters = await db.generatedLetter.findMany({
    include: { template: true, student: { select: { fullName: true, nisn: true } }, staff: { select: { name: true, nip: true } }, creator: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 300,
  });
  return NextResponse.json({ data: letters });
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "tata-usaha");
  if (!access.ok) return access.response;
  const parsed = generateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });

  const [template, student, staff, creatorId] = await Promise.all([
    db.letterTemplate.findUnique({ where: { id: parsed.data.templateId } }),
    parsed.data.studentId ? db.pesertaDidik.findUnique({ where: { id: parsed.data.studentId } }) : null,
    parsed.data.staffId ? db.staff.findUnique({ where: { id: parsed.data.staffId } }) : null,
    getStaffIdForUser(access.context.user.id),
  ]);
  if (!template) return NextResponse.json({ error: "Template tidak ditemukan" }, { status: 404 });
  if (parsed.data.studentId && !student) return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
  if (parsed.data.staffId && !staff) return NextResponse.json({ error: "Pegawai tidak ditemukan" }, { status: 404 });

  const variables = await buildSubjectVariables({ studentId: parsed.data.studentId, staffId: parsed.data.staffId, variables: parsed.data.variables });
  const content = renderTemplate(template.body, variables);
  const validationCode = generateValidationCode();
  const subjectName = parsed.data.subjectName ?? student?.fullName ?? staff?.name ?? String(variables["nama"] ?? "Subjek");
  const generated = await db.generatedLetter.create({
    data: {
      template_id: template.id,
      student_id: parsed.data.studentId ?? null,
      staff_id: parsed.data.staffId ?? null,
      subject_name: subjectName,
      subject_identifier: parsed.data.subjectIdentifier ?? student?.nisn ?? staff?.nip ?? null,
      variables: normalizeJson(variables),
      content,
      validation_code: validationCode,
      qr_code: generateQrPayload(validationCode),
      created_by: creatorId,
    },
  });

  await logActivity({ actorUserId: access.context.user.id, actorName: access.context.user.name, module: "tata-usaha", action: "generate_letter", entityType: "GeneratedLetter", entityId: generated.id, metadata: { template: template.code, subjectName }, request });
  await writeAuditTrail({ actorUserId: access.context.user.id, entityType: "GeneratedLetter", entityId: generated.id, action: "create", after: generated });
  return NextResponse.json({ data: generated }, { status: 201 });
}
