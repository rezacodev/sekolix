import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { getStaffIdForUser } from "@/lib/office/server";

const reviewSchema = z.object({
  status: z.enum(["APPROVED", "CANCELLED"]),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await requireApiPermission("approve", "tata-usaha");
  if (!access.ok) return access.response;

  const { id } = await context.params;
  const parsed = reviewSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });

  const [before, reviewerId] = await Promise.all([
    db.outgoingLetter.findUnique({ where: { id }, include: { approvals: true } }),
    getStaffIdForUser(access.context.user.id),
  ]);
  if (!before) return NextResponse.json({ error: "Surat keluar tidak ditemukan" }, { status: 404 });

  const result = await db.$transaction(async (tx) => {
    const letter = await tx.outgoingLetter.update({
      where: { id },
      data: { status: parsed.data.status },
    });
    await tx.letterApproval.updateMany({
      where: { outgoing_letter_id: id, status: "PENDING" },
      data: { status: parsed.data.status, reviewed_by: reviewerId, reviewed_at: new Date(), notes: parsed.data.notes ?? null },
    });
    return letter;
  });

  await logActivity({ actorUserId: access.context.user.id, actorName: access.context.user.name, module: "tata-usaha", action: "review_outgoing_letter", entityType: "OutgoingLetter", entityId: id, metadata: { status: parsed.data.status }, request });
  await writeAuditTrail({ actorUserId: access.context.user.id, entityType: "OutgoingLetter", entityId: id, action: "review", before, after: result, reason: parsed.data.notes ?? null });

  return NextResponse.json({ data: result });
}

