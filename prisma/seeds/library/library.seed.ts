import * as bcrypt from "bcryptjs";
import { prisma } from "../utils/prisma";
import { generateBarcode, generateMemberCode } from "../../../src/lib/library/server";

export async function seedLibraryDemo() {
  console.log("Seeding library demo...");

  const user = await prisma.user.upsert({
    where: { email: "pustakawan@sekolix.com" },
    update: { name: "Pustakawan Sekolah", role: "STAFF", isActive: true },
    create: {
      email: "pustakawan@sekolix.com",
      name: "Pustakawan Sekolah",
      password: await bcrypt.hash("pustakawan123", 10),
      role: "STAFF",
      isActive: true,
    },
  });

  let staff = await prisma.staff.findFirst({ where: { userId: user.id } });
  if (staff) {
    staff = await prisma.staff.update({
      where: { id: staff.id },
      data: {
        name: "Pustakawan Sekolah",
        role: "STAFF",
        position: "Pustakawan",
        jenisPTK: "Tenaga Kependidikan",
        jabatanPTK: "Pustakawan",
        isActive: true,
      },
    });
  } else {
    staff = await prisma.staff.create({
      data: {
        userId: user.id,
        name: "Pustakawan Sekolah",
        role: "STAFF",
        nik: `LIB${user.id.slice(0, 13)}`,
        gender: "FEMALE",
        position: "Pustakawan",
        jenisPTK: "Tenaga Kependidikan",
        jabatanPTK: "Pustakawan",
        isActive: true,
      },
    });
  }

  const role = await prisma.accessRole.findUnique({ where: { slug: "PUSTAKAWAN" } });
  if (role) {
    await prisma.userAccessRole.upsert({
      where: { user_id_role_id: { user_id: user.id, role_id: role.id } },
      update: { is_active: true, expires_at: null },
      create: {
        user_id: user.id,
        role_id: role.id,
        assigned_by: "system",
      },
    });
  }

  const fiction = await prisma.libraryCategory.upsert({
    where: { code: "FIKSI" },
    update: { name: "Fiksi", is_active: true },
    create: { code: "FIKSI", name: "Fiksi", description: "Novel, cerpen, dan bacaan sastra." },
  });
  const reference = await prisma.libraryCategory.upsert({
    where: { code: "REFERENSI" },
    update: { name: "Referensi", is_active: true },
    create: { code: "REFERENSI", name: "Referensi", description: "Buku rujukan pembelajaran." },
  });

  const books = [
    { title: "Laskar Pelajar", author: "Andrea Hirata", category_id: fiction.id, isbn: "LIB-DEMO-001" },
    { title: "Ensiklopedia Sains Sekolah", author: "Tim Sekolix", category_id: reference.id, isbn: "LIB-DEMO-002" },
    { title: "Dasar Pemrograman Web", author: "Tim Informatika", category_id: reference.id, isbn: "LIB-DEMO-003" },
  ];

  for (const item of books) {
    const book = await prisma.libraryBook.upsert({
      where: { isbn: item.isbn },
      update: {
        title: item.title,
        author: item.author,
        category_id: item.category_id,
        is_active: true,
      },
      create: {
        ...item,
        publisher: "Sekolix Press",
        publication_year: 2026,
        location: "Rak A1",
        created_by: user.id,
      },
    });

    const existingCopies = await prisma.libraryCopy.count({ where: { book_id: book.id } });
    for (let index = existingCopies; index < 3; index += 1) {
      await prisma.libraryCopy.create({
        data: {
          book_id: book.id,
          barcode: generateBarcode("LIB"),
          acquisition_date: new Date(),
          source: "Demo seed",
          status: "AVAILABLE",
          condition: "GOOD",
          location: book.location,
        },
      });
    }
  }

  const students = await prisma.pesertaDidik.findMany({ where: { deleted_at: null }, take: 5 });
  for (const student of students) {
    const existing = await prisma.libraryMember.findFirst({ where: { student_id: student.id } });
    if (!existing) {
      await prisma.libraryMember.create({
        data: {
          member_code: generateMemberCode("STUDENT"),
          type: "STUDENT",
          student_id: student.id,
          name: student.fullName,
          email: student.email,
          phone: student.mobile ?? student.phone,
        },
      });
    }
  }

  const firstMember = await prisma.libraryMember.findFirst({ where: { type: "STUDENT", status: "ACTIVE" } });
  const firstCopy = await prisma.libraryCopy.findFirst({ where: { status: "AVAILABLE" } });
  if (firstMember && firstCopy) {
    const existingLoan = await prisma.libraryLoan.findFirst({
      where: { member_id: firstMember.id, copy_id: firstCopy.id, status: { in: ["ACTIVE", "OVERDUE"] } },
    });
    if (!existingLoan) {
      await prisma.libraryLoan.create({
        data: {
          member_id: firstMember.id,
          copy_id: firstCopy.id,
          borrowed_at: new Date(),
          due_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: "ACTIVE",
          processed_by: staff.id,
        },
      });
      await prisma.libraryCopy.update({ where: { id: firstCopy.id }, data: { status: "BORROWED" } });
    }
  }

  console.log("Library demo seeded");
}
