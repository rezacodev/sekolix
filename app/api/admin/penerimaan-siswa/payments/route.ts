import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserRole } from "@/types";

const allowedRoles: UserRole[] = ["ADMIN", "EDITOR"];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role as UserRole | undefined;

    if (!session || !userRole || !allowedRoles.includes(userRole)) {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    const url = new URL(request.url);
    const applicantId = url.searchParams.get("applicantId");

    const whereClause: { applicantId?: string } = {};
    if (applicantId) whereClause.applicantId = applicantId;

    const payments = await db.applicantPayment.findMany({
      where: whereClause,
      include: {
        applicant: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role as UserRole | undefined;

    if (!session || !userRole || !allowedRoles.includes(userRole)) {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    const body = await request.json();
    const { applicantId, amount, method, proofUrl, notes } = body;

    if (!applicantId || !amount) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const payment = await db.applicantPayment.create({
      data: {
        applicantId,
        amount: Number(amount),
        method: method ?? "manual",
        proofUrl: proofUrl ?? null,
        notes: notes ?? null,
      },
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}
