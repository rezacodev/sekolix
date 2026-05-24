import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user from database to get userId
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has a staff record (userId is not unique, so use findFirst)
    const staff = await db.staff.findFirst({
      where: { userId: user.id },
      select: {
        id: true,
        role: true
      }
    });

    if (!staff) {
      return NextResponse.json({
        success: false,
        error: "No staff record found"
      });
    }

    return NextResponse.json({
      success: true,
      staffId: staff.id,
      staffRole: staff.role
    });
  } catch (error) {
    console.error("Error fetching staff info:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
