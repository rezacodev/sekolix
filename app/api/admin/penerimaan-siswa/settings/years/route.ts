import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const years = await db.tahunAjaran.findMany({
      orderBy: { startDate: "desc" },
    });
    return NextResponse.json(years);
  } catch (error) {
    console.error("Error fetching years:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengambil data tahun ajaran" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { label, yearCode, startDate, endDate } = data;

    if (!label?.trim()) {
      return NextResponse.json(
        { message: "Label tahun ajaran wajib diisi." },
        { status: 400 }
      );
    }

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && Number.isNaN(start.getTime())) {
      return NextResponse.json(
        { message: "Tanggal mulai tidak valid." },
        { status: 400 }
      );
    }

    if (end && Number.isNaN(end.getTime())) {
      return NextResponse.json(
        { message: "Tanggal selesai tidak valid." },
        { status: 400 }
      );
    }

    await db.tahunAjaran.create({
      data: {
        label,
        yearCode: yearCode || null,
        startDate: start,
        endDate: end,
        isActive: false,
      },
    });
    

    revalidatePath("/admin/penerimaan-siswa/settings/years");

    return NextResponse.json(
      { message: "Tahun ajaran berhasil ditambahkan" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating academic year:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat menambahkan tahun ajaran" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { yearId } = data;

    if (!yearId?.trim()) {
      return NextResponse.json(
        { message: "Tahun ajaran tidak ditemukan." },
        { status: 400 }
      );
    }

    await db.$transaction([
      db.tahunAjaran.updateMany({
        where: {},
        data: { isActive: false },
      }),
      db.tahunAjaran.update({
        where: { id: yearId },
        data: { isActive: true },
      }),
    ]);

    revalidatePath("/apply");
    revalidatePath("/admin/penerimaan-siswa/settings/years");

    return NextResponse.json(
      { message: "Tahun ajaran berhasil diaktifkan" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error activating academic year:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengaktifkan tahun ajaran" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    const { yearId, name, start, end, registrationFee } = data;

    if (!yearId?.trim()) {
      return NextResponse.json({ message: "Tahun ajaran tidak ditemukan." }, { status: 400 });
    }

    const startDate = start ? new Date(start) : null;
    const endDate = end ? new Date(end) : null;

    // Prisma client types may be out of sync until migrations are applied; cast payload to any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = {
      label: name,
      startDate: startDate,
      endDate: endDate,
      registrationFee: typeof registrationFee === "number" ? registrationFee : Number(registrationFee) || 0,
    };

    await db.tahunAjaran.update({
      where: { id: yearId },
      data: payload,
    });

    revalidatePath("/admin/penerimaan-siswa/settings/years");

    return NextResponse.json({ message: "Tahun ajaran diperbarui" }, { status: 200 });
  } catch (error) {
    console.error("Error updating academic year:", error);
    return NextResponse.json({ message: "Terjadi kesalahan saat memperbarui tahun ajaran" }, { status: 500 });
  }
}
