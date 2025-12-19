import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { heroTitle, heroDescription, isApplyFormEnabled } = data;

    if (!heroTitle?.trim()) {
      return NextResponse.json(
        { message: "Judul halaman pendaftaran wajib diisi." },
        { status: 400 }
      );
    }

    const existing = await db.admissionLandingSetting.findFirst();
    if (existing) {
      await db.admissionLandingSetting.update({
        where: { id: existing.id },
        data: { 
          heroTitle, 
          heroDescription,
          isApplyFormEnabled: isApplyFormEnabled ?? existing.isApplyFormEnabled,
        },
      });
    } else {
      await db.admissionLandingSetting.create({
        data: { 
          heroTitle, 
          heroDescription,
          isApplyFormEnabled: isApplyFormEnabled ?? true,
        },
      });
    }

    revalidatePath("/apply");
    revalidatePath("/admin/penerimaan-siswa/settings");

    return NextResponse.json(
      { message: "Pengaturan landing berhasil disimpan" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving landing settings:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat menyimpan pengaturan" },
      { status: 500 }
    );
  }
}
