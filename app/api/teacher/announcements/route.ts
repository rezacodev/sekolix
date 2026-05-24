import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Implement when Announcement model is added to schema
    // For now, return mock data
    const mockAnnouncements = [
      {
        id: "1",
        title: "Rapat Guru Mendatang",
        message: "Rapat koordinasi guru akan dilaksanakan pada hari Jumat, 17 Januari 2026 pukul 14.00 WIB di ruang pertemuan.",
        priority: "high" as const,
        date: "15 Jan 2026",
        from: "Kepala Sekolah",
      },
      {
        id: "2",
        title: "Update Kurikulum Semester Genap",
        message: "Mohon perhatikan pembaruan kurikulum untuk semester genap yang telah diunggah di sistem.",
        priority: "normal" as const,
        date: "13 Jan 2026",
        from: "Wakil Kepala Kurikulum",
      },
      {
        id: "3",
        title: "Pengumpulan Nilai UAS",
        message: "Batas akhir pengumpulan nilai UAS adalah tanggal 20 Januari 2026. Mohon segera melengkapi data nilai siswa.",
        priority: "high" as const,
        date: "12 Jan 2026",
        from: "Bagian Akademik",
      },
    ];

    return NextResponse.json({
      success: true,
      data: mockAnnouncements,
    });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}
