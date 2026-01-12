import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import type { Prisma, StaffRole } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const checkExisting = url.searchParams.get("checkExisting");
    if (checkExisting) {
      const nuptks = url.searchParams.get("nuptks")?.split(",") || [];
      const nikes = url.searchParams.get("nikes")?.split(",") || [];
      const nips = url.searchParams.get("nips")?.split(",") || [];
      const niys = url.searchParams.get("niys")?.split(",") || [];

      const existing: {
        nuptk?: string | null;
        nik?: string | null;
        nip?: string | null;
        niy?: string | null;
      }[] = [];

      if (nuptks.length > 0) {
        const found = await prisma.staff.findMany({
          where: { nuptk: { in: nuptks.filter(Boolean) } },
          select: { nuptk: true, nik: true, nip: true, niy: true }
        });
        existing.push(...found);
      }

      if (nikes.length > 0) {
        const found = await prisma.staff.findMany({
          where: { nik: { in: nikes.filter(Boolean) } },
          select: { nuptk: true, nik: true, nip: true, niy: true }
        });
        existing.push(...found);
      }

      if (nips.length > 0) {
        const found = await prisma.staff.findMany({
          where: { nip: { in: nips.filter(Boolean) } },
          select: { nuptk: true, nik: true, nip: true, niy: true }
        });
        existing.push(...found);
      }

      if (niys.length > 0) {
        const found = await prisma.staff.findMany({
          where: { niy: { in: niys.filter(Boolean) } },
          select: { nuptk: true, nik: true, nip: true, niy: true }
        });
        existing.push(...found);
      }

      // Remove duplicates
      const unique = existing.filter(
        (item, index, arr) =>
          arr.findIndex(
            i =>
              i.nuptk === item.nuptk &&
              i.nik === item.nik &&
              i.nip === item.nip &&
              i.niy === item.niy
          ) === index
      );

      return NextResponse.json(unique);
    }

    const page = url.searchParams.get("page");
    const pageSize = Number(url.searchParams.get("pageSize") || "10");
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("statusKepegawaian");
    const jenisPTK = url.searchParams.get("jenisPTK");

    const baseWhere: Prisma.StaffWhereInput = {
      deleted_at: null
    };
    if (search) {
      baseWhere.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { nip: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } }
      ];
    }

    if (status) {
      baseWhere.statusKepegawaian = status;
    }
    if (jenisPTK) {
      baseWhere.jenisPTK = jenisPTK;
    }

    if (page !== null) {
      const p = Number(page || 0);
      const skip = p * pageSize;
      const totalCount = await prisma.staff.count({ where: baseWhere });
      const items = await prisma.staff.findMany({
        where: baseWhere,
        orderBy: { name: "asc" },
        skip,
        take: pageSize
      });
      return NextResponse.json({ items, totalCount, page: p, pageSize });
    }

    const items = await prisma.staff.findMany({ where: baseWhere, orderBy: { name: "asc" } });
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching gtk:", error);
    return NextResponse.json({ error: "Failed to fetch gtk" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session ||
      !session.user ||
      (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    type CreateGtkPayload = Partial<Prisma.StaffCreateInput> & { role?: string | null };

    const data = (await request.json()) as CreateGtkPayload;

    const createData: Prisma.StaffCreateInput = {
      name: data.name || "",
      role: (data.role as unknown as StaffRole) || "TEACHER",
      nip: data.nip || undefined,
      niy: data.niy || undefined,
      nuptk: data.nuptk || undefined,
      nik: data.nik || undefined,
      email: data.email || undefined,
      phone: data.phone || undefined,
      photo: data.photo || undefined,
      position: data.position || undefined,
      department: data.department || undefined,
      statusKepegawaian: data.statusKepegawaian || undefined,
      nrg: data.nrg || undefined,
      masaKerja: (data.masaKerja as unknown as number) ?? undefined,
      mkg: (data.mkg as unknown as number) ?? undefined,
      placeOfBirth: data.placeOfBirth || undefined,
      dateOfBirth: data.dateOfBirth ? new Date(String(data.dateOfBirth)) : undefined,
      gender: data.gender || undefined,
      religion: data.religion || undefined,
      maritalStatus: data.maritalStatus || undefined,
      address: data.address || undefined,
      educationHistory: data.educationHistory || undefined,
      academicDegree: data.academicDegree || undefined,
      trainingHistory: data.trainingHistory || undefined,
      subjects: data.subjects || undefined,
      workloadHours: (data.workloadHours as unknown as number) ?? undefined,
      extraDuties: data.extraDuties || undefined,
      gtkPosition: data.gtkPosition || undefined,
      professionalAllowanceStatus: data.professionalAllowanceStatus || undefined,
      familyInfo: data.familyInfo || undefined,
      bio: data.bio || undefined,
      jenisPTK: data.jenisPTK || undefined,
      jabatanPTK: data.jabatanPTK || undefined
    };

    const gtk = await prisma.staff.create({ data: createData });
    return NextResponse.json(gtk, { status: 201 });
  } catch (error) {
    console.error("Error creating gtk:", error);
    return NextResponse.json({ error: "Failed to create gtk" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session ||
      !session.user ||
      (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID GTK diperlukan" }, { status: 400 });

    await prisma.staff.update({
      where: { id },
      data: { deleted_at: new Date() }
    });

    return NextResponse.json({ message: "GTK berhasil dihapus" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting gtk:", error);
    return NextResponse.json({ error: "Failed to delete gtk" }, { status: 500 });
  }
}
