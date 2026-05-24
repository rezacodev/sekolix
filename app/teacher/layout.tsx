import type { Metadata } from "next";
import { TeacherLayoutClient } from "./TeacherLayoutClient";
import { BreadcrumbProvider } from "./BreadcrumbContext";

export const metadata: Metadata = {
  title: "Portal Guru | Sekolix",
  description: "Portal guru untuk mengelola pembelajaran, nilai, dan kelas"
};

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <BreadcrumbProvider>
      <TeacherLayoutClient>{children}</TeacherLayoutClient>
    </BreadcrumbProvider>
  );
}
