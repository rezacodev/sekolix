import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";
    let payload: unknown = null;
    if (contentType.startsWith("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file") as File | null;
      if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
      const text = await file.text();
      try {
        payload = JSON.parse(text);
      } catch {
        payload = text;
      }
    } else {
      payload = await request.json();
    }

    type ImportItem = {
      name?: string;
      nip?: string;
      niy?: string;
      nuptk?: string;
      nik?: string;
      email?: string;
      phone?: string;
      photo?: string | null;
      position?: string | null;
      department?: string | null;
    };

    const items: ImportItem[] = Array.isArray(payload)
      ? (payload as ImportItem[])
      : ((payload as unknown as { data?: ImportItem[] }).data ?? []);

    const toCreate: Prisma.StaffCreateManyInput[] = items.map(it => {
      const raw = it as unknown as Record<string, unknown>;
      const rawRole = raw.role ? String(raw.role) : undefined;
      const role = rawRole === "STAFF" ? "STAFF" : "TEACHER";
      return {
        name: it.name || "",
        role: role,
        nip: it.nip || undefined,
        niy: it.niy || undefined,
        nuptk: it.nuptk || undefined,
        nik: it.nik || undefined,
        email: it.email || undefined,
        phone: it.phone || undefined,
        photo: it.photo || undefined,
        position: it.position || undefined,
        department: it.department || undefined
      };
    });

    if (toCreate.length === 0) return NextResponse.json({ ok: true, created: 0 });

    try {
      const res = await prisma.staff.createMany({ data: toCreate, skipDuplicates: true });
      return NextResponse.json({ ok: true, created: res.count });
    } catch {
      let created = 0;
      for (const t of toCreate) {
        try {
          await prisma.staff.upsert({
            where: { nip: t.nip ?? "" },
            update: t as Prisma.StaffUpdateInput,
            create: t as Prisma.StaffCreateInput
          });
          created++;
        } catch {
          // ignore
        }
      }
      return NextResponse.json({ ok: true, created });
    }
  } catch (error) {
    console.error("Error importing gtk:", error);
    return NextResponse.json({ error: "Failed to import" }, { status: 500 });
  }
}
