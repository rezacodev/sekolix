import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { teacherTheme: true }
    });

    return NextResponse.json({ 
      teacherTheme: user?.teacherTheme || "minimalist-light" 
    });
  } catch (error) {
    console.error("Error fetching teacher theme:", error);
    return NextResponse.json(
      { error: "Failed to fetch teacher theme" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { teacherTheme } = body;

    if (!teacherTheme) {
      return NextResponse.json(
        { error: "Teacher theme is required" },
        { status: 400 }
      );
    }

    await db.user.update({
      where: { id: session.user.id },
      data: { teacherTheme }
    });

    return NextResponse.json({ 
      success: true, 
      teacherTheme 
    });
  } catch (error) {
    console.error("Error updating teacher theme:", error);
    return NextResponse.json(
      { error: "Failed to update teacher theme" },
      { status: 500 }
    );
  }
}
