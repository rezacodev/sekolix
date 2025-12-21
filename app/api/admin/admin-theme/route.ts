import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
// Note: import `db` dynamically inside handlers to avoid initializing PrismaClient
// during Next.js build on platforms like Vercel where DATABASE_URL may be unavailable
// at build time.

const ALLOWED_THEMES = [
  "classic-light",
  "modern-light",
  "minimalist-light",
  "midnight-emerald",
  "violet-night",
];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await import("@/lib/db");

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { adminTheme: true },
    });

    const theme = user?.adminTheme && ALLOWED_THEMES.includes(user.adminTheme)
      ? user.adminTheme
      : "minimalist-light";

    return NextResponse.json({ adminTheme: theme });
  } catch (error) {
    console.error("[ADMIN_THEME_GET]", error);
    return NextResponse.json({ error: "Failed to fetch admin theme" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { adminTheme } = body as { adminTheme?: string };

    if (!adminTheme || !ALLOWED_THEMES.includes(adminTheme)) {
      return NextResponse.json({ error: "Invalid theme" }, { status: 400 });
    }

    const { db } = await import("@/lib/db");

    const updated = await db.user.update({
      where: { email: session.user.email },
      data: { adminTheme },
      select: { adminTheme: true },
    });

    return NextResponse.json({ adminTheme: updated.adminTheme });
  } catch (error) {
    console.error("[ADMIN_THEME_POST]", error);
    return NextResponse.json({ error: "Failed to update admin theme" }, { status: 500 });
  }
}
