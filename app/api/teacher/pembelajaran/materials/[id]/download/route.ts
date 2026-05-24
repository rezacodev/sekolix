import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Increment download count
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
        downloads: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ message: "Download counted" });
  } catch (error) {
    console.error("Error incrementing download:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
