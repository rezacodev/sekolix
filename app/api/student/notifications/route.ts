import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/student/notifications
 * Fetch pending notifications for the current user
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "MURID") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // TODO: Query database for user notifications
    // For now, return mock data

    const mockNotifications = [
      {
        id: "1",
        type: "info",
        title: "Tugas Baru",
        message: 'Tugas baru: "Essay: Dampak Globalisasi" di XI IPA 1',
        action: {
          label: "Lihat Tugas",
          href: "/student/kelas/kelas-1/tugas",
        },
        timestamp: new Date().toISOString(),
      },
      {
        id: "2",
        type: "success",
        title: "Nilai Keluar",
        message: 'Nilai untuk "Quiz Matematika" sudah diumumkan. Skor: 92/100',
        action: {
          label: "Lihat Nilai",
          href: "/student/nilai",
        },
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      data: mockNotifications,
    });
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/student/notifications
 * Create a new notification (for testing purposes)
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "MURID") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { event, data } = await req.json();

    // TODO: Save notification to database
    // For now, just validate and return success

    return NextResponse.json({
      success: true,
      message: "Notification created",
      event,
      data,
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}
