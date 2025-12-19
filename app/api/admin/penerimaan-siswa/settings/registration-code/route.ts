import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// GET: Get registration code settings for a specific academic year
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const yearId = searchParams.get("yearId");

    if (!yearId) {
      return NextResponse.json(
        { message: "Parameter yearId diperlukan" },
        { status: 400 }
      );
    }

    let settings = await db.admissionRegistrationCodeSetting.findUnique({
      where: { tahunAjaranId: yearId },
    });

    if (!settings) {
      // Create default settings for this year
      const year = await db.tahunAjaran.findUnique({
        where: { id: yearId },
      });

      if (!year) {
        return NextResponse.json(
          { message: "Tahun ajaran tidak ditemukan" },
          { status: 404 }
        );
      }

      settings = await db.admissionRegistrationCodeSetting.create({
        data: {
          tahunAjaranId: yearId,
          prefix: "DAFTAR",
          suffix: "",
          padLength: 4,
          includeYearCode: true,
          nextNumber: 1,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching registration code settings:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengambil pengaturan kode registrasi" },
      { status: 500 }
    );
  }
}

// POST: Update registration code settings for a specific academic year
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { yearId, prefix, suffix, padLength, includeYearCode, resetCounter } = data;

    if (!yearId) {
      return NextResponse.json(
        { message: "Parameter yearId diperlukan" },
        { status: 400 }
      );
    }

    // Verify academic year exists
    const year = await db.tahunAjaran.findUnique({
      where: { id: yearId },
    });

    if (!year) {
      return NextResponse.json(
        { message: "Tahun ajaran tidak ditemukan" },
        { status: 404 }
      );
    }

    let settings = await db.admissionRegistrationCodeSetting.findUnique({
      where: { tahunAjaranId: yearId },
    });

    if (!settings) {
      settings = await db.admissionRegistrationCodeSetting.create({
        data: {
          tahunAjaranId: yearId,
          prefix: prefix ?? "DAFTAR",
          suffix: suffix ?? "",
          padLength: padLength ?? 4,
          includeYearCode: includeYearCode ?? true,
          nextNumber: 1,
        },
      });
    } else {
      const updateData: Partial<{
        prefix: string;
        suffix: string;
        padLength: number;
        includeYearCode: boolean;
        nextNumber: number;
      }> = {};

      if (prefix !== undefined) updateData.prefix = prefix;
      if (suffix !== undefined) updateData.suffix = suffix;
      if (padLength !== undefined) updateData.padLength = padLength;
      if (includeYearCode !== undefined) updateData.includeYearCode = includeYearCode;
      if (resetCounter !== undefined) updateData.nextNumber = resetCounter;

      settings = await db.admissionRegistrationCodeSetting.update({
        where: { tahunAjaranId: yearId },
        data: updateData,
      });
    }

    revalidatePath("/admin/penerimaan-siswa/settings/years");

    return NextResponse.json(
      { 
        message: "Pengaturan kode registrasi berhasil disimpan",
        data: settings 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating registration code settings:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat menyimpan pengaturan kode registrasi" },
      { status: 500 }
    );
  }
}
