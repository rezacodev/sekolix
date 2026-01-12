import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const yearId = url.searchParams.get("yearId");
    const page = Number(url.searchParams.get("page") || "0");
    const pageSize = Number(url.searchParams.get("pageSize") || "10");
    const search = url.searchParams.get("search") || "";

    const whereBase: Prisma.AcademicEventWhereInput = {};
    if (yearId) whereBase.tahunAjaranId = yearId;
    if (search) whereBase.title = { contains: search, mode: "insensitive" };

    const totalCount = await db.academicEvent.count({ where: whereBase });

    const items = await db.academicEvent.findMany({
      where: whereBase,
      orderBy: { startDate: "asc" },
      skip: page * pageSize,
      take: pageSize,
      select: { id: true, title: true, description: true, startDate: true, endDate: true }
    });

    return NextResponse.json({ items, totalCount, page, pageSize });
  } catch (error) {
    console.error("Error fetching academic events:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengambil kegiatan" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { tahunAjaranId, title, description, startDate, endDate } = data;

    if (!tahunAjaranId || !title || !startDate) {
      return NextResponse.json(
        { message: "Field wajib: tahunAjaranId, title, startDate" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    await db.academicEvent.create({
      data: {
        tahunAjaranId,
        title,
        description: description || null,
        startDate: start,
        endDate: end
      }
    });

    // Revalidate relevant admin pages
    revalidatePath("/admin/manajemen-akademik/tahun-ajaran");

    return NextResponse.json({ message: "Kegiatan berhasil ditambahkan" }, { status: 200 });
  } catch (error) {
    console.error("Error creating academic event:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat menambahkan kegiatan" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ message: "ID kegiatan diperlukan" }, { status: 400 });

    await db.academicEvent.delete({ where: { id } });

    revalidatePath("/admin/manajemen-akademik/tahun-ajaran");

    return NextResponse.json({ message: "Kegiatan dihapus" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting academic event:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat menghapus kegiatan" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, tahunAjaranId, title, description, startDate, endDate } = data;

    if (!id || !tahunAjaranId || !title || !startDate) {
      return NextResponse.json(
        { message: "Field wajib: id, tahunAjaranId, title, startDate" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    await db.academicEvent.update({
      where: { id },
      data: {
        tahunAjaranId,
        title,
        description: description || null,
        startDate: start,
        endDate: end
      }
    });

    revalidatePath("/admin/manajemen-akademik/tahun-ajaran");

    return NextResponse.json({ message: "Kegiatan berhasil diperbarui" }, { status: 200 });
  } catch (error) {
    console.error("Error updating academic event:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memperbarui kegiatan" },
      { status: 500 }
    );
  }
}
