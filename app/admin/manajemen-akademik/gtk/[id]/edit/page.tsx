import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import GtkForm from "../../GtkForm";

export default async function EditGtkPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session) redirect("/login");

  const staff = await db.staff.findUnique({ where: { id } });
  if (!staff) redirect("/admin/manajemen-akademik/gtk");
  // Normalize values to match GtkForm's expected types
  const initialData = {
    id: staff.id,
    name: staff.name ?? "",
    nip: staff.nip ?? undefined,
    niy: staff.niy ?? undefined,
    nuptk: staff.nuptk ?? undefined,
    nik: staff.nik ?? undefined,
    statusKepegawaian: staff.statusKepegawaian ?? undefined,
    nrg: staff.nrg ?? undefined,
    masaKerja: staff.masaKerja ?? undefined,
    mkg: staff.mkg ?? undefined,
    position: staff.position ?? undefined,
    department: staff.department ?? undefined,
    email: staff.email ?? undefined,
    phone: staff.phone ?? undefined,
    placeOfBirth: staff.placeOfBirth ?? undefined,
    // convert Date to ISO string
    dateOfBirth: staff.dateOfBirth ? staff.dateOfBirth.toISOString() : undefined,
    gender: staff.gender ?? undefined,
    religion: staff.religion ?? undefined,
    maritalStatus: staff.maritalStatus ?? undefined,
    address:
      typeof staff.address === "string"
        ? staff.address
        : staff.address
          ? JSON.stringify(staff.address)
          : undefined,
    // subjects may be JSON in DB — convert to string
    subjects:
      typeof staff.subjects === "string"
        ? staff.subjects
        : staff.subjects
          ? JSON.stringify(staff.subjects)
          : undefined,
    workloadHours: staff.workloadHours ?? undefined,
    gtkPosition: staff.gtkPosition ?? undefined,
    trainingHistory:
      typeof staff.trainingHistory === "string"
        ? staff.trainingHistory
        : staff.trainingHistory
          ? JSON.stringify(staff.trainingHistory)
          : undefined,
    familyInfo:
      typeof staff.familyInfo === "string"
        ? staff.familyInfo
        : staff.familyInfo
          ? JSON.stringify(staff.familyInfo)
          : undefined,
    jenisPTK: staff.jenisPTK ?? undefined,
    jabatanPTK: staff.jabatanPTK ?? undefined
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit GTK</h1>
          <p className="text-muted-foreground">Perbarui data Guru/Tenaga Kependidikan.</p>
        </div>
        <GtkForm initialData={initialData} />
      </div>
    </div>
  );
}
