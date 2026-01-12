import { db } from "@/lib/db";
import { ProgramsSettingsClient } from "./ProgramsSettingsClient";

export const revalidate = 0;

export const metadata = {
  title: "Program - Pengaturan Penerimaan - Admin"
};

export default async function AdmissionsProgramPage() {
  const programs = await db.program.findMany({
    orderBy: { name: "asc" }
  });

  return <ProgramsSettingsClient initialPrograms={programs} />;
}
