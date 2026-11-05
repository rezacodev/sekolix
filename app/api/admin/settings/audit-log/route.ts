import { authOptions } from "@/lib/auth";
import { db as prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["SUPERADMIN", "ADMIN"].includes(session.user.role)) return null;
  return session.user;
}

export async function GET(req: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const type = url.searchParams.get("type") ?? "activity";
  const moduleFilter = url.searchParams.get("module") || undefined;
  const action = url.searchParams.get("action") || undefined;
  const entityType = url.searchParams.get("entityType") || undefined;
  const actorUserId = url.searchParams.get("actorUserId") || undefined;
  const take = Math.min(Number(url.searchParams.get("take") ?? 50), 100);

  if (type === "audit") {
    const auditTrails = await prisma.auditTrail.findMany({
      where: {
        ...(action ? { action } : {}),
        ...(entityType ? { entity_type: entityType } : {}),
        ...(actorUserId ? { actor_user_id: actorUserId } : {}),
      },
      orderBy: { created_at: "desc" },
      take,
    });
    return NextResponse.json({ type, auditTrails });
  }

  const activityLogs = await prisma.activityLog.findMany({
    where: {
      ...(moduleFilter ? { module: moduleFilter } : {}),
      ...(action ? { action } : {}),
      ...(entityType ? { entity_type: entityType } : {}),
      ...(actorUserId ? { actor_user_id: actorUserId } : {}),
    },
    orderBy: { created_at: "desc" },
    take,
  });

  return NextResponse.json({ type, activityLogs });
}
