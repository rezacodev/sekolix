import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Session } from "next-auth";

async function requireAdmin(): Promise<Session | null> {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  return session;
}

// Order matters for some restores (insert parents before children)
const MODEL_KEYS = [
  "user",
  "tahunAjaran",
  "program",
  "faculty",
  "gallery",
  "media",
  "schoolIdentity",
  "landingSection",
  "admissionLandingSetting",
  "article",
  "news"
];

// Minimal typing for dynamic Prisma model usage in this export/import helper
type ModelClient = {
  findMany?: (...args: unknown[]) => Promise<unknown>;
  createMany?: (opts: { data: unknown[]; skipDuplicates?: boolean }) => Promise<{ count?: number }>;
  upsert?: (opts: {
    where: Record<string, unknown>;
    update: Record<string, unknown>;
    create: Record<string, unknown>;
  }) => Promise<unknown>;
  create?: (data: Record<string, unknown>) => Promise<unknown>;
};

export async function GET() {
  // Export selected models as JSON
  const session = await requireAdmin();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }

  const result: Record<string, unknown> = {};
  for (const key of MODEL_KEYS) {
    try {
      const model = (db as unknown as Record<string, ModelClient>)[key];
      if (model && typeof model.findMany === "function") {
        // call and store the result; cast to unknown for safety
        result[key] = await model.findMany();
      }
    } catch (e) {
      result[key] = { error: e instanceof Error ? e.message : String(e) };
    }
  }

  const payload = { exportedAt: new Date().toISOString(), data: result };
  const filename = `sekolix-backup-${new Date().toISOString().slice(0, 10)}.json`;
  return NextResponse.json(payload, {
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  });
}

export async function POST(req: Request) {
  // Restore from uploaded JSON file (multipart/form-data or raw JSON)
  const session = await requireAdmin();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }

  try {
    const contentType = req.headers.get("content-type") ?? "";
    let payload: unknown = null;
    if (contentType.startsWith("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file") as File | null;
      if (!file)
        return NextResponse.json({ ok: false, message: "No file provided" }, { status: 400 });
      const text = await file.text();
      payload = JSON.parse(text);
    } else {
      payload = await req.json();
    }

    const payloadObj = payload as { data?: Record<string, unknown> } | Record<string, unknown>;
    const data = payloadObj?.data ?? (payloadObj as Record<string, unknown>);
    const summary: Record<string, unknown> = {};

    function sanitize(item: unknown): Record<string, unknown> {
      if (!item || typeof item !== "object") return {};
      const copy = { ...(item as Record<string, unknown>) };
      delete copy.id;
      delete copy.createdAt;
      delete copy.updatedAt;
      delete copy.created_at;
      delete copy.updated_at;
      return copy;
    }

    for (const key of Object.keys((data as Record<string, unknown>) || {})) {
      try {
        const modelRaw = (db as unknown as Record<string, unknown>)[key];
        const model = modelRaw as ModelClient | undefined;
        const raw = (data as Record<string, unknown>)[key];
        const itemsRaw = Array.isArray(raw)
          ? (raw as unknown[])
          : raw !== undefined && raw !== null
            ? [raw]
            : [];
        if (model && typeof model.createMany === "function") {
          const items = itemsRaw.map(it => sanitize(it));
          // Attempt to insert skipping duplicates where supported
          const res = await model.createMany({ data: items, skipDuplicates: true });
          summary[key] = { created: res?.count ?? null };
        } else if (model && typeof model.upsert === "function") {
          // Fallback for single objects: sanitize and upsert by id when possible
          const items = itemsRaw;
          let upserted = 0;
          for (const it of items) {
            const record = it as Record<string, unknown>;
            const sanitized = sanitize(record);
            if (record && typeof record.id === "string") {
              await model.upsert({
                where: { id: record.id as string },
                update: sanitized,
                create: sanitized
              });
              upserted++;
            } else {
              // no id: try create
              try {
                if (typeof model.create === "function") {
                  await model.create(sanitized);
                  upserted++;
                }
              } catch {
                // ignore individual create errors
              }
            }
          }
          summary[key] = { upserted };
        } else {
          summary[key] = { skipped: "no model or unsupported create" };
        }
      } catch (e) {
        summary[key] = { error: e instanceof Error ? e.message : String(e) };
      }
    }

    return NextResponse.json({ ok: true, summary });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
