import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login | Sekolix",
  description: "Login ke admin panel Sekolix"
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
