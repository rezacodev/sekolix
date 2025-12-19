import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }
  return session.user;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email, name, password, role } = await req.json();
  if (!email || !password || !role) {
    return NextResponse.json({ error: "Email, password, role required" }, { status: 400 });
  }

  const hashed = await hash(password, 10);
  const user = await db.user.create({
    data: {
      email,
      name: name ?? null,
      password: hashed,
      role,
      isActive: true,
    },
  });

  return NextResponse.json(user, { status: 201 });
}

export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, role, isActive } = await req.json();
  if (!id) return NextResponse.json({ error: "User id required" }, { status: 400 });

  const user = await db.user.update({
    where: { id },
    data: {
      role: role ?? undefined,
      isActive: typeof isActive === "boolean" ? isActive : undefined,
    },
    select: { id: true, email: true, role: true, isActive: true },
  });

  return NextResponse.json(user);
}

export async function DELETE(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "User id required" }, { status: 400 });
  if (id === admin.id) return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });

  await db.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
