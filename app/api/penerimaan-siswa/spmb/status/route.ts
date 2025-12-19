import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";

const statusSchema = z.object({
  nik: z.string().regex(/^[0-9]{16}$/, "NIK harus terdiri dari 16 digit"),
  phone: z.string().regex(/^[0-9]{10,15}$/, "Nomor HP harus berupa angka 10-15 digit"),
});

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 5;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function consumeRateLimit(key: string) {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const payload = statusSchema.parse(await request.json());
    const rateLimitKey = `${payload.nik}:${payload.phone}`;

    if (!consumeRateLimit(rateLimitKey)) {
      return NextResponse.json(
        {
          status: "rateLimited",
          message: "Terlalu banyak permintaan. Coba lagi nanti.",
        },
        { status: 429 }
      );
    }

    const applicant = await db.applicant.findUnique({
      where: { nik: payload.nik },
      select: {
        id: true,
        fullName: true,
        nik: true,
        phone: true,
        email: true,
        programChoice: true,
        status: true,
        notes: true,
        handledBy: true,
        createdAt: true,
        updatedAt: true,
        program: {
          select: {
            id: true,
            name: true,
          },
        },
        academicYear: {
          select: {
            id: true,
            label: true,
            registrationFee: true,
          },
        },
        payments: {
          select: {
            id: true,
            method: true,
            amount: true,
            status: true,
            proofUrl: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!applicant || applicant.phone !== payload.phone) {
      return NextResponse.json(
        { status: "notFound", message: "Data tidak ditemukan." },
        { status: 404 }
      );
    }

    // compute payment summary
    let registrationFee = 0;
    if (applicant?.academicYear?.registrationFee) {
      registrationFee = Number(applicant.academicYear.registrationFee || 0);
    }

    type ApplicantPayment = {
      id: string;
      method?: string | null;
      amount: number | string;
      status?: string | null;
      proofUrl?: string | null;
      createdAt: Date;
    };

    const payments = (applicant?.payments ?? []) as ApplicantPayment[];
    const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    return NextResponse.json({
      status: "ok",
      applicant,
      billing: {
        registrationFee,
        totalPaid,
        remaining: Math.max(0, registrationFee - totalPaid),
        payments,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { status: "error", message: error.issues.map((item) => item.message).join("; ") },
        { status: 400 }
      );
    }

    console.error("SPMB status error", error);
    return NextResponse.json(
      { status: "error", message: "Terjadi kesalahan saat memeriksa status." },
      { status: 500 }
    );
  }
}
