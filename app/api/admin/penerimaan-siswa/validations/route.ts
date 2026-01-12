import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserRole } from "@/types";

const allowedRoles: UserRole[] = ["ADMIN", "EDITOR"];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role as UserRole | undefined;

    if (!session || !userRole || !allowedRoles.includes(userRole)) {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    const validations = await db.applicantValidation.findMany({
      include: {
        applicant: true
      },
      orderBy: { createdAt: "desc" },
      take: 100
    });

    return NextResponse.json(validations);
  } catch (error) {
    console.error("Error fetching validations:", error);
    return NextResponse.json({ error: "Failed to fetch validations" }, { status: 500 });
  }
}
