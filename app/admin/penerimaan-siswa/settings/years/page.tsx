import { db } from "@/lib/db";
import { YearsSettingsClient as YearsSettingsClient } from "./YearsSettingsClient";

export const revalidate = 0;

export const metadata = {
  title: "Tahun Ajaran - Pengaturan Penerimaan - Admin"
};

export default async function AcademicYearsPage() {
  const years = await db.tahunAjaran.findMany({
    orderBy: { startDate: "desc" }
  });

  const initialYears = years.map(y => ({
    id: y.id,
    name: y.label,
    start: y.startDate ? y.startDate.toISOString().split("T")[0] : "",
    end: y.endDate ? y.endDate.toISOString().split("T")[0] : "",
    isActive: y.isActive,
    registrationFee: typeof y.registrationFee === "number" ? y.registrationFee : 0
  }));

  return <YearsSettingsClient initialYears={initialYears} />;
}
