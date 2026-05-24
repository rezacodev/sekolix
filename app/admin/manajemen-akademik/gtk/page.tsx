"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { Upload } from "lucide-react";
import GtkActions from "./DataGuruActions";

export default function Page() {
  const router = useRouter();

  return (
    <div className="p-6">
      <PageHeader title="Data GTK" description="Kelola data Guru & Tenaga Kependidikan.">
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/manajemen-akademik/gtk/import">
              <Upload className="mr-2 h-4 w-4" />
              Import Data
            </Link>
          </Button>
          <Button onClick={() => router.push("/admin/manajemen-akademik/gtk/new")}>Tambah</Button>
        </div>
      </PageHeader>

      <div className="mt-6">
        <GtkActions />
      </div>
    </div>
  );
}
