import { db } from "@/lib/db";
import { RegistrationCodeSettingsClient } from "./RegistrationCodeSettingsClient";

export const revalidate = 0;

export const metadata = {
  title: "Kode Registrasi - Pengaturan Penerimaan - Admin"
};

export default async function RegistrationCodeSettingsPage() {
  const years = await db.tahunAjaran.findMany({
    orderBy: { createdAt: "desc" }
  });

  return <RegistrationCodeSettingsClient initialYears={years} />;
}
