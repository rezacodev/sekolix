import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiPermission } from "@/lib/api/guards";
import { parseBigInt } from "@/lib/api/validation";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const access = await requireApiPermission("read", "akademik.mata-pelajaran");
    if (!access.ok) return access.response;

    const { id } = await params;
    const subjectId = parseBigInt(id);
    if (!subjectId.ok) return subjectId.response;

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId.value },
      select: {
        id: true,
        name: true,
        code: true,
      },
    });

    if (!subject) {
      return NextResponse.json(
        { error: "Subject not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...subject,
      id: Number(subject.id),
    });
  } catch (error) {
    console.error("Error fetching subject:", error);
    return NextResponse.json(
      { error: "Failed to fetch subject" },
      { status: 500 }
    );
  }
}
