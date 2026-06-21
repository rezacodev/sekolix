import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ArticleForm } from "../../new/ArticleForm";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session) {
    redirect("/login");
  }

  const article = await db.article.findUnique({
    where: { id }
  });

  if (!article) {
    redirect("/admin/landing-website/posts/articles");
  }

  const allowedCategories = ["Academic", "Achievement", "Announcement", "Other"] as const;
  const rawCategory = article.category as unknown;
  const category =
    typeof rawCategory === "string" &&
    (allowedCategories as readonly string[]).includes(rawCategory)
      ? (rawCategory as "Academic" | "Achievement" | "Announcement" | "Other")
      : "Academic";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Article</h1>
          <p className="text-muted-foreground">Update article details and content</p>
        </div>
        <ArticleForm
          initialData={{
            id: article.id,
            title: article.title,
            slug: article.slug,
            excerpt: article.excerpt ?? "",
            content: article.content,
            category: category,
            isPublished: article.isPublished
          }}
        />
      </div>
    </div>
  );
}
