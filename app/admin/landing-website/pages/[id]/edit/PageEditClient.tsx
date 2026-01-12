"use client";

import { useBreadcrumb } from "@/contexts/admin";
import { useEffect } from "react";
import { PageForm } from "../../new/PageForm";

type PageData = {
  id: string;
  title: string;
  slug: string;
  content: string;
  description: string | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export function PageEditClient({ page }: { page: PageData }) {
  const breadcrumb = useBreadcrumb();
  const setBreadcrumbs = breadcrumb?.setBreadcrumbs;

  useEffect(() => {
    if (setBreadcrumbs) {
      setBreadcrumbs([{ label: "Pages", href: "/admin/landing-website/pages" }, { label: "Edit" }]);
    }
  }, [setBreadcrumbs]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Page</h1>
          <p className="text-muted-foreground">Update page details and content</p>
        </div>
        <PageForm
          initialData={{
            ...page,
            description: page.description || undefined
          }}
        />
      </div>
    </div>
  );
}
