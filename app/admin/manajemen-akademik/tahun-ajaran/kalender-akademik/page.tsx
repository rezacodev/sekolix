import { db } from "@/lib/db";
import KalenderClient from "./KalenderClient";

export const revalidate = 0;

export default async function KalenderAkademikPage() {
  const years = await db.tahunAjaran.findMany({ orderBy: { startDate: "desc" } });

  const initialYears = years.map((y) => ({ id: y.id, name: y.label, start: y.startDate ? y.startDate.toISOString().split("T")[0] : undefined, end: y.endDate ? y.endDate.toISOString().split("T")[0] : undefined }));

  return (
    <div>
      <div className="mb-12">
        {/* Client component handles events and calendar view */}
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore */}
        <KalenderClient initialYears={initialYears} />
      </div>
    </div>
  );
}
