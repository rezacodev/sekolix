import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Increment view count
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const materialId = BigInt(id);

    await prisma.teachingMaterial.update({
      where: { id: materialId },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ message: "View counted" });
  } catch (error) {
    console.error("Error incrementing view:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
