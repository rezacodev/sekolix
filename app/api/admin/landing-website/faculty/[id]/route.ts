import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

// GET - Fetch single faculty
export async function GET(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    let id: string | undefined;
    const params = context.params;
    if (params) {
      const resolved = await Promise.resolve(params as unknown);
      id = (resolved as { id?: string })?.id;
    }
    const faculty = await prisma.staff.findUnique({ where: { id } });

    if (!faculty) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
    }

    return NextResponse.json(faculty);
  } catch (error) {
    console.error("Error fetching faculty:", error);
    return NextResponse.json({ error: "Failed to fetch faculty" }, { status: 500 });
  }
}

// PUT - Update faculty
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    let id: string | undefined;
    const params = context.params;
    if (params) {
      const resolved = await Promise.resolve(params as unknown);
      id = (resolved as { id?: string })?.id;
    }
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !session.user ||
      (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    type UpdateFacultyPayload = {
      name?: string;
      position?: string | null;
      department?: string | null;
      image?: string | null;
      email?: string | null;
      phone?: string | null;
      bio?: string | null;
      order?: number;
      isActive?: boolean;
    };

    const data = (await request.json()) as UpdateFacultyPayload;

    const faculty = await prisma.staff.update({
      where: { id },
      data: {
        name: data.name || undefined,
        position: data.position || undefined,
        department: data.department || undefined,
        image: data.image || undefined,
        email: data.email || undefined,
        phone: data.phone || undefined,
        bio: data.bio || undefined,
        order: data.order || undefined,
        isActive: data.isActive || undefined
      }
    });

    return NextResponse.json(faculty);
  } catch (error) {
    console.error("Error updating faculty:", error);
    return NextResponse.json({ error: "Failed to update faculty" }, { status: 500 });
  }
}

// DELETE - Delete faculty
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    let id: string | undefined;
    const params = context.params;
    if (params) {
      const resolved = await Promise.resolve(params as unknown);
      id = (resolved as { id?: string })?.id;
    }
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.staff.delete({ where: { id } });

    return NextResponse.json({ message: "Faculty deleted successfully" });
  } catch (error) {
    console.error("Error deleting faculty:", error);
    return NextResponse.json({ error: "Failed to delete faculty" }, { status: 500 });
  }
}
