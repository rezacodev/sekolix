import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ rombelId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { rombelId: rombelIdStr } = await params;
    const rombelId = parseInt(rombelIdStr);

    // Get rombel info
    const rombel = await prisma.rombel.findUnique({
      where: { id: rombelId },
      include: {
        class: {
          select: { name: true },
        },
      },
    });

    if (!rombel) {
      return NextResponse.json(
        { error: "Rombel not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      className: rombel.class.name,
      rombelName: rombel.name,
      subjectName: "", // Will be populated from query if needed
    });
  } catch (error) {
    console.error("Error fetching class info:", error);
    return NextResponse.json(
      { error: "Failed to fetch class info" },
      { status: 500 }
    );
  }
}
