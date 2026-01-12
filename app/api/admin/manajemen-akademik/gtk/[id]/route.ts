import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
    }
    const session = await getServerSession(authOptions);
    if (
      !session ||
      !session.user ||
      (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    type UpdateGtkPayload = Partial<Prisma.StaffUpdateInput> & { id?: string };

    const data = (await request.json()) as UpdateGtkPayload;

    const parseNumberOrNull = (
      v: string | number | null | undefined | Prisma.NullableIntFieldUpdateOperationsInput
    ): number | Prisma.NullableIntFieldUpdateOperationsInput | undefined => {
      if (v === null || v === undefined || v === "") return undefined;
      if (typeof v === "object") return v as Prisma.NullableIntFieldUpdateOperationsInput;
      const n = Number(v as string | number);
      return Number.isNaN(n) ? undefined : n;
    };

    const parsedDate = data.dateOfBirth ? new Date(String(data.dateOfBirth)) : undefined;
    if (parsedDate && Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: "Invalid dateOfBirth" }, { status: 400 });
    }

    const updateData: Prisma.StaffUpdateInput = {
      name: data.name ?? undefined,
      role: data.role ?? undefined,
      nip: data.nip ?? undefined,
      niy: data.niy ?? undefined,
      nuptk: data.nuptk ?? undefined,
      nik: data.nik ?? undefined,
      email: data.email ?? undefined,
      phone: data.phone ?? undefined,
      photo: data.photo ?? undefined,
      position: data.position ?? undefined,
      department: data.department ?? undefined,
      statusKepegawaian: data.statusKepegawaian ?? undefined,
      nrg: data.nrg ?? undefined,
      masaKerja: parseNumberOrNull(data.masaKerja) ?? undefined,
      mkg: parseNumberOrNull(data.mkg) ?? undefined,
      placeOfBirth: data.placeOfBirth ?? undefined,
      dateOfBirth: parsedDate ?? undefined,
      gender: data.gender ?? undefined,
      religion: data.religion ?? undefined,
      maritalStatus: data.maritalStatus ?? undefined,
      address: data.address ?? undefined,
      educationHistory: data.educationHistory ?? undefined,
      academicDegree: data.academicDegree ?? undefined,
      trainingHistory: data.trainingHistory ?? undefined,
      subjects: data.subjects ?? undefined,
      workloadHours: parseNumberOrNull(data.workloadHours) ?? undefined,
      extraDuties: data.extraDuties ?? undefined,
      gtkPosition: data.gtkPosition ?? undefined,
      professionalAllowanceStatus: data.professionalAllowanceStatus ?? undefined,
      familyInfo: data.familyInfo ?? undefined,
      bio: data.bio ?? undefined,
      jenisPTK: data.jenisPTK ?? undefined,
      jabatanPTK: data.jabatanPTK ?? undefined
    };
    const updated = await prisma.staff.update({ where: { id }, data: updateData });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating gtk:", error);
    return NextResponse.json({ error: "Failed to update gtk" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const { id } = params;
    const session = await getServerSession(authOptions);
    if (
      !session ||
      !session.user ||
      (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.staff.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting gtk:", error);
    return NextResponse.json({ error: "Failed to delete gtk" }, { status: 500 });
  }
}
