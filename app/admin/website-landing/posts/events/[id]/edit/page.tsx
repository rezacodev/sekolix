import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { EventForm } from "../../new/EventForm";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session) {
    redirect("/admin/login");
  }

  const event = await db.event.findUnique({
    where: { id },
  });

  if (!event) {
    redirect("/admin/website-landing/posts/events");
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Event</h1>
          <p className="text-muted-foreground">
            Update event details and information
          </p>
        </div>
        <EventForm
          initialData={{
            ...event,
            startDate: event.startDate.toISOString().slice(0, 16),
            endDate: event.endDate?.toISOString().slice(0, 16) || "",
            location: event.location || "",
          }}
        />
      </div>
    </div>
  );
}
