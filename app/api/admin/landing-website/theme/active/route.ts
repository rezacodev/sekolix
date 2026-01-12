import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const activeTheme = await db.themeConfig.findFirst({
      where: {
        isActive: true
      },
      select: {
        themeId: true
      }
    });

    if (!activeTheme) {
      return NextResponse.json({ theme: "academic-classic" });
    }

    return NextResponse.json({ theme: activeTheme.themeId });
  } catch (error) {
    console.error("Error fetching active theme:", error);
    return NextResponse.json({ error: "Failed to fetch active theme" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { theme } = await request.json();

    if (!theme) {
      return NextResponse.json({ error: "Theme is required" }, { status: 400 });
    }

    // Deactivate all themes
    await db.themeConfig.updateMany({
      data: {
        isActive: false
      }
    });

    // Activate the selected theme
    await db.themeConfig.updateMany({
      where: {
        themeId: theme
      },
      data: {
        isActive: true
      }
    });

    return NextResponse.json({ success: true, theme });
  } catch (error) {
    console.error("Error updating active theme:", error);
    return NextResponse.json({ error: "Failed to update active theme" }, { status: 500 });
  }
}
