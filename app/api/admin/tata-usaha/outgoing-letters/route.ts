import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { createApprovalRequest, logActivity, writeAuditTrail } from "@/lib/governance/server";
import { generateQrPayload, generateValidationCode, getStaffIdForUser, nextOfficeNumber } from "@/lib/office/server";

const outgoingSchema = z.object({
  letterNumber: z.string().trim().max(120).optional().nullable(),
  agendaNumber: z.string().trim().max(120).optional().nullable(),
  templateId: z.string().optional().nullable(),
  recipient: z.string().trim().min(2).max(180),
  recipientType: z.string().trim().max(80).default("GENERAL"),
  subject: z.string().trim().min(2).max(220),
  body: z.string().trim().max(8000).optional().nullable(),
  letterDate: z.coerce.date(),
  status: z.enum(["DRAFT", "WAITING_APPROVAL", "APPROVED", "SENT"]).default("DRAFT"),
  fileUrl: z.string().trim().url().optional().nullable(),
  signedBy: z.string().optional().nullable(),
});

export async function GET() {
  const access = await requireApiPermission("read", "tata-usaha");
  if (!access.ok) return access.response;

  const letters = await db.outgoingLetter.findMany({
    include: { template: true, creator: { select: { name: true } }, signer: { select: { name: true } }, approvals: true },
    orderBy: { letter_date: "desc" },
    take: 300,
  });
  return NextResponse.json({ data: letters });
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "tata-usaha");
  if (!access.ok) return access.response;

  const parsed = outgoingSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });

  if (parsed.data.templateId) {
    const template = await db.letterTemplate.findUnique({ where: { id: parsed.data.templateId } });
    if (!template) return NextResponse.json({ error: "Template tidak ditemukan" }, { status: 404 });
  }
  if (parsed.data.signedBy) {
    const signer = await db.staff.findUnique({ where: { id: parsed.data.signedBy } });
    if (!signer) return NextResponse.json({ error: "Penandatangan tidak ditemukan" }, { status: 404 });
  }

  const staffId = await getStaffIdForUser(access.context.user.id);
  const letterNumber = parsed.data.letterNumber || (await nextOfficeNumber("OUTGOING_LETTER", "SK"));
  const agendaNumber = parsed.data.agendaNumber || (await nextOfficeNumber("OUTGOING_AGENDA", "AG"));
  const validationCode = generateValidationCode();

  const result = await db.$transaction(async (tx) => {
    const letter = await tx.outgoingLetter.create({
      data: {
        letter_number: letterNumber,
        agenda_number: agendaNumber,
        template_id: parsed.data.templateId ?? null,
        recipient: parsed.data.recipient,
        recipient_type: parsed.data.recipientType,
        subject: parsed.data.subject,
        body: parsed.data.body ?? null,
        letter_date: parsed.data.letterDate,
        status: parsed.data.status,
        file_url: parsed.data.fileUrl ?? null,
        validation_code: validationCode,
        qr_code: generateQrPayload(validationCode),
        created_by: staffId,
        signed_by: parsed.data.signedBy ?? null,
        sent_at: parsed.data.status === "SENT" ? new Date() : null,
      },
    });
    let approvalId: string | null = null;
    if (parsed.data.status === "WAITING_APPROVAL") {
      const approval = await tx.letterApproval.create({
        data: { outgoing_letter_id: letter.id, requested_by: staffId, status: "PENDING" },
      });
      approvalId = approval.id;
    }
    return { letter, approvalId };
  });

  if (parsed.data.status === "WAITING_APPROVAL") {
    await createApprovalRequest({
      module: "tata-usaha",
      action: "approve_letter",
      title: `Approval Surat ${result.letter.letter_number}`,
      description: result.letter.subject,
      entityType: "OutgoingLetter",
      entityId: result.letter.id,
      requestedBy: access.context.user.id,
      requestedByName: access.context.user.name,
      payload: { letterId: result.letter.id, approvalId: result.approvalId },
      steps: [{ approverRoleSlug: "KEPALA_SEKOLAH" }],
    });
  }

  await logActivity({ actorUserId: access.context.user.id, actorName: access.context.user.name, module: "tata-usaha", action: "create_outgoing_letter", entityType: "OutgoingLetter", entityId: result.letter.id, metadata: { letterNumber, status: parsed.data.status }, request });
  await writeAuditTrail({ actorUserId: access.context.user.id, entityType: "OutgoingLetter", entityId: result.letter.id, action: "create", after: result });

  return NextResponse.json({ data: result.letter }, { status: 201 });
}

