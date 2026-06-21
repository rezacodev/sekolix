import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || (user.role !== "ADMIN" && user.role !== "EDITOR")) return null;
  return user;
}

export async function GET() {
  try {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const identity = await prisma.schoolIdentity.findFirst({
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ data: identity ?? null });
  } catch (error) {
    console.error("Error fetching school identity:", error);
    return NextResponse.json({ error: "Failed to fetch school identity" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    const {
      id,
      name,
      shortName,
      schoolLevel,
      npsn,
      address,
      postalCode,
      phone,
      email,
      website,
      logoUrl,
      logoDarkUrl,
      faviconUrl,
      coverImageUrl,
      headmaster,
      headmasterNIP,
      accreditation,
      establishedYear,
      timezone,
      language,
      socialLinks,
    } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ error: "Nama sekolah tidak boleh kosong" }, { status: 400 });
    }

    const payload = {
      name: name.trim(),
      shortName: shortName ?? null,
      schoolLevel: schoolLevel ?? undefined,
      npsn: npsn ?? null,
      address: address ?? null,
      postalCode: postalCode ?? null,
      phone: phone ?? null,
      email: email ?? null,
      website: website ?? null,
      logoUrl: logoUrl ?? null,
      logoDarkUrl: logoDarkUrl ?? null,
      faviconUrl: faviconUrl ?? null,
      coverImageUrl: coverImageUrl ?? null,
      headmaster: headmaster ?? null,
      headmasterNIP: headmasterNIP ?? null,
      accreditation: accreditation ?? null,
      establishedYear: establishedYear ? Number(establishedYear) : null,
      timezone: timezone ?? "Asia/Jakarta",
      language: language ?? "id",
      socialLinks: socialLinks ?? null,
    };

    let result;
    if (id) {
      result = await prisma.schoolIdentity.update({
        where: { id },
        data: payload,
      });
    } else {
      // Check if a record exists already (upsert by first record)
      const existing = await prisma.schoolIdentity.findFirst({ orderBy: { createdAt: "asc" } });
      if (existing) {
        result = await prisma.schoolIdentity.update({
          where: { id: existing.id },
          data: payload,
        });
      } else {
        result = await prisma.schoolIdentity.create({ data: payload });
      }
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Error saving school identity:", error);
    return NextResponse.json({ error: "Failed to save school identity" }, { status: 500 });
  }
}
