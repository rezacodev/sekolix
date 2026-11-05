import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { getStaffIdForUser, nextOfficeNumber } from "@/lib/office/server";

const incomingSchema = z.object({
  agendaNumber: z.string().trim().max(80).optional().nullable(),
  letterNumber: z.string().trim().max(120).optional().nullable(),
  receivedAt: z.coerce.date(),
  letterDate: z.coerce.date().optional().nullable(),
  sender: z.string().trim().min(2).max(180),
  subject: z.string().trim().min(2).max(220),
  summary: z.string().trim().max(2000).optional().nullable(),
  fileUrl: z.string().trim().url().optional().nullable(),
  classification: z.string().trim().max(80).optional().nullable(),
  status: z.enum(["RECEIVED", "ARCHIVED", "CANCELLED"]).default("RECEIVED"),
});

export async function GET() {
  const access = await requireApiPermission("read", "tata-usaha");
  if (!access.ok) return access.response;

  const letters = await db.incomingLetter.findMany({
    include: { receiver: { select: { name: true } }, creator: { select: { name: true } }, dispositions: true },
    orderBy: { received_at: "desc" },
    take: 300,
  });
  return NextResponse.json({ data: letters });
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "tata-usaha");
  if (!access.ok) return access.response;

  const parsed = incomingSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });

  const staffId = await getStaffIdForUser(access.context.user.id);
  const agendaNumber = parsed.data.agendaNumber || (await nextOfficeNumber("INCOMING_AGENDA", "SM"));
  const letter = await db.incomingLetter.create({
    data: {
      agenda_number: agendaNumber,
      letter_number: parsed.data.letterNumber ?? null,
      received_at: parsed.data.receivedAt,
      letter_date: parsed.data.letterDate ?? null,
      sender: parsed.data.sender,
      subject: parsed.data.subject,
      summary: parsed.data.summary ?? null,
      file_url: parsed.data.fileUrl ?? null,
      status: parsed.data.status,
      classification: parsed.data.classification ?? null,
      received_by: staffId,
      created_by: staffId,
    },
  });

  await logActivity({ actorUserId: access.context.user.id, actorName: access.context.user.name, module: "tata-usaha", action: "create_incoming_letter", entityType: "IncomingLetter", entityId: letter.id, metadata: { agendaNumber }, request });
  await writeAuditTrail({ actorUserId: access.context.user.id, entityType: "IncomingLetter", entityId: letter.id, action: "create", after: letter });

  return NextResponse.json({ data: letter }, { status: 201 });
}

