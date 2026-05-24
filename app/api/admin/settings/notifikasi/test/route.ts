import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { z } from "zod";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || (user.role !== "ADMIN" && user.role !== "EDITOR")) return null;
  return user;
}

const bodySchema = z.object({
  to: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const config = await prisma.emailNotificationConfig.findUnique({ where: { id: 1 } });
    if (!config || !config.is_enabled) {
      return NextResponse.json({ error: "Email notifications are disabled or not configured" }, { status: 400 });
    }

    if (!config.smtp_host || !config.smtp_user || !config.smtp_pass) {
      return NextResponse.json({ error: "SMTP configuration is incomplete" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: config.smtp_host,
      port: config.smtp_port ?? 587,
      secure: (config.smtp_port ?? 587) === 465,
      auth: {
        user: config.smtp_user,
        pass: config.smtp_pass,
      },
    });

    await transporter.sendMail({
      from: `"${config.from_name ?? "Sekolix"}" <${config.from_email ?? config.smtp_user}>`,
      to: parsed.data.to,
      subject: "Test Email dari Sekolix",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #1e3a5f;">Test Email Berhasil</h2>
          <p>Email ini dikirim sebagai konfirmasi bahwa konfigurasi SMTP Sekolix berfungsi dengan baik.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb;" />
          <p style="font-size: 12px; color: #6b7280;">Dikirim dari sistem Sekolix pada ${new Date().toLocaleString("id-ID")}</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "Email berhasil dikirim" });
  } catch (error: unknown) {
    console.error("Error sending test email:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Gagal mengirim email: ${message}` }, { status: 500 });
  }
}
