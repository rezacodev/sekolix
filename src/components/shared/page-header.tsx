"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  backHref,
  backLabel = "Kembali",
  children
}: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground mt-2">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {backHref && (
          <Link href={backHref}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {backLabel}
            </Button>
          </Link>
        )}
        {children}
      </div>
    </div>
  );
}
