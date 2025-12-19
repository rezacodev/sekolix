import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const applicantId = url.searchParams.get("applicantId");

    if (!applicantId) {
      return NextResponse.json({ message: "applicantId is required" }, { status: 400 });
    }

    const applicant = await db.applicant.findUnique({
      where: { id: applicantId },
      select: {
        id: true,
        fullName: true,
        nik: true,
        phone: true,
        mobile: true,
        email: true,
        profileCompleted: true,

        // personal
        gender: true,
        nisn: true,
        noKK: true,
        placeOfBirth: true,
        dateOfBirth: true,
        nationality: true,
        religion: true,
        motherTongue: true,
        address: true,
        village: true,
        district: true,
        city: true,
        province: true,
        postalCode: true,

        // father
        fatherName: true,
        fatherNik: true,
        fatherBirthYear: true,
        fatherEducation: true,
        fatherOccupation: true,
        fatherIncome: true,

        // mother
        motherName: true,
        motherNik: true,
        motherBirthYear: true,
        motherEducation: true,
        motherOccupation: true,
        motherIncome: true,

        // guardian
        guardianName: true,
        guardianNik: true,
        guardianBirthYear: true,
        guardianEducation: true,
        guardianOccupation: true,
        guardianIncome: true,

        // contact / details
        livesWith: true,
        weight: true,
        height: true,
        distanceToSchool: true,
        transportationMode: true,
        anakKe: true,
        jumlahSaudara: true,

        // achievements
        achievements: true,
      },
    });

    if (!applicant) {
      return NextResponse.json({ message: "Applicant not found" }, { status: 404 });
    }

    return NextResponse.json({ status: "ok", applicant });
  } catch (error) {
    console.error("GET applicant error", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
