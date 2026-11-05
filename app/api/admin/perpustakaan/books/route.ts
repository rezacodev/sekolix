import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";

const bookSchema = z.object({
  categoryId: z.string().optional().nullable(),
  isbn: z.string().trim().max(32).optional().nullable(),
  title: z.string().trim().min(2).max(220),
  subtitle: z.string().trim().max(220).optional().nullable(),
  author: z.string().trim().max(220).optional().nullable(),
  publisher: z.string().trim().max(160).optional().nullable(),
  publicationYear: z.coerce.number().int().min(1000).max(2100).optional().nullable(),
  language: z.string().trim().min(2).max(12).default("id"),
  pages: z.coerce.number().int().positive().optional().nullable(),
  description: z.string().trim().max(3000).optional().nullable(),
  coverUrl: z.string().trim().url().optional().nullable(),
  location: z.string().trim().max(120).optional().nullable(),
});

function serializeBook(book: Awaited<ReturnType<typeof db.libraryBook.findMany>>[number]) {
  return book;
}

export async function GET(request: Request) {
  const access = await requireApiPermission("read", "perpustakaan");
  if (!access.ok) return access.response;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim();
  const categoryId = searchParams.get("categoryId");

  const books = await db.libraryBook.findMany({
    where: {
      is_active: true,
      ...(categoryId ? { category_id: categoryId } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { author: { contains: search, mode: "insensitive" } },
              { isbn: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      category: true,
      copies: true,
    },
    orderBy: { title: "asc" },
    take: 300,
  });

  return NextResponse.json({ data: books.map(serializeBook) });
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "perpustakaan");
  if (!access.ok) return access.response;

  const parsed = bookSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const book = await db.libraryBook.create({
    data: {
      category_id: parsed.data.categoryId ?? null,
      isbn: parsed.data.isbn || null,
      title: parsed.data.title,
      subtitle: parsed.data.subtitle ?? null,
      author: parsed.data.author ?? null,
      publisher: parsed.data.publisher ?? null,
      publication_year: parsed.data.publicationYear ?? null,
      language: parsed.data.language,
      pages: parsed.data.pages ?? null,
      description: parsed.data.description ?? null,
      cover_url: parsed.data.coverUrl ?? null,
      location: parsed.data.location ?? null,
      created_by: access.context.user.id,
    },
  });

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "perpustakaan",
    action: "create_book",
    entityType: "LibraryBook",
    entityId: book.id,
    metadata: { title: book.title, isbn: book.isbn },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "LibraryBook",
    entityId: book.id,
    action: "create",
    after: book,
  });

  return NextResponse.json({ data: book }, { status: 201 });
}
