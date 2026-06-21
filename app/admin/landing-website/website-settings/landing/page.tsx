import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LandingSectionsEditor } from "@/components/admin/LandingSectionsEditor";
import { db } from "@/lib/db";

export const metadata = {
  title: "Bagian Landing - Admin"
};

export default async function LandingSectionsSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const sections = await db.landingSection.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }]
  });

  const sectionPayload = sections.map(section => ({
    id: section.id,
    slug: section.slug,
    type: section.type,
    title: section.title,
    subtitle: section.subtitle,
    body: section.body,
    image: section.image,
    order: section.order,
    isActive: section.isActive,
    metadata: section.metadata
  }));

  return (
    <div>
      <LandingSectionsEditor sections={sectionPayload} />
    </div>
  );
}
