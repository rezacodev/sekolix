"use client";

import { useEffect } from "react";
import { Prisma } from "@prisma/client";
import { useBreadcrumb } from "@/contexts/admin";
import SejarahEditor from "./editors/SejarahEditor";
import VisiMisiEditor from "./editors/VisiMisiEditor";
import StrukturEditor from "./editors/StrukturEditor";
import FasilitasEditor from "./editors/FasilitasEditor";
import ProgramKeahlianEditor from "./editors/ProgramKeahlianEditor";

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  description: string | null;
  data: Prisma.JsonValue;
  isPublished: boolean;
  isVisible: boolean;
}

const editors: Record<string, React.ComponentType<{ pageId: string }>> = {
  sejarah: SejarahEditor,
  "visi-misi": VisiMisiEditor,
  struktur: StrukturEditor,
  fasilitas: FasilitasEditor,
  "program-keahlian": ProgramKeahlianEditor
};

export function ProfilePageEditorClient({ page }: { page: Page }) {
  const breadcrumb = useBreadcrumb();
  const setBreadcrumbs = breadcrumb?.setBreadcrumbs;

  useEffect(() => {
    if (setBreadcrumbs) {
      setBreadcrumbs([
        { label: "Halaman Profil", href: "/admin/landing-website/pages" },
        { label: page.title }
      ]);
    }
  }, [setBreadcrumbs, page.title]);

  const Editor = editors[page.slug];

  if (!Editor) {
    return <div className="text-center py-12">Editor tidak ditemukan</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Editor pageId={page.id} />
    </div>
  );
}
