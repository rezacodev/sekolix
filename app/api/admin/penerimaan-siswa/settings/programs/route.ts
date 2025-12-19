import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const programs = await db.program.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(programs);
  } catch (error) {
    console.error("Error fetching programs:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengambil data program" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, code, description } = data;

    if (!name?.trim()) {
      return NextResponse.json(
        { message: "Nama program wajib diisi." },
        { status: 400 }
      );
    }

    await db.program.create({
      data: {
        name,
        code: code || null,
        description: description || null,
        isActive: true,
      },
    });

    revalidatePath("/apply");
    revalidatePath("/admin/penerimaan-siswa/settings/programs");

    return NextResponse.json(
      { message: "Program berhasil ditambahkan" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating program:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat menambahkan program" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { programId, action } = data;

    if (!programId?.trim()) {
      return NextResponse.json(
        { message: "Program tidak ditemukan." },
        { status: 400 }
      );
    }

    await db.program.update({
      where: { id: programId },
      data: { isActive: action === "activate" },
    });

    revalidatePath("/apply");
    revalidatePath("/admin/penerimaan-siswa/settings/programs");

    return NextResponse.json(
      { message: `Program berhasil di${action === "activate" ? "aktifkan" : "nonaktifkan"}` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error toggling program state:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengubah status program" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    const { programId, name, code, description } = data;

    if (!programId?.trim()) {
      return NextResponse.json({ message: "Program tidak ditemukan." }, { status: 400 });
    }

    await db.program.update({
      where: { id: programId },
      data: {
        name,
        code: code || null,
        description: description || null,
      },
    });

    revalidatePath("/admin/penerimaan-siswa/settings/programs");
    revalidatePath("/apply");

    return NextResponse.json({ message: "Program diperbarui" }, { status: 200 });
  } catch (error) {
    console.error("Error updating program:", error);
    return NextResponse.json({ message: "Terjadi kesalahan saat memperbarui program" }, { status: 500 });
  }
}
