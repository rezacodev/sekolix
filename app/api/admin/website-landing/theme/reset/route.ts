import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { themeId } = body;

    if (!themeId) {
      return NextResponse.json({ error: "Theme ID is required" }, { status: 400 });
    }

    // Get the theme to reset
    const theme = await db.themeConfig.findUnique({
      where: { themeId }
    });

    if (!theme) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 });
    }

    // Reset to default colors
    const resetTheme = await db.themeConfig.update({
      where: { themeId },
      data: {
        primaryColor: theme.defaultPrimaryColor,
        secondaryColor: theme.defaultSecondaryColor,
        accentColor: theme.defaultAccentColor,
        textColor: theme.defaultTextColor,
        borderColor: theme.defaultBorderColor,
        grayColor: theme.defaultGrayColor,
        headingFont: theme.defaultHeadingFont,
        bodyFont: theme.defaultBodyFont,
      }
    });

    return NextResponse.json({
      message: "Theme reset to default colors",
      theme: resetTheme
    });
  } catch (error) {
    console.error("[THEME_RESET]", error);
    return NextResponse.json({ error: "Failed to reset theme" }, { status: 500 });
  }
}
