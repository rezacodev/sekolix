import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { calculateFineAmount, calculateOverdueDays, getStaffIdForUser } from "@/lib/library/server";

const returnSchema = z.object({
  condition: z.enum(["GOOD", "FAIR", "DAMAGED", "LOST"]).default("GOOD"),
  notes: z.string().trim().max(1000).optional().nullable(),
  fineAmount: z.coerce.number().min(0).optional().nullable(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const access = await requireApiPermission("update", "perpustakaan");
  if (!access.ok) return access.response;

  const { id } = await context.params;
  const parsed = returnSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const loan = await db.libraryLoan.findUnique({
    where: { id },
    include: { copy: { include: { book: true } }, member: true, fines: true },
  });
  if (!loan) return NextResponse.json({ error: "Peminjaman tidak ditemukan" }, { status: 404 });
  if (loan.returned_at) return NextResponse.json({ error: "Buku sudah dikembalikan" }, { status: 400 });

  const returnedAt = new Date();
  const overdueDays = calculateOverdueDays(loan.due_at, returnedAt);
  const fineAmount = parsed.data.fineAmount ?? calculateFineAmount(loan.due_at, returnedAt);
  const staffId = await getStaffIdForUser(access.context.user.id);

  const result = await db.$transaction(async (tx) => {
    const updatedLoan = await tx.libraryLoan.update({
      where: { id },
      data: {
        returned_at: returnedAt,
        returned_by: staffId,
        status: parsed.data.condition === "LOST" ? "LOST" : "RETURNED",
        condition_on_return: parsed.data.condition,
        notes: parsed.data.notes ?? loan.notes,
      },
    });
    const updatedCopy = await tx.libraryCopy.update({
      where: { id: loan.copy_id },
      data: {
        status: parsed.data.condition === "LOST" ? "LOST" : parsed.data.condition === "DAMAGED" ? "DAMAGED" : "AVAILABLE",
        condition: parsed.data.condition === "LOST" ? loan.copy.condition : parsed.data.condition,
      },
    });
    const fine =
      fineAmount > 0
        ? await tx.libraryFine.create({
            data: {
              loan_id: loan.id,
              amount: fineAmount,
              reason: overdueDays > 0 ? `Terlambat ${overdueDays} hari` : "Denda kondisi buku",
              status: "UNPAID",
            },
          })
        : null;
    return { updatedLoan, updatedCopy, fine };
  });

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "perpustakaan",
    action: "return_loan",
    entityType: "LibraryLoan",
    entityId: loan.id,
    metadata: { overdueDays, fineAmount, condition: parsed.data.condition },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "LibraryLoan",
    entityId: loan.id,
    action: "return",
    before: loan,
    after: result,
  });

  return NextResponse.json({
    data: {
      ...result.updatedLoan,
      fine: result.fine ? { ...result.fine, amount: result.fine.amount.toNumber() } : null,
    },
  });
}
