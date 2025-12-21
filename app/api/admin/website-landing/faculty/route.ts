import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

// GET - Fetch all faculty
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = url.searchParams.get("page");
    const pageSize = Number(url.searchParams.get("pageSize") || "10");
    const search = url.searchParams.get("search") || "";
    const department = url.searchParams.get("department") || undefined;

    const baseWhere: any = { isActive: true };
    if (department) baseWhere.department = department;
    if (search) {
      baseWhere.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { position: { contains: search, mode: "insensitive" } },
      ];
    }

    if (page !== null) {
      const p = Number(page || 0);
      const skip = p * pageSize;
      const totalCount = await prisma.faculty.count({ where: baseWhere });
      const items = await prisma.faculty.findMany({
        where: baseWhere,
        orderBy: { order: "asc" },
        skip,
        take: pageSize,
      });
      return NextResponse.json({ items, totalCount, page: p, pageSize });
    }

    const faculty = await prisma.faculty.findMany({
      where: baseWhere,
      orderBy: { order: "asc" },
    });

    return NextResponse.json(faculty);
  } catch (error) {
    console.error("Error fetching faculty:", error);
    return NextResponse.json(
      { error: "Failed to fetch faculty" },
      { status: 500 }
    );
  }
}

// POST - Create new faculty
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const faculty = await prisma.faculty.create({
      data: {
        name: data.name,
        position: data.position,
        department: data.department,
        image: data.image,
        email: data.email,
        phone: data.phone,
        bio: data.bio,
        order: data.order || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });

    return NextResponse.json(faculty, { status: 201 });
  } catch (error) {
    console.error("Error creating faculty:", error);
    return NextResponse.json(
      { error: "Failed to create faculty" },
      { status: 500 }
    );
  }
}
