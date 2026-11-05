import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { db } from "@/lib/db";
import { requireApiPermission } from "@/lib/api/guards";
import { logActivity, writeAuditTrail } from "@/lib/governance/server";
import { generateBarcode } from "@/lib/library/server";

function text(value: unknown) {
  if (value == null) return "";
  if (typeof value === "object" && "text" in value) return String((value as { text?: unknown }).text ?? "");
  return String(value).trim();
}

export async function POST(request: Request) {
  const access = await requireApiPermission("create", "perpustakaan");
  if (!access.ok) return access.response;

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File Excel wajib diunggah" }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) return NextResponse.json({ error: "Worksheet tidak ditemukan" }, { status: 400 });

  let createdBooks = 0;
  let createdCopies = 0;
  const errors: string[] = [];

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    const title = text(row.getCell(1).value);
    if (!title) continue;

    try {
      const isbn = text(row.getCell(2).value) || null;
      const author = text(row.getCell(3).value) || null;
      const categoryName = text(row.getCell(4).value) || "Umum";
      const publisher = text(row.getCell(5).value) || null;
      const year = Number(text(row.getCell(6).value)) || null;
      const quantity = Math.max(1, Number(text(row.getCell(7).value)) || 1);
      const location = text(row.getCell(8).value) || null;

      const category = await db.libraryCategory.upsert({
        where: { code: categoryName.toUpperCase().replace(/[^A-Z0-9]+/g, "_").slice(0, 32) || "UMUM" },
        update: { name: categoryName, is_active: true },
        create: {
          code: categoryName.toUpperCase().replace(/[^A-Z0-9]+/g, "_").slice(0, 32) || "UMUM",
          name: categoryName,
        },
      });

      let book = isbn ? await db.libraryBook.findUnique({ where: { isbn } }) : null;
      if (!book) {
        book = await db.libraryBook.create({
          data: {
            category_id: category.id,
            isbn,
            title,
            author,
            publisher,
            publication_year: year,
            location,
            created_by: access.context.user.id,
          },
        });
        createdBooks += 1;
      }

      await db.libraryCopy.createMany({
        data: Array.from({ length: quantity }).map(() => ({
          book_id: book.id,
          barcode: generateBarcode(),
          location,
          status: "AVAILABLE",
          condition: "GOOD",
        })),
      });
      createdCopies += quantity;
    } catch (error) {
      errors.push(`Baris ${rowNumber}: ${error instanceof Error ? error.message : "gagal diproses"}`);
    }
  }

  await logActivity({
    actorUserId: access.context.user.id,
    actorName: access.context.user.name,
    module: "perpustakaan",
    action: "import_books",
    entityType: "LibraryBook",
    metadata: { createdBooks, createdCopies, errors: errors.length },
    request,
  });
  await writeAuditTrail({
    actorUserId: access.context.user.id,
    entityType: "LibraryBook",
    entityId: "excel-import",
    action: "import",
    after: { createdBooks, createdCopies, errors },
  });

  return NextResponse.json({ data: { createdBooks, createdCopies, errors } }, { status: 201 });
}
