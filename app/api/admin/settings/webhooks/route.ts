import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") return null;
  return session.user;
}

// Default webhook events — seeded on first GET if not in DB
const DEFAULT_EVENTS = [
  { event: "STUDENT_ADMITTED", label: "Siswa Diterima / Didaftarkan" },
  { event: "GRADE_SUBMITTED", label: "Nilai Diinput oleh Guru" },
  { event: "ATTENDANCE_SAVED", label: "Absensi Disimpan" },
  { event: "ASSIGNMENT_GRADED", label: "Tugas Dinilai" },
  { event: "MESSAGE_SENT", label: "Pesan Baru Dikirim" },
];

// GET /api/admin/settings/webhooks — list all webhook configs
export async function GET() {
  try {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any;

    // Ensure all default events exist
    for (const ev of DEFAULT_EVENTS) {
      await db.webhookConfig.upsert({
        where: { event: ev.event },
        create: { event: ev.event, label: ev.label, is_active: false },
        update: {},
      });
    }

    const configs = await db.webhookConfig.findMany({
      orderBy: { event: "asc" },
    });

    return NextResponse.json({ configs });
  } catch (error) {
    console.error("Error fetching webhook configs:", error);
    return NextResponse.json({ error: "Gagal memuat webhook" }, { status: 500 });
  }
}

// PATCH /api/admin/settings/webhooks — update a webhook config
// Body: { event, url?, is_active?, secret? }
export async function PATCH(request: Request) {
  try {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { event, url, is_active, secret } = body as {
      event: string;
      url?: string;
      is_active?: boolean;
      secret?: string;
    };

    if (!event) {
      return NextResponse.json({ error: "event wajib diisi" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any;

    const updated = await db.webhookConfig.upsert({
      where: { event },
      create: {
        event,
        label: DEFAULT_EVENTS.find((e) => e.event === event)?.label ?? event,
        url: url ?? null,
        is_active: is_active ?? false,
        secret: secret ?? null,
      },
      update: {
        ...(url !== undefined && { url: url || null }),
        ...(is_active !== undefined && { is_active }),
        ...(secret !== undefined && { secret: secret || null }),
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ config: updated });
  } catch (error) {
    console.error("Error updating webhook config:", error);
    return NextResponse.json({ error: "Gagal menyimpan webhook" }, { status: 500 });
  }
}

// POST /api/admin/settings/webhooks/test — send test ping to a webhook URL
// Body: { event }
export async function POST(request: Request) {
  try {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { event } = body as { event: string };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any;
    const config = await db.webhookConfig.findFirst({ where: { event } });

    if (!config?.url) {
      return NextResponse.json({ error: "URL webhook belum dikonfigurasi" }, { status: 400 });
    }

    const payload = {
      event,
      timestamp: new Date().toISOString(),
      test: true,
      source: "Sekolix",
    };

    try {
      const res = await fetch(config.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000),
      });

      await db.webhookConfig.update({
        where: { event },
        data: { last_triggered_at: new Date(), last_status: res.status },
      });

      return NextResponse.json({ status: res.status, ok: res.ok });
    } catch {
      await db.webhookConfig.update({
        where: { event },
        data: { last_triggered_at: new Date(), last_status: 0 },
      });
      return NextResponse.json({ error: "Endpoint tidak dapat dijangkau", status: 0 });
    }
  } catch (error) {
    console.error("Error testing webhook:", error);
    return NextResponse.json({ error: "Gagal mengirim test webhook" }, { status: 500 });
  }
}
