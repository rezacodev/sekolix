import prisma from "@/lib/db";

/**
 * Get active theme ID from database
 */
export async function getActiveThemeId(): Promise<string> {
  try {
    const activeTheme = await prisma.themeConfig.findFirst({
      where: { isActive: true },
      select: { themeId: true }
    });
    return activeTheme?.themeId || "academic-classic";
  } catch (error) {
    console.error("Error fetching active theme:", error);
    return "academic-classic";
  }
}

/**
 * Get theme-specific path
 */
export function getThemePath(path: string, themeId: string): string {
  // Remove leading slash if exists
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `/${themeId}/${cleanPath}`;
}
