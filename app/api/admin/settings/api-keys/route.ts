import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") return null;
  return session.user;
}

function generateApiKey(): { raw: string; prefix: string; hash: string } {
  const raw = `sk_${crypto.randomBytes(32).toString("hex")}`;
  const prefix = raw.slice(0, 10); // "sk_" + 7 chars
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  return { raw, prefix, hash };
}

// GET /api/admin/settings/api-keys — list all (non-deleted) API keys
export async function GET() {
  try {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any;
    const keys = await db.apiKey.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        name: true,
        key_prefix: true,
        is_active: true,
        last_used_at: true,
        expires_at: true,
        created_by: true,
        created_at: true,
      },
    });

    return NextResponse.json({ keys });
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json({ error: "Gagal memuat API key" }, { status: 500 });
  }
}

// POST /api/admin/settings/api-keys — generate new API key
// Body: { name, expiresAt? }
export async function POST(request: Request) {
  try {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, expiresAt } = body as { name: string; expiresAt?: string };

    if (!name?.trim()) {
      return NextResponse.json({ error: "Nama API key wajib diisi" }, { status: 400 });
    }

    const { raw, prefix, hash } = generateApiKey();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any;
    const staffId = (user as { staffId?: string }).staffId;

    const key = await db.apiKey.create({
      data: {
        name: name.trim(),
        key_prefix: prefix,
        key_hash: hash,
        is_active: true,
        expires_at: expiresAt ? new Date(expiresAt) : null,
        created_by: staffId || user.email || "admin",
      },
    });

    return NextResponse.json({
      key: {
        id: key.id,
        name: key.name,
        key_prefix: key.key_prefix,
        is_active: key.is_active,
        created_at: key.created_at,
      },
      rawKey: raw, // shown only once
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating API key:", error);
    return NextResponse.json({ error: "Gagal membuat API key" }, { status: 500 });
  }
}

// PATCH /api/admin/settings/api-keys — toggle active or soft-delete
// Body: { id, action: "toggle" | "revoke" }
export async function PATCH(request: Request) {
  try {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, action } = body as { id: string; action: "toggle" | "revoke" };

    if (!id || !action) {
      return NextResponse.json({ error: "id dan action wajib diisi" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any;
    const existing = await db.apiKey.findFirst({ where: { id, deleted_at: null } });
    if (!existing) return NextResponse.json({ error: "API key tidak ditemukan" }, { status: 404 });

    if (action === "revoke") {
      await db.apiKey.update({ where: { id }, data: { deleted_at: new Date(), is_active: false } });
      return NextResponse.json({ message: "API key berhasil direvoke" });
    }

    if (action === "toggle") {
      await db.apiKey.update({ where: { id }, data: { is_active: !existing.is_active } });
      return NextResponse.json({ message: "Status API key berhasil diubah" });
    }

    return NextResponse.json({ error: "Action tidak dikenali" }, { status: 400 });
  } catch (error) {
    console.error("Error updating API key:", error);
    return NextResponse.json({ error: "Gagal mengubah API key" }, { status: 500 });
  }
}
