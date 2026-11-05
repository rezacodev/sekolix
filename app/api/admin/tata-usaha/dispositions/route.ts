import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { getStaffIdForUser } from "@/lib/office/server";

const dispositionSchema = z.object({
  incomingLetterId: z.string().optional().nullable(),
  outgoingLetterId: z.string().optional().nullable(),
  assignedTo: z.string().min(1),
  instruction: z.string().trim().min(3).max(2000),
  dueDate: z.coerce.date().optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export async function GET() {
  const access = await requireApiPermission("read", "tata-usaha");
  if (!access.ok) return access.response;
  const dispositions = await db.letterDisposition.findMany({
    include: { incomingLetter: true, outgoingLetter: true, assignee: { select: { name: true } }, creator: { select: { name: true } } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 300,
  });
  return NextResponse.json({ data: dispositions });
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "tata-usaha");
  if (!access.ok) return access.response;
  const parsed = dispositionSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  if (!parsed.data.incomingLetterId && !parsed.data.outgoingLetterId) return NextResponse.json({ error: "Pilih surat masuk atau surat keluar" }, { status: 400 });

  const [assignee, creatorId] = await Promise.all([
    db.staff.findUnique({ where: { id: parsed.data.assignedTo } }),
    getStaffIdForUser(access.context.user.id),
  ]);
  if (!assignee) return NextResponse.json({ error: "Pegawai tujuan disposisi tidak ditemukan" }, { status: 404 });

  const disposition = await db.letterDisposition.create({
    data: {
      incoming_letter_id: parsed.data.incomingLetterId ?? null,
      outgoing_letter_id: parsed.data.outgoingLetterId ?? null,
      assigned_to: parsed.data.assignedTo,
      from_staff_id: creatorId,
      instruction: parsed.data.instruction,
      due_date: parsed.data.dueDate ?? null,
      notes: parsed.data.notes ?? null,
    },
  });
  await logActivity({ actorUserId: access.context.user.id, actorName: access.context.user.name, module: "tata-usaha", action: "create_letter_disposition", entityType: "LetterDisposition", entityId: disposition.id, metadata: { assignedTo: assignee.name }, request });
  await writeAuditTrail({ actorUserId: access.context.user.id, entityType: "LetterDisposition", entityId: disposition.id, action: "create", after: disposition });
  return NextResponse.json({ data: disposition }, { status: 201 });
}

