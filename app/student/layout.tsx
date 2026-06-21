import type { Metadata } from "next";
import { StudentLayoutClient } from "./StudentLayoutClient";

export const metadata: Metadata = {
  title: "Portal Siswa | Sekolix",
  description: "Portal siswa Sekolix - akses materi, tugas, ujian, dan nilai"
};

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <StudentLayoutClient>{children}</StudentLayoutClient>;
}
