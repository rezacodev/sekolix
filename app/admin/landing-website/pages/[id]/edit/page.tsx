import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageEditClient } from "./PageEditClient";

export default async function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session) {
    redirect("/login");
  }

  const page = await db.page.findUnique({
    where: { id }
  });

  if (!page) {
    redirect("/admin/landing-website/pages");
  }

  return <PageEditClient page={page} />;
}
