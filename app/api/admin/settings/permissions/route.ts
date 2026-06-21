import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { buildRules } from "@/lib/permissions/definitions";
import type { UserRole } from "@/lib/permissions/types";
import { db as prisma } from "@/lib/db";

async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SUPERADMIN") return null;
  return session.user;
}

// GET /api/admin/settings/permissions?role=STAFF
// Returns default rules + DB overrides for the given role
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["SUPERADMIN", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const role = (url.searchParams.get("role") ?? "STAFF") as UserRole;

  const overrides = await (prisma as any).rolePermission.findMany({
    where: { role },
    orderBy: [{ subject: "asc" }, { action: "asc" }],
  });

  const rules = buildRules(role, overrides);

  return NextResponse.json({ role, overrides, rules });
}

// POST /api/admin/settings/permissions
// Body: { role, subject, action, inverted }
export async function POST(req: Request) {
  const admin = await requireSuperAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { role, subject, action, inverted = false } = await req.json();
  if (!role || !subject || !action) {
    return NextResponse.json({ error: "role, subject, dan action wajib diisi" }, { status: 400 });
  }

  const perm = await (prisma as any).rolePermission.upsert({
    where: { role_subject_action: { role, subject, action } },
    create: { role, subject, action, inverted },
    update: { inverted },
  });

  return NextResponse.json(perm, { status: 201 });
}

// DELETE /api/admin/settings/permissions
// Body: { id }
export async function DELETE(req: Request) {
  const admin = await requireSuperAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });

  await (prisma as any).rolePermission.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
