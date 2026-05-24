import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface QuickActionButtonProps {
  label: string;
  icon: LucideIcon;
  href: string;
  colorClass: string;
}

export default function QuickActionButton({ label, icon: Icon, href, colorClass }: QuickActionButtonProps) {
  return (
    <Link href={href}>
      <Button variant="outline" className={`w-full justify-start gap-2 ${colorClass} hover:bg-opacity-10`}>
        <Icon className="h-4 w-4" />
        {label}
      </Button>
    </Link>
  );
}
