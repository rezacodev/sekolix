import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    // Get all theme configs
    const themes = await db.themeConfig.findMany({
      orderBy: { createdAt: 'asc' }
    });

    // If no themes exist, create default ones
    if (themes.length === 0) {
      const defaultThemes = [
        {
          name: "Academic Classic",
          themeId: "academic-classic",
          isActive: true,
          primaryColor: "#1e3a8a",
          secondaryColor: "#FFFFFF",
          accentColor: "#d97706",
          textColor: "#1f2937",
          borderColor: "#e5e7eb",
          grayColor: "#6b7280",
          headingFont: "'Playfair Display', serif",
          bodyFont: "Inter, sans-serif",
          defaultPrimaryColor: "#1e3a8a",
          defaultSecondaryColor: "#FFFFFF",
          defaultAccentColor: "#d97706",
          defaultTextColor: "#1f2937",
          defaultBorderColor: "#e5e7eb",
          defaultGrayColor: "#6b7280",
          defaultHeadingFont: "'Playfair Display', serif",
          defaultBodyFont: "Inter, sans-serif",
        },
        {
          name: "Modern Vibrant",
          themeId: "modern-vibrant",
          isActive: false,
          primaryColor: "#06b6d4",
          secondaryColor: "#f97316",
          accentColor: "#a855f7",
          textColor: "#0f172a",
          borderColor: "#e2e8f0",
          grayColor: "#64748b",
          headingFont: "Poppins, sans-serif",
          bodyFont: "Poppins, sans-serif",
          defaultPrimaryColor: "#06b6d4",
          defaultSecondaryColor: "#f97316",
          defaultAccentColor: "#a855f7",
          defaultTextColor: "#0f172a",
          defaultBorderColor: "#e2e8f0",
          defaultGrayColor: "#64748b",
          defaultHeadingFont: "Poppins, sans-serif",
          defaultBodyFont: "Poppins, sans-serif",
        },
        {
          name: "Minimalist Clean",
          themeId: "minimalist-clean",
          isActive: false,
          primaryColor: "#171717",
          secondaryColor: "#FFFFFF",
          accentColor: "#3b82f6",
          textColor: "#171717",
          borderColor: "#e5e5e5",
          grayColor: "#525252",
          headingFont: "Inter, sans-serif",
          bodyFont: "Inter, sans-serif",
          defaultPrimaryColor: "#171717",
          defaultSecondaryColor: "#FFFFFF",
          defaultAccentColor: "#3b82f6",
          defaultTextColor: "#171717",
          defaultBorderColor: "#e5e5e5",
          defaultGrayColor: "#525252",
          defaultHeadingFont: "Inter, sans-serif",
          defaultBodyFont: "Inter, sans-serif",
        },
      ];

      for (const theme of defaultThemes) {
        await db.themeConfig.create({ data: theme });
      }

      // Fetch again after creation
      const newThemes = await db.themeConfig.findMany({
        orderBy: { createdAt: 'asc' }
      });
      return NextResponse.json(newThemes);
    }

    return NextResponse.json(themes);
  } catch (error) {
    console.error("[THEME_GET]", error);
    return NextResponse.json({ error: "Failed to fetch themes" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validate hex color format
    const hexColorRegex = /^#[0-9A-F]{6}$/i;
    if (
      body.primaryColor && !hexColorRegex.test(body.primaryColor) ||
      body.secondaryColor && !hexColorRegex.test(body.secondaryColor) ||
      body.accentColor && !hexColorRegex.test(body.accentColor) ||
      body.textColor && !hexColorRegex.test(body.textColor) ||
      body.borderColor && !hexColorRegex.test(body.borderColor) ||
      body.grayColor && !hexColorRegex.test(body.grayColor)
    ) {
      return NextResponse.json(
        { error: "Invalid color format. Use hex colors like #001f3f" },
        { status: 400 }
      );
    }

    // If switching theme (themeId provided)
    if (body.themeId) {
      // Get the theme data first to use its default colors
      const selectedTheme = await db.themeConfig.findUnique({
        where: { themeId: body.themeId }
      });

      if (!selectedTheme) {
        return NextResponse.json({ error: "Theme not found" }, { status: 404 });
      }

      // Set all themes to inactive
      await db.themeConfig.updateMany({
        data: { isActive: false }
      });

      // Set the selected theme as active with its default colors
      // Only override colors if explicitly provided in the request
      const updateData: Record<string, unknown> = { isActive: true };

      if (body.primaryColor !== undefined) updateData.primaryColor = body.primaryColor;
      if (body.secondaryColor !== undefined) updateData.secondaryColor = body.secondaryColor;
      if (body.accentColor !== undefined) updateData.accentColor = body.accentColor;
      if (body.textColor !== undefined) updateData.textColor = body.textColor;
      if (body.borderColor !== undefined) updateData.borderColor = body.borderColor;
      if (body.grayColor !== undefined) updateData.grayColor = body.grayColor;
      if (body.headingFont !== undefined) updateData.headingFont = body.headingFont;
      if (body.bodyFont !== undefined) updateData.bodyFont = body.bodyFont;
      if (body.logoUrl !== undefined) updateData.logoUrl = body.logoUrl;
      if (body.customLogoUrl !== undefined) updateData.customLogoUrl = body.customLogoUrl;

      const updatedTheme = await db.themeConfig.update({
        where: { themeId: body.themeId },
        data: updateData
      });

      return NextResponse.json(updatedTheme);
    }

    // If updating active theme configuration
    if (body.id) {
      const updatedTheme = await db.themeConfig.update({
        where: { id: body.id },
        data: {
          primaryColor: body.primaryColor,
          secondaryColor: body.secondaryColor,
          accentColor: body.accentColor,
          textColor: body.textColor,
          borderColor: body.borderColor,
          grayColor: body.grayColor,
          headingFont: body.headingFont,
          bodyFont: body.bodyFont,
          logoUrl: body.logoUrl,
          customLogoUrl: body.customLogoUrl,
        }
      });

      return NextResponse.json(updatedTheme);
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("[THEME_PUT]", error);
    return NextResponse.json({ error: "Failed to update theme" }, { status: 500 });
  }
}
