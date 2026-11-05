import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { generateBarcode } from "@/lib/library/server";

const copySchema = z.object({
  bookId: z.string().min(1),
  barcode: z.string().trim().min(3).max(80).optional().nullable(),
  acquisitionDate: z.coerce.date().optional().nullable(),
  source: z.string().trim().max(120).optional().nullable(),
  price: z.coerce.number().min(0).optional().nullable(),
  condition: z.enum(["GOOD", "FAIR", "DAMAGED"]).default("GOOD"),
  location: z.string().trim().max(120).optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
  quantity: z.coerce.number().int().min(1).max(100).default(1),
});

export async function GET() {
  const access = await requireApiPermission("read", "perpustakaan");
  if (!access.ok) return access.response;

  const copies = await db.libraryCopy.findMany({
    include: { book: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
    take: 300,
  });
  return NextResponse.json({
    data: copies.map((copy) => ({ ...copy, price: copy.price?.toNumber() ?? null })),
  });
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "perpustakaan");
  if (!access.ok) return access.response;

  const parsed = copySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const book = await db.libraryBook.findUnique({ where: { id: parsed.data.bookId } });
  if (!book) return NextResponse.json({ error: "Buku tidak ditemukan" }, { status: 404 });

  const copies = await db.$transaction(
    Array.from({ length: parsed.data.quantity }).map((_, index) =>
      db.libraryCopy.create({
        data: {
          book_id: book.id,
          barcode: parsed.data.quantity === 1 && parsed.data.barcode ? parsed.data.barcode : generateBarcode(),
          qr_code: null,
          acquisition_date: parsed.data.acquisitionDate ?? null,
          source: parsed.data.source ?? null,
          price: parsed.data.price ?? null,
          condition: parsed.data.condition,
          location: parsed.data.location ?? book.location,
          notes: parsed.data.notes ?? null,
        },
      })
    )
  );

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "perpustakaan",
    action: "create_copies",
    entityType: "LibraryCopy",
    metadata: { bookId: book.id, quantity: copies.length },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "LibraryCopy",
    entityId: "bulk-create",
    action: "create",
    after: copies,
    metadata: { bookId: book.id },
  });

  return NextResponse.json({ data: copies }, { status: 201 });
}
