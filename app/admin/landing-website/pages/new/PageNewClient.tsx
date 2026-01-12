"use client";

import { useBreadcrumb } from "@/contexts/admin";
import { useEffect } from "react";
import { PageForm } from "./PageForm";

export function PageNewClient() {
  const breadcrumb = useBreadcrumb();
  const setBreadcrumbs = breadcrumb?.setBreadcrumbs;

  useEffect(() => {
    if (setBreadcrumbs) {
      setBreadcrumbs([
        { label: "Pages", href: "/admin/landing-website/pages" },
        { label: "Create New" }
      ]);
    }
  }, [setBreadcrumbs]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Page</h1>
          <p className="text-muted-foreground">Add a new static page to your website</p>
        </div>
        <PageForm />
      </div>
    </div>
  );
}
