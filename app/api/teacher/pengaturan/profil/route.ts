import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/storage/cloudinary";

// GET — fetch profil guru yang sedang login
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.staffId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const staff = await prisma.staff.findUnique({
      where: { id: session.user.staffId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        province: true,
        photo: true,
        bio: true,
        position: true,
        gtkPosition: true,
        jenisPTK: true,
        jabatanPTK: true,
        nip: true,
        niy: true,
        nuptk: true,
        placeOfBirth: true,
        dateOfBirth: true,
        gender: true,
        religion: true,
        maritalStatus: true,
        academicDegree: true,
        educationHistory: true,
        educatorCertification: true,
      },
    });

    if (!staff) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    return NextResponse.json({ staff });
  } catch (error) {
    console.error("Error fetching teacher profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT — update profil guru (termasuk upload foto opsional)
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.staffId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const staffId = session.user.staffId;
    const formData = await request.formData();

    const name = formData.get("name") as string | null;
    const phone = formData.get("phone") as string | null;
    const address = formData.get("address") as string | null;
    const city = formData.get("city") as string | null;
    const province = formData.get("province") as string | null;
    const bio = formData.get("bio") as string | null;
    const photoFile = formData.get("photo") as File | null;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Nama tidak boleh kosong" }, { status: 400 });
    }

    let photoUrl: string | undefined;

    if (photoFile && photoFile.size > 0) {
      if (photoFile.size > 2 * 1024 * 1024) {
        return NextResponse.json({ error: "Ukuran foto maksimal 2MB" }, { status: 400 });
      }
      if (!photoFile.type.startsWith("image/")) {
        return NextResponse.json({ error: "File harus berupa gambar" }, { status: 400 });
      }

      const buffer = Buffer.from(await photoFile.arrayBuffer());
      const dataURI = `data:${photoFile.type};base64,${buffer.toString("base64")}`;
      const uploadResult = await cloudinary.uploader.upload(dataURI, {
        folder: "sekolix/teacher-photos",
        transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
      });
      photoUrl = uploadResult.secure_url;
    }

    const updated = await prisma.staff.update({
      where: { id: staffId },
      data: {
        name: name.trim(),
        phone: phone ?? undefined,
        address: address ?? undefined,
        city: city ?? undefined,
        province: province ?? undefined,
        bio: bio ?? undefined,
        ...(photoUrl ? { photo: photoUrl } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        province: true,
        photo: true,
        bio: true,
      },
    });

    return NextResponse.json({ staff: updated });
  } catch (error) {
    console.error("Error updating teacher profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
