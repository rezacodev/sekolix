import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";

export async function GET() {
  const access = await requireApiPermission("read", "perpustakaan");
  if (!access.ok) return access.response;

  const now = new Date();
  const [bookCount, copyCount, activeLoans, overdueLoans, fines, popularRaw, lateLoans] = await Promise.all([
    db.libraryBook.count({ where: { is_active: true } }),
    db.libraryCopy.count(),
    db.libraryLoan.count({ where: { status: "ACTIVE" } }),
    db.libraryLoan.count({ where: { OR: [{ status: "OVERDUE" }, { status: "ACTIVE", due_at: { lt: now } }] } }),
    db.libraryFine.findMany({ where: { status: "UNPAID" }, select: { amount: true } }),
    db.libraryLoan.groupBy({ by: ["copy_id"], _count: { _all: true }, orderBy: { _count: { copy_id: "desc" } }, take: 20 }),
    db.libraryLoan.findMany({
      where: { OR: [{ status: "OVERDUE" }, { status: "ACTIVE", due_at: { lt: now } }] },
      include: { copy: { include: { book: true } }, member: true },
      orderBy: { due_at: "asc" },
      take: 50,
    }),
  ]);

  const copyIds = popularRaw.map((item) => item.copy_id);
  const copies = await db.libraryCopy.findMany({
    where: { id: { in: copyIds } },
    include: { book: true },
  });
  const copyMap = new Map(copies.map((copy) => [copy.id, copy]));

  return NextResponse.json({
    data: {
      metrics: {
        bookCount,
        copyCount,
        activeLoans,
        overdueLoans,
        unpaidFineAmount: fines.reduce((sum, fine) => sum + fine.amount.toNumber(), 0),
      },
      popularBooks: popularRaw.map((item) => ({
        copyId: item.copy_id,
        title: copyMap.get(item.copy_id)?.book.title ?? "-",
        barcode: copyMap.get(item.copy_id)?.barcode ?? "-",
        count: item._count._all,
      })),
      lateLoans: lateLoans.map((loan) => ({
        id: loan.id,
        due_at: loan.due_at,
        member: loan.member.name,
        title: loan.copy.book.title,
        barcode: loan.copy.barcode,
      })),
    },
  });
}
