import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const checkExisting = url.searchParams.get("checkExisting");
    const nikes = url.searchParams.get("nikes")?.split(",").filter(Boolean) || [];
    const nisns = url.searchParams.get("nisns")?.split(",").filter(Boolean) || [];

    if (checkExisting && (nikes.length > 0 || nisns.length > 0)) {
      const existing: { nik: string; nisn?: string }[] = [];

      if (nikes.length > 0) {
        const nikRecords = await db.pesertaDidik.findMany({
          where: { nik: { in: nikes } },
          select: { nik: true, nisn: true }
        });
        existing.push(...nikRecords.map(r => ({ nik: r.nik, nisn: r.nisn || undefined })));
      }

      if (nisns.length > 0) {
        const nisnRecords = await db.pesertaDidik.findMany({
          where: { nisn: { in: nisns } },
          select: { nik: true, nisn: true }
        });
        // Add nisn records that aren't already in the list
        nisnRecords.forEach(record => {
          if (!existing.find(e => e.nik === record.nik)) {
            existing.push({ nik: record.nik, nisn: record.nisn || undefined });
          }
        });
      }

      return NextResponse.json(existing);
    }

    if (id) {
      const item = await db.pesertaDidik.findUnique({ where: { id } });
      return NextResponse.json({ item });
    }

    const page = Number(url.searchParams.get("page") || "0");
    const pageSize = Number(url.searchParams.get("pageSize") || "10");
    const search = url.searchParams.get("search") || "";
    const yearId = url.searchParams.get("yearId");
    const program = url.searchParams.get("program");

    const whereBase: Prisma.PesertaDidikWhereInput = {};
    if (search) whereBase.fullName = { contains: search, mode: "insensitive" };
    if (yearId) {
      whereBase.entryYearId = yearId;
    }
    if (program) whereBase.OR = [{ programChoice: program }, { program: { name: program } }];

    const totalCount = await db.pesertaDidik.count({ where: whereBase });

    const items = await db.pesertaDidik.findMany({
      where: whereBase,
      orderBy: { fullName: "asc" },
      skip: page * pageSize,
      take: pageSize,
      select: {
        id: true,
        nik: true,
        nisn: true,
        fullName: true,
        phone: true,
        mobile: true,
        programChoice: true,
        programId: true,
        program: { select: { name: true } },
        entryYearId: true,
        entryYear: { select: { label: true } },
        email: true,
        createdAt: true,
        rombels: {
          select: {
            id: true,
            name: true,
            class: { select: { id: true, name: true } }
          },
          take: 1 // Get the first/primary class group
        }
      }
    });
    // Log academicYearId values for debugging filter mismatches
    try {
      const ids = items.map(it => it.entryYearId ?? "(null)");
      console.debug(
        `API: peserta-didik returning ${items.length} items (totalCount=${totalCount}) entryYearIds:`,
        ids
      );
    } catch {
      console.debug(
        `API: peserta-didik returning ${items.length} items (totalCount=${totalCount})`
      );
    }

    // Convert BigInt to number for JSON serialization
    const serializedItems = items.map(item => ({
      ...item,
      rombels:
        item.rombels?.map((cg) => ({
          ...cg,
          id: Number(cg.id),
          class: cg.class
            ? {
                ...cg.class,
                id: Number(cg.class.id)
              }
            : undefined
        })) || []
    }));

    return NextResponse.json({ items: serializedItems, totalCount, page, pageSize });
  } catch (error) {
    console.error("Error fetching peserta didik:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengambil data peserta didik" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const data = await request.json();
    const { nik, fullName, phone, email } = data;

    if (!nik || !fullName || !phone) {
      return NextResponse.json({ message: "Field wajib: nik, fullName, phone" }, { status: 400 });
    }

    await db.pesertaDidik.create({
      data: {
        nik,
        fullName,
        phone,
        email: email || null,
        registrationCode: data.registrationCode || null
      }
    });

    revalidatePath("/admin/manajemen-akademik/peserta-didik");

    return NextResponse.json({ message: "Peserta didik berhasil ditambahkan" }, { status: 200 });
  } catch (error) {
    console.error("Error creating peserta didik:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat menambahkan peserta didik" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const data = await request.json();
    const { id, nik, fullName, phone, email } = data;

    if (!id || !nik || !fullName || !phone) {
      return NextResponse.json(
        { message: "Field wajib: id, nik, fullName, phone" },
        { status: 400 }
      );
    }

    await db.pesertaDidik.update({
      where: { id },
      data: {
        nik,
        fullName,
        phone,
        email: email || null
      }
    });

    revalidatePath("/admin/manajemen-akademik/peserta-didik");

    return NextResponse.json({ message: "Peserta didik berhasil diperbarui" }, { status: 200 });
  } catch (error) {
    console.error("Error updating peserta didik:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memperbarui peserta didik" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ message: "ID peserta didik diperlukan" }, { status: 400 });

    await db.pesertaDidik.delete({ where: { id } });

    revalidatePath("/admin/manajemen-akademik/peserta-didik");

    return NextResponse.json({ message: "Peserta didik dihapus" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting peserta didik:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat menghapus peserta didik" },
      { status: 500 }
    );
  }
}
