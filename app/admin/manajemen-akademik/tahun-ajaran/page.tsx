import { db } from "@/lib/db";
import { YearsSettingsClient as YearsSettingsClient } from "../../penerimaan-siswa/settings/years/YearsSettingsClient";

export const revalidate = 0;

export const metadata = {
  title: "Tahun Ajaran & Semester - Manajemen Akademik - Admin",
};

export default async function TahunAjaranPage() {
  const years = await db.tahunAjaran.findMany({
    orderBy: { startDate: "desc" },
  });

  const initialYears = years.map((y) => ({
    id: y.id,
    name: y.label,
    start: y.startDate ? y.startDate.toISOString().split("T")[0] : "",
    end: y.endDate ? y.endDate.toISOString().split("T")[0] : "",
    isActive: y.isActive,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registrationFee: (y as any).registrationFee ?? 0,
  }));

  return <YearsSettingsClient initialYears={initialYears} showRegistrationFee={false} />;
}
