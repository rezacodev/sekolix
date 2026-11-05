import { NextResponse } from "next/server";
import { z } from "zod";
import { requireParentContext, parentUnauthorized } from "@/lib/parent/server";
import { db } from "@/lib/db";

const updateSchema = z.object({
  notificationId: z.string().min(1),
});

export async function GET() {
  const context = await requireParentContext();
  if (!context) return parentUnauthorized();

  const notifications = await db.parentNotification.findMany({
    where: { parent_id: context.profile.id },
    include: { student: { select: { fullName: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    unreadCount: notifications.filter((item) => !item.read_at).length,
    notifications: notifications.map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      message: item.message,
      href: item.href,
      studentName: item.student?.fullName ?? null,
      readAt: item.read_at?.toISOString() ?? null,
      createdAt: item.createdAt.toISOString(),
    })),
  });
}

export async function PATCH(request: Request) {
  const context = await requireParentContext();
  if (!context) return parentUnauthorized();

  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await db.parentNotification.updateMany({
    where: { id: parsed.data.notificationId, parent_id: context.profile.id },
    data: { read_at: new Date() },
  });

  return NextResponse.json({ ok: true, count: updated.count });
}
