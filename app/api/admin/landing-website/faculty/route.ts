import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import type { Prisma } from "@prisma/client";

// GET - Fetch all faculty
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = url.searchParams.get("page");
    const pageSize = Number(url.searchParams.get("pageSize") || "10");
    const search = url.searchParams.get("search") || "";
    const department = url.searchParams.get("department") || undefined;

    // Show only teachers for public faculty listing (same as akademik management)
    const baseWhere: Prisma.StaffWhereInput = { role: "TEACHER" };
    if (department) baseWhere.department = department;
    if (search) {
      baseWhere.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { position: { contains: search, mode: "insensitive" } },
        { nip: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } }
      ];
    }

    if (page !== null) {
      const p = Number(page || 0);
      const skip = p * pageSize;
      const totalCount = await prisma.staff.count({ where: baseWhere });
      const items = await prisma.staff.findMany({
        where: baseWhere,
        orderBy: { name: "asc" },
        skip,
        take: pageSize
      });
      return NextResponse.json({ items, totalCount, page: p, pageSize });
    }
    const faculty = await prisma.staff.findMany({ where: baseWhere, orderBy: { name: "asc" } });
    return NextResponse.json(faculty);
  } catch (error) {
    console.error("Error fetching faculty:", error);
    return NextResponse.json({ error: "Failed to fetch faculty" }, { status: 500 });
  }
}

// POST - Create new faculty
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !session.user ||
      (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    type CreateFacultyPayload = {
      name?: string;
      role?: string;
      position?: string | null;
      department?: string | null;
      image?: string | null;
      email?: string | null;
      phone?: string | null;
      bio?: string | null;
      order?: number;
      isActive?: boolean;
    };

    const data = (await request.json()) as CreateFacultyPayload;

    const rawRole = data.role ? String(data.role) : undefined;
    const role = rawRole === "TEACHER" ? "TEACHER" : "STAFF";

    const createData = {
      name: data.name || "",
      role: role,
      position: data.position || undefined,
      department: data.department || undefined,
      image: data.image || undefined,
      email: data.email || undefined,
      phone: data.phone || undefined,
      bio: data.bio || undefined,
      order: data.order || 0,
      isActive: data.isActive !== undefined ? data.isActive : true
    };

    const faculty = await prisma.staff.create({ data: createData as Prisma.StaffCreateInput });

    return NextResponse.json(faculty, { status: 201 });
  } catch (error) {
    console.error("Error creating faculty:", error);
    return NextResponse.json({ error: "Failed to create faculty" }, { status: 500 });
  }
}
