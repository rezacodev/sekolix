import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { DEFAULT_LOAN_DAYS, getStaffIdForUser } from "@/lib/library/server";

const loanSchema = z.object({
  copyId: z.string().min(1),
  memberId: z.string().min(1),
  dueAt: z.coerce.date().optional(),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export async function GET() {
  const access = await requireApiPermission("read", "perpustakaan");
  if (!access.ok) return access.response;

  const now = new Date();
  await db.libraryLoan.updateMany({
    where: { status: "ACTIVE", due_at: { lt: now } },
    data: { status: "OVERDUE" },
  });

  const loans = await db.libraryLoan.findMany({
    include: {
      copy: { include: { book: true } },
      member: true,
      fines: true,
      processor: { select: { name: true } },
      returner: { select: { name: true } },
    },
    orderBy: [{ status: "asc" }, { borrowed_at: "desc" }],
    take: 300,
  });

  return NextResponse.json({
    data: loans.map((loan) => ({
      ...loan,
      copy: { ...loan.copy, price: loan.copy.price?.toNumber() ?? null },
      fines: loan.fines.map((fine) => ({ ...fine, amount: fine.amount.toNumber() })),
    })),
  });
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "perpustakaan");
  if (!access.ok) return access.response;

  const parsed = loanSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const [copy, member, staffId] = await Promise.all([
    db.libraryCopy.findUnique({ where: { id: parsed.data.copyId }, include: { book: true } }),
    db.libraryMember.findUnique({ where: { id: parsed.data.memberId } }),
    getStaffIdForUser(access.context.user.id),
  ]);

  if (!copy) return NextResponse.json({ error: "Eksemplar tidak ditemukan" }, { status: 404 });
  if (!member || member.status !== "ACTIVE") return NextResponse.json({ error: "Anggota tidak aktif atau tidak ditemukan" }, { status: 404 });
  if (copy.status !== "AVAILABLE") return NextResponse.json({ error: "Eksemplar tidak tersedia untuk dipinjam" }, { status: 400 });

  const dueAt = parsed.data.dueAt ?? new Date(Date.now() + DEFAULT_LOAN_DAYS * 24 * 60 * 60 * 1000);
  const result = await db.$transaction(async (tx) => {
    const loan = await tx.libraryLoan.create({
      data: {
        copy_id: copy.id,
        member_id: member.id,
        due_at: dueAt,
        status: "ACTIVE",
        condition_on_borrow: copy.condition,
        notes: parsed.data.notes ?? null,
        processed_by: staffId,
      },
    });
    const updatedCopy = await tx.libraryCopy.update({
      where: { id: copy.id },
      data: { status: "BORROWED" },
    });
    return { loan, updatedCopy };
  });

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "perpustakaan",
    action: "create_loan",
    entityType: "LibraryLoan",
    entityId: result.loan.id,
    metadata: { copyId: copy.id, memberId: member.id, bookTitle: copy.book.title },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "LibraryLoan",
    entityId: result.loan.id,
    action: "create",
    before: copy,
    after: result,
  });

  return NextResponse.json({ data: result.loan }, { status: 201 });
}
