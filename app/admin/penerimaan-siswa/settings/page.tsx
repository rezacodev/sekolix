import { db } from "@/lib/db";
import { LandingSettingsClient } from "./LandingSettingsClient";

export const revalidate = 0;

export const metadata = {
  title: "Pengaturan Penerimaan - Admin"
};

export default async function AdmissionLandingSettingsPage() {
  const landingSettings = await db.admissionLandingSetting.findFirst({
    orderBy: { updatedAt: "desc" }
  });

  return <LandingSettingsClient initialSettings={landingSettings} />;
}
