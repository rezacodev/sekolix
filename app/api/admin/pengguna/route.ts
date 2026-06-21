import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

type UserRole = "SUPERADMIN" | "ADMIN" | "GURU" | "STAFF" | "MURID" | "ORANGTUA" | "EDITOR" | "USER";

const ADMIN_ROLES: UserRole[] = ["SUPERADMIN", "ADMIN"];

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role as UserRole)) return null;
  return session.user;
}

// GET /api/admin/pengguna — list all users with linked staff info
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
      staff: {
        where: { deleted_at: null },
        take: 1,
        select: { id: true, name: true, role: true, position: true },
      },
    },
  });

  return NextResponse.json(
    users.map((u) => ({
      ...u,
      staff: u.staff[0] ?? null,
    }))
  );
}

// POST /api/admin/pengguna — create new user
// Body: { email, name?, password, role }
export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email, name, password, role } = await req.json();
  if (!email?.trim() || !password || !role) {
    return NextResponse.json({ error: "Email, password, dan role wajib diisi" }, { status: 400 });
  }

  // Only superadmin can create superadmin accounts
  if (role === "SUPERADMIN" && admin.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Hanya Superadmin yang dapat membuat akun Superadmin" }, { status: 403 });
  }

  const existing = await db.user.findUnique({ where: { email: email.trim() } });
  if (existing) {
    return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
  }

  const hashed = await hash(password, 10);
  const user = await db.user.create({
    data: {
      email: email.trim(),
      name: name?.trim() || null,
      password: hashed,
      role,
      isActive: true,
    },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  });

  return NextResponse.json(user, { status: 201 });
}

// PATCH /api/admin/pengguna — update user
// Body: { id, name?, role?, isActive?, newPassword? }
export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, name, role, isActive, newPassword } = await req.json();
  if (!id) return NextResponse.json({ error: "User id wajib diisi" }, { status: 400 });

  // Only superadmin can assign/change superadmin role
  if (role === "SUPERADMIN" && admin.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Hanya Superadmin yang dapat menetapkan role Superadmin" }, { status: 403 });
  }

  // Prevent demoting last superadmin
  if (role && role !== "SUPERADMIN" && id !== admin.id) {
    const target = await db.user.findUnique({ where: { id }, select: { role: true } });
    if (target?.role === "SUPERADMIN") {
      const superadminCount = await db.user.count({ where: { role: "SUPERADMIN", isActive: true } });
      if (superadminCount <= 1) {
        return NextResponse.json({ error: "Tidak dapat mengubah role superadmin terakhir" }, { status: 400 });
      }
    }
  }

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name?.trim() || null;
  if (role !== undefined) data.role = role;
  if (typeof isActive === "boolean") data.isActive = isActive;
  if (newPassword) {
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
    }
    data.password = await hash(newPassword, 10);
  }

  const user = await db.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  return NextResponse.json(user);
}

// DELETE /api/admin/pengguna — delete user
// Body: { id }
export async function DELETE(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "User id wajib diisi" }, { status: 400 });
  if (id === admin.id) {
    return NextResponse.json({ error: "Tidak dapat menghapus akun sendiri" }, { status: 400 });
  }

  const target = await db.user.findUnique({ where: { id }, select: { role: true } });
  if (target?.role === "SUPERADMIN") {
    const superadminCount = await db.user.count({ where: { role: "SUPERADMIN" } });
    if (superadminCount <= 1) {
      return NextResponse.json({ error: "Tidak dapat menghapus superadmin terakhir" }, { status: 400 });
    }
  }

  await db.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
