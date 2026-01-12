import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { ArticleForm } from "./ArticleForm";

export default async function NewArticlePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Article</h1>
          <p className="text-muted-foreground">Add a new article to your website</p>
        </div>
        <ArticleForm />
      </div>
    </div>
  );
}
