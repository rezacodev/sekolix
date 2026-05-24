import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || (user.role !== "ADMIN" && user.role !== "EDITOR")) return null;
  return user;
}

const emailConfigSchema = z.object({
  is_enabled: z.boolean(),
  smtp_host: z.string().optional().nullable(),
  smtp_port: z.number().int().min(1).max(65535).optional().nullable(),
  smtp_user: z.string().optional().nullable(),
  smtp_pass: z.string().optional().nullable(),
  from_email: z.string().email().optional().nullable().or(z.literal("")),
  from_name: z.string().optional().nullable(),
});

const inAppSchema = z.object({
  new_applicant: z.boolean(),
  payment_received: z.boolean(),
  grade_submitted: z.boolean(),
  new_assignment: z.boolean(),
  attendance_summary: z.boolean(),
});

const bodySchema = z.object({
  email: emailConfigSchema.optional(),
  inApp: inAppSchema.optional(),
});

export async function GET() {
  try {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [emailConfig, inAppSetting] = await Promise.all([
      prisma.emailNotificationConfig.findUnique({ where: { id: 1 } }),
      prisma.inAppNotificationSetting.findUnique({ where: { id: 1 } }),
    ]);

    return NextResponse.json({
      email: emailConfig ?? {
        is_enabled: false,
        smtp_host: null,
        smtp_port: 587,
        smtp_user: null,
        smtp_pass: null,
        from_email: null,
        from_name: null,
      },
      inApp: inAppSetting ?? {
        new_applicant: true,
        payment_received: true,
        grade_submitted: false,
        new_assignment: false,
        attendance_summary: false,
      },
    });
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    return NextResponse.json({ error: "Failed to fetch notification settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 400 });
    }

    const { email, inApp } = parsed.data;

    if (email !== undefined) {
      await prisma.emailNotificationConfig.upsert({
        where: { id: 1 },
        update: {
          is_enabled: email.is_enabled,
          smtp_host: email.smtp_host ?? null,
          smtp_port: email.smtp_port ?? null,
          smtp_user: email.smtp_user ?? null,
          smtp_pass: email.smtp_pass ?? null,
          from_email: email.from_email || null,
          from_name: email.from_name ?? null,
        },
        create: {
          id: 1,
          is_enabled: email.is_enabled,
          smtp_host: email.smtp_host ?? null,
          smtp_port: email.smtp_port ?? null,
          smtp_user: email.smtp_user ?? null,
          smtp_pass: email.smtp_pass ?? null,
          from_email: email.from_email || null,
          from_name: email.from_name ?? null,
        },
      });
    }

    if (inApp !== undefined) {
      await prisma.inAppNotificationSetting.upsert({
        where: { id: 1 },
        update: inApp,
        create: { id: 1, ...inApp },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving notification settings:", error);
    return NextResponse.json({ error: "Failed to save notification settings" }, { status: 500 });
  }
}
