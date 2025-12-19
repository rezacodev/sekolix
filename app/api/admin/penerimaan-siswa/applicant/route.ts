import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
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
    const yearId = url.searchParams.get("yearId");
    const program = url.searchParams.get("program") || undefined;

    const whereClause: Prisma.ApplicantWhereInput = {};
    if (yearId) {
      whereClause.academicYearId = yearId;
    }
    if (program) {
      // match either related program name or programChoice field
      whereClause.OR = [
        { program: { is: { name: program } } },
        { programChoice: program },
      ];
    }

    const applicants = await db.applicant.findMany({
      where: whereClause,
      include: {
        program: true,
        academicYear: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const enriched = await Promise.all(
      applicants.map(async (a) => {
        const sum = await db.applicantPayment.aggregate({
          where: { applicantId: a.id },
          _sum: { amount: true },
        });

        const lastPayment = await db.applicantPayment.findFirst({
          where: { applicantId: a.id },
          orderBy: { createdAt: "desc" },
          take: 1,
        });

        const totalPaid = sum._sum.amount ?? 0;
        const registrationFee =
          (a.academicYear && (a.academicYear as { registrationFee?: number }).registrationFee) ?? 0;

        let billingStatus = "Belum Bayar";
        if (registrationFee > 0 && totalPaid >= registrationFee) {
          billingStatus = "Lunas";
        } else if (totalPaid > 0) {
          billingStatus = "Partial";
        }

        return {
          ...a,
          registrationCode: a.registrationCode ?? null,
          billDate: a.createdAt,
          lastPaymentDate: lastPayment?.createdAt ?? null,
          totalPaid,
          registrationFee,
          billingStatus,
        };
      })
    );

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Error fetching applicants:", error);
    return NextResponse.json(
      { error: "Failed to fetch applicants" },
      { status: 500 }
    );
  }
}
