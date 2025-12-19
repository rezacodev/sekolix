import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@/types";
import db from "@/lib/db";

const applicantUpdateSchema = z
  .object({
    status: z.enum(["pending", "review", "accepted", "rejected"]).optional(),
    notes: z.string().max(1000).nullable().optional(),
    handledBy: z.string().max(100).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, "Minimal satu field harus diubah");

const allowedRoles: UserRole[] = ["ADMIN", "EDITOR"];

type ApplicantRouteContext =
  | { params: { id: string } }
  | { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: ApplicantRouteContext) {
  try {
    const resolvedParams = await (context.params as { id: string } | Promise<{ id: string }>);
    const { id } = resolvedParams;
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role as UserRole | undefined;
    if (!session || !userRole || !allowedRoles.includes(userRole)) {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    const payload = applicantUpdateSchema.parse(await request.json());

    const applicant = await db.applicant.findUnique({
      where: { id },
    });

    if (!applicant) {
      return NextResponse.json({ message: "Calon tidak ditemukan" }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};
    if (payload.status !== undefined) updates.status = payload.status;
    if (Object.prototype.hasOwnProperty.call(payload, "notes")) updates.notes = payload.notes ?? null;
    if (Object.prototype.hasOwnProperty.call(payload, "handledBy")) updates.handledBy = payload.handledBy ?? null;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: "Tidak ada perubahan" }, { status: 400 });
    }

    const updatedApplicant = await db.applicant.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({ status: "ok", applicant: updatedApplicant });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues.map((err) => err.message).join("; ") },
        { status: 400 }
      );
    }

    console.error("Applicant update error", error);
    return NextResponse.json({ message: "Tidak dapat menyimpan perubahan" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: ApplicantRouteContext) {
  try {
    const resolvedParams = await (context.params as { id: string } | Promise<{ id: string }>);
    const { id } = resolvedParams;
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role as UserRole | undefined;

    if (!session || !userRole || !allowedRoles.includes(userRole)) {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    const applicant = await db.applicant.findUnique({
      where: { id },
    });

    if (!applicant) {
      return NextResponse.json({ message: "Calon tidak ditemukan" }, { status: 404 });
    }

    // Only allow deletion if status is pending
    if (applicant.status !== "pending") {
      return NextResponse.json(
        { message: "Hanya calon dengan status pending yang dapat dihapus" },
        { status: 400 }
      );
    }

    await db.applicant.delete({
      where: { id },
    });

    return NextResponse.json({ status: "ok", message: "Calon berhasil dihapus" });
  } catch (error) {
    console.error("Applicant delete error", error);
    return NextResponse.json({ message: "Tidak dapat menghapus calon" }, { status: 500 });
  }
}

