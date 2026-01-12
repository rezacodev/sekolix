import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { NewsForm } from "../../new/NewsForm";

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session) {
    redirect("/admin/login");
  }

  const news = await db.news.findUnique({
    where: { id }
  });

  if (!news) {
    redirect("/admin/landing-website/posts/news");
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit News</h1>
          <p className="text-muted-foreground">Update news details and content</p>
        </div>
        <NewsForm
          initialData={{
            ...news,
            excerpt: news.excerpt || "",
            category: news.category as
              | "School News"
              | "Achievement"
              | "Event Report"
              | "Announcement"
              | undefined
          }}
        />
      </div>
    </div>
  );
}
