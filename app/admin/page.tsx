import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardClient } from "./DashboardClient";

export const revalidate = 0;

async function getStats() {
  const [users, articles, news, events, galleries] = await Promise.all([
    db.user.count(),
    db.article.count({ where: { isPublished: true } }),
    db.news.count({ where: { isPublished: true } }),
    db.event.count({ where: { isPublished: true } }),
    db.gallery.count()
  ]);

  return {
    users,
    articles,
    news,
    events,
    galleries
  };
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  // Middleware already enforces admin-role access; session is guaranteed here
  if (!session?.user) redirect("/login");

  const stats = await getStats();

  return (
    <DashboardClient userName={session.user.name || session.user.email || "User"} stats={stats} />
  );
}
