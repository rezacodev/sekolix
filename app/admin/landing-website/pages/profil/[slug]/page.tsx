import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProfilePageEditorClient } from "../ProfilePageEditorClient";

interface PageParams {
  params: Promise<{ slug: string }>;
}

export default async function ProfilePageEditor({ params }: PageParams) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { slug } = await params;

  const validSlugs = ["sejarah", "visi-misi", "struktur", "fasilitas", "program-keahlian"];

  if (!validSlugs.includes(slug)) {
    redirect("/admin/landing-website/pages");
  }

  let page;
  try {
    // Get page from database
    page = await db.page.findUnique({
      where: { slug }
    });
  } catch (error) {
    console.error("Error in ProfilePageEditor:", error);
    redirect("/admin/landing-website/pages");
  }

  if (!page) {
    redirect("/admin/landing-website/pages");
  }

  return <ProfilePageEditorClient page={page} />;
}
