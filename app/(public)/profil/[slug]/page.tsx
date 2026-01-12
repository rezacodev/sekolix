import { notFound } from "next/navigation";

// This route is not used - profil pages are accessed via /profil/sejarah, /profil/visi-misi, etc
// which are served by Next.js static routing via the theme-specific folders
export default function NotFoundPage() {
  notFound();
}
