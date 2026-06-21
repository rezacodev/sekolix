import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import GtkForm from "../GtkForm";
export default async function NewGtkPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tambah GTK</h1>
          <p className="text-muted-foreground">Formulir pendaftaran GTK baru.</p>
        </div>
        <GtkForm />
      </div>
    </div>
  );
}
