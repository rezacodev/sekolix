import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { generateRegistrationCode } from "@/lib/spmb/registrationCodeGenerator";

const registrationSchema = z.object({
  nik: z.string().regex(/^[0-9]{16}$/, "NIK harus terdiri dari 16 digit"),
  phone: z.string().regex(/^[0-9]{10,15}$/, "Nomor HP harus berupa angka 10-15 digit"),
  fullName: z.string().min(3, "Nama harus terdiri dari minimal 3 karakter"),
  email: z.preprocess((val) => {
    if (typeof val === "string" && val.trim() === "") return undefined;
    return val;
  }, z.string().email().optional()),
  schoolOrigin: z.string().optional(),
  programId: z.string().cuid("Program tidak valid atau tidak ditemukan"),
  academicYearId: z.string().cuid("Tahun ajaran tidak valid").optional(),
});


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = registrationSchema.parse(body);
    const program = await db.program.findUnique({ where: { id: payload.programId } });
    if (!program) {
      return NextResponse.json({ status: "error", message: "Program pilihan tidak ditemukan." }, { status: 400 });
    }

    let academicYearId: string | null = null;
    if (payload.academicYearId) {
      const academicYear = await db.tahunAjaran.findUnique({ where: { id: payload.academicYearId } });
      if (!academicYear) {
        return NextResponse.json({ status: "error", message: "Tahun ajaran tidak ditemukan." }, { status: 400 });
      }
      academicYearId = academicYear.id;
    }

    // Check if NIK already registered
    const existing = await db.applicant.findUnique({
      where: { nik: payload.nik },
    });

    if (existing) {
      return NextResponse.json(
        {
          status: "alreadyRegistered",
          message: "NIK sudah terdaftar",
          id: existing.id,
        },
        { status: 409 }
      );
    }

    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0]?.trim() : "unknown";

    // Generate registration code (requires academicYearId)
    if (!academicYearId) {
      return NextResponse.json(
        { status: "error", message: "Tahun ajaran tidak aktif. Pendaftaran tidak dapat dilanjutkan." },
        { status: 400 }
      );
    }

    const registrationCode = await generateRegistrationCode(academicYearId);

    const applicant = await db.applicant.create({
      data: {
        registrationCode,
        nik: payload.nik,
        phone: payload.phone,
        fullName: payload.fullName,
        email: payload.email ?? null,
        schoolOrigin: payload.schoolOrigin ?? null,
        programChoice: program.name,
        programId: program.id,
        academicYearId,
        submissionData: {
          ip,
          userAgent: request.headers.get("user-agent") ?? "",
        },
      },
    });

    return NextResponse.json({
      status: "pending",
      message: `Data Anda sudah tercatat. Kode registrasi: ${registrationCode}. Silakan masuk (login) menggunakan NIK dan Nomor HP untuk melengkapi data profil Anda. Informasi pembayaran biaya pendaftaran (Jika ada) akan ditampilkan setelah Anda login.`,
      id: applicant.id,
      registrationCode,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { status: "error", message: error.issues.map((err) => err.message).join("; ") },
        { status: 400 }
      );
    }

    console.error("SPMB registration error", error);
    return NextResponse.json(
      { status: "error", message: "Terjadi kesalahan saat mendaftarkan data." },
      { status: 500 }
    );
  }
}
