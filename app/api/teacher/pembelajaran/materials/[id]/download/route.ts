import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiPermission } from "@/lib/api/guards";
import { parseBigInt } from "@/lib/api/validation";

// POST - Increment download count
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const access = await requireApiPermission("read", "teacher.portal");
    if (!access.ok) return access.response;

    const { id } = await params;
    const parsedMaterialId = parseBigInt(id);
    if (!parsedMaterialId.ok) return parsedMaterialId.response;

    await prisma.teachingMaterial.update({
      where: { id: parsedMaterialId.value },
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
