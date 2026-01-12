import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ids } = body as { ids: string[] };

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "ids is required" }, { status: 400 });
    }

    await db.$transaction(async tx => {
      for (let index = 0; index < ids.length; index++) {
        const id = ids[index];
        await tx.gallery.update({
          where: { id },
          data: { order: index + 1 }
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reorder galleries:", error);
    return NextResponse.json({ error: "Failed to reorder galleries" }, { status: 500 });
  }
}
