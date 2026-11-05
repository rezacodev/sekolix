import { NextResponse } from "next/server";
import { requireParentContext, parentUnauthorized } from "@/lib/parent/server";
import { db } from "@/lib/db";

export async function GET() {
  const context = await requireParentContext();
  if (!context) return parentUnauthorized();

  const news = await db.news.findMany({
    where: { isPublished: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 10,
  });

  return NextResponse.json({
    announcements: news.map((item) => ({
      id: item.id,
      title: item.title,
      excerpt: item.excerpt,
      category: item.category,
      publishedAt: item.publishedAt?.toISOString() ?? item.createdAt.toISOString(),
      href: `/informasi/${item.slug}`,
    })),
  });
}
