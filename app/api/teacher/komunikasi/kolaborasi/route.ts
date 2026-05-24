import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getStaffId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.staffId) return null;
  return session.user.staffId;
}

// GET /api/teacher/komunikasi/kolaborasi — list all staff (teacher directory)
export async function GET(request: Request) {
  try {
    const staffId = await getStaffId();
    if (!staffId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";
    const position = searchParams.get("position") ?? "";

    const staff = await prisma.staff.findMany({
      where: {
        deleted_at: null,
        id: { not: staffId },
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { nip: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(position ? { jabatanPTK: { contains: position, mode: "insensitive" } } : {}),
      },
      select: {
        id: true,
        name: true,
        nip: true,
        gtkPosition: true,
        jabatanPTK: true,
        email: true,
        phone: true,
      },
      orderBy: { name: "asc" },
    });

    // Get unread message counts from each staff member
    const unreadCounts = await prisma.message.groupBy({
      by: ["sender_id"],
      where: {
        receiver_id: staffId,
        receiver_type: "TEACHER",
        sender_type: "TEACHER",
        is_read: false,
        deleted_at: null,
      },
      _count: { id: true },
    });
    const unreadMap = new Map(unreadCounts.map((u) => [u.sender_id, u._count.id]));

    const teachers = staff.map((s) => ({
      id: s.id,
      fullName: s.name,
      nip: s.nip ?? "",
      position: s.jabatanPTK ?? s.gtkPosition ?? "",
      email: s.email ?? null,
      mobile: s.phone ?? null,
      unread: unreadMap.get(s.id) ?? 0,
    }));

    return NextResponse.json({ teachers, total: teachers.length });
  } catch (error) {
    console.error("Error fetching kolaborasi directory:", error);
    return NextResponse.json({ error: "Failed to fetch directory" }, { status: 500 });
  }
}
