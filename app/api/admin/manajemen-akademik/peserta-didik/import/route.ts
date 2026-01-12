import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

type ImportItem = {
  nik?: string;
  fullName?: string;
  nisn?: string;
  placeOfBirth?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  religion?: string;
  motherTongue?: string;
  address?: string;
  village?: string;
  district?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  mobile?: string;
  livesWith?: string;
  weight?: number;
  height?: number;
  distanceToSchool?: number;
  transportationMode?: string;
  anakKe?: number;
  jumlahSaudara?: number;
  achievements?: string;
  fatherName?: string;
  fatherNik?: string;
  fatherBirthYear?: number;
  fatherEducation?: string;
  fatherOccupation?: string;
  fatherIncome?: string;
  motherName?: string;
  motherNik?: string;
  motherBirthYear?: number;
  motherEducation?: string;
  motherOccupation?: string;
  motherIncome?: string;
  guardianName?: string;
  guardianNik?: string;
  guardianBirthYear?: number;
  guardianEducation?: string;
  guardianOccupation?: string;
  guardianIncome?: string;
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";
    let payload: unknown = null;
    if (contentType.includes("application/json")) {
      payload = await request.json();
    } else if (contentType.startsWith("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file") as File | null;
      if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
      const text = await file.text();
      try {
        payload = JSON.parse(text);
      } catch {
        payload = text;
      }
    } else {
      return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });
    }

    // Parse payload structure: { items: ImportItem[], programId: string, academicYearId: string }
    const payloadData = payload as {
      items?: ImportItem[];
      programId?: string;
      academicYearId?: string;
    };
    const items: ImportItem[] = payloadData.items ?? [];
    const programId = payloadData.programId;
    const academicYearId = payloadData.academicYearId;

    // Validate required fields
    if (!programId) {
      return NextResponse.json({ error: "Program ID wajib dipilih" }, { status: 400 });
    }
    if (!academicYearId) {
      return NextResponse.json({ error: "Tahun ajaran ID wajib dipilih" }, { status: 400 });
    }

    // Verify program and year exist
    const [programExists, yearExists] = await Promise.all([
      prisma.program.findUnique({ where: { id: programId } }),
      prisma.tahunAjaran.findUnique({ where: { id: academicYearId } })
    ]);

    if (!programExists) {
      return NextResponse.json({ error: "Program tidak ditemukan" }, { status: 400 });
    }
    if (!yearExists) {
      return NextResponse.json({ error: "Tahun ajaran tidak ditemukan" }, { status: 400 });
    }

    const toCreate: Prisma.PesertaDidikCreateManyInput[] = items.map(it => ({
      nik: it.nik || "",
      fullName: it.fullName || "",
      nisn: it.nisn || undefined,
      placeOfBirth: it.placeOfBirth || undefined,
      dateOfBirth: it.dateOfBirth ? new Date(it.dateOfBirth) : undefined,
      gender: it.gender || undefined,
      nationality: it.nationality || undefined,
      religion: it.religion || undefined,
      motherTongue: it.motherTongue || undefined,
      address: it.address || undefined,
      village: it.village || undefined,
      district: it.district || undefined,
      city: it.city || undefined,
      province: it.province || undefined,
      postalCode: it.postalCode || undefined,
      phone: it.phone || "",
      email: it.email || undefined,
      mobile: it.mobile || undefined,
      livesWith: it.livesWith || undefined,
      weight: it.weight || undefined,
      height: it.height || undefined,
      distanceToSchool: it.distanceToSchool || undefined,
      transportationMode: it.transportationMode || undefined,
      anakKe: it.anakKe || undefined,
      jumlahSaudara: it.jumlahSaudara || undefined,
      achievements: it.achievements || undefined,
      fatherName: it.fatherName || undefined,
      fatherNik: it.fatherNik || undefined,
      fatherBirthYear: it.fatherBirthYear || undefined,
      fatherEducation: it.fatherEducation || undefined,
      fatherOccupation: it.fatherOccupation || undefined,
      fatherIncome: it.fatherIncome || undefined,
      motherName: it.motherName || undefined,
      motherNik: it.motherNik || undefined,
      motherBirthYear: it.motherBirthYear || undefined,
      motherEducation: it.motherEducation || undefined,
      motherOccupation: it.motherOccupation || undefined,
      motherIncome: it.motherIncome || undefined,
      guardianName: it.guardianName || undefined,
      guardianNik: it.guardianNik || undefined,
      guardianBirthYear: it.guardianBirthYear || undefined,
      guardianEducation: it.guardianEducation || undefined,
      guardianOccupation: it.guardianOccupation || undefined,
      guardianIncome: it.guardianIncome || undefined,
      programId,
      entryYearId: academicYearId
    }));

    if (toCreate.length === 0) return NextResponse.json({ ok: true, created: 0 });

    // Try to import each record individually to provide specific error messages
    const results = {
      created: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (let i = 0; i < toCreate.length; i++) {
      const record = toCreate[i];
      try {
        await prisma.pesertaDidik.upsert({
          where: { nik: record.nik },
          update: record as Prisma.PesertaDidikUpdateInput,
          create: record as Prisma.PesertaDidikCreateInput
        });
        results.created++;
      } catch (error: unknown) {
        results.failed++;
        let errorMessage = `Baris ${i + 2}: Gagal mengimpor ${record.fullName || "Unknown"}`;

        if (error && typeof error === "object" && "code" in error) {
          const prismaError = error as { code: string; meta?: { target?: string[] } };
          if (prismaError.code === "P2002") {
            // Unique constraint violation
            const field = prismaError.meta?.target?.[0];
            if (field === "nik") {
              errorMessage += " - NIK sudah terdaftar";
            } else if (field === "nisn" && record.nisn) {
              errorMessage += " - NISN sudah terdaftar";
            } else {
              errorMessage += ` - ${field} sudah terdaftar`;
            }
          } else if (prismaError.code === "P2003") {
            // Foreign key constraint violation
            errorMessage += " - Data referensi tidak valid (program/tahun ajaran)";
          } else {
            errorMessage += ` - ${prismaError.code}`;
          }
        } else if (error instanceof Error) {
          errorMessage += ` - ${error.message}`;
        } else {
          errorMessage += " - Error tidak diketahui";
        }

        results.errors.push(errorMessage);
        console.error(`Import error for record ${i + 1}:`, error);
      }
    }

    if (results.failed > 0) {
      return NextResponse.json(
        {
          ok: false,
          created: results.created,
          failed: results.failed,
          errors: results.errors
        },
        { status: 207 }
      ); // 207 Multi-Status for partial success
    }

    return NextResponse.json({ ok: true, created: results.created });
  } catch (error) {
    console.error("Error importing peserta didik:", error);
    return NextResponse.json({ error: "Failed to import" }, { status: 500 });
  }
}
