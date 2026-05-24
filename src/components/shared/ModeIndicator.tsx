"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { UserCog, GraduationCap } from "lucide-react";

export function ModeIndicator() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Only show for dual role users
  if (!session?.user?.isDualRole) {
    return null;
  }

  // Determine current mode based on pathname
  const isAdminMode = pathname.startsWith("/admin");
  const isTeacherMode = pathname.startsWith("/teacher");

  if (!isAdminMode && !isTeacherMode) {
    return null;
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
        isAdminMode
          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
          : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
      }`}
    >
      {isAdminMode ? (
        <>
          <UserCog className="h-3.5 w-3.5" />
          <span>Mode Admin</span>
        </>
      ) : (
        <>
          <GraduationCap className="h-3.5 w-3.5" />
          <span>Mode Guru</span>
        </>
      )}
    </div>
  );
}
