import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicantId, ...profileData } = body as {
      applicantId: string;
      [key: string]: unknown;
    };

    if (!applicantId) {
      return NextResponse.json(
        { message: "Applicant ID is required" },
        { status: 400 }
      );
    }

    // Verify applicant exists
    const applicant = await db.applicant.findUnique({
      where: { id: applicantId },
    });

    if (!applicant) {
      return NextResponse.json(
        { message: "Peserta didik tidak ditemukan" },
        { status: 404 }
      );
    }

    // Prepare update data - only update fields that have values
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    // Only add fields that are provided and not empty
    if (profileData.fullName) updateData.fullName = String(profileData.fullName);
    if (profileData.gender) updateData.gender = String(profileData.gender);
    if (profileData.nisn) updateData.nisn = String(profileData.nisn);
    if (profileData.nik) updateData.nik = String(profileData.nik);
    if (profileData.noKK) updateData.noKK = String(profileData.noKK);
    if (profileData.placeOfBirth) updateData.placeOfBirth = String(profileData.placeOfBirth);
    if (profileData.dateOfBirth) updateData.dateOfBirth = new Date(String(profileData.dateOfBirth));
    if (profileData.nationality) updateData.nationality = String(profileData.nationality);
    if (profileData.religion) updateData.religion = String(profileData.religion);
    if (profileData.motherTongue) updateData.motherTongue = String(profileData.motherTongue);
    if (profileData.address) updateData.address = String(profileData.address);
    if (profileData.village) updateData.village = String(profileData.village);
    if (profileData.district) updateData.district = String(profileData.district);
    if (profileData.city) updateData.city = String(profileData.city);
    if (profileData.province) updateData.province = String(profileData.province);
    if (profileData.postalCode) updateData.postalCode = String(profileData.postalCode);
    if (profileData.fatherName) updateData.fatherName = String(profileData.fatherName);
    if (profileData.fatherNik) updateData.fatherNik = String(profileData.fatherNik);
    if (profileData.fatherBirthYear) updateData.fatherBirthYear = parseInt(String(profileData.fatherBirthYear));
    if (profileData.fatherEducation) updateData.fatherEducation = String(profileData.fatherEducation);
    if (profileData.fatherOccupation) updateData.fatherOccupation = String(profileData.fatherOccupation);
    if (profileData.fatherIncome) updateData.fatherIncome = String(profileData.fatherIncome);
    if (profileData.motherName) updateData.motherName = String(profileData.motherName);
    if (profileData.motherNik) updateData.motherNik = String(profileData.motherNik);
    if (profileData.motherBirthYear) updateData.motherBirthYear = parseInt(String(profileData.motherBirthYear));
    if (profileData.motherEducation) updateData.motherEducation = String(profileData.motherEducation);
    if (profileData.motherOccupation) updateData.motherOccupation = String(profileData.motherOccupation);
    if (profileData.motherIncome) updateData.motherIncome = String(profileData.motherIncome);
    if (profileData.guardianName) updateData.guardianName = String(profileData.guardianName);
    if (profileData.guardianNik) updateData.guardianNik = String(profileData.guardianNik);
    if (profileData.guardianBirthYear) updateData.guardianBirthYear = parseInt(String(profileData.guardianBirthYear));
    if (profileData.guardianEducation) updateData.guardianEducation = String(profileData.guardianEducation);
    if (profileData.guardianOccupation) updateData.guardianOccupation = String(profileData.guardianOccupation);
    if (profileData.guardianIncome) updateData.guardianIncome = String(profileData.guardianIncome);
    if (profileData.phone) updateData.phone = String(profileData.phone);
    if (profileData.mobile) updateData.mobile = String(profileData.mobile);
    if (profileData.email) updateData.email = String(profileData.email);
    if (profileData.livesWith) updateData.livesWith = String(profileData.livesWith);
    if (profileData.weight) updateData.weight = parseFloat(String(profileData.weight));
    if (profileData.height) updateData.height = parseFloat(String(profileData.height));
    if (profileData.distanceToSchool) updateData.distanceToSchool = parseFloat(String(profileData.distanceToSchool));
    if (profileData.transportationMode) updateData.transportationMode = String(profileData.transportationMode);
    if (profileData.anak_ke) updateData.anakKe = parseInt(String(profileData.anak_ke));
    if (profileData.jumlahSaudara) updateData.jumlahSaudara = parseInt(String(profileData.jumlahSaudara));
    if (profileData.achievements) updateData.achievements = String(profileData.achievements);

    // Mark as profile completed only if all required fields are filled
    const isComplete = 
      profileData.fullName && 
      profileData.gender && 
      profileData.nik && 
      profileData.placeOfBirth && 
      profileData.dateOfBirth && 
      profileData.religion && 
      profileData.address &&
      profileData.mobile &&
      profileData.email;
    
    if (isComplete) {
      updateData.profileCompleted = true;
    }

    // Update applicant with profile data
    const updated = await db.applicant.update({
      where: { id: applicantId },
      data: updateData,
    });

    return NextResponse.json(
      {
        message: isComplete ? "Data profil berhasil disimpan dan selesai." : "Progress pengisian data berhasil disimpan.",
        applicant: {
          id: updated.id,
          fullName: updated.fullName || "",
          profileCompleted: (updated as Record<string, unknown>).profileCompleted || false,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[SPMB_PROFILE_ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat menyimpan data" },
      { status: 500 }
    );
  }
}
