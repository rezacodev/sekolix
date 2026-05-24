"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { UserCog, GraduationCap, ChevronDown, Loader2, Check } from "lucide-react";
import Cookies from "js-cookie";

export function RoleSwitcher() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [switching, setSwitching] = useState(false);

  // Only show for dual role users
  if (!session?.user?.isDualRole) {
    return null;
  }

  // Determine current mode based on pathname
  const isAdminMode = pathname.startsWith("/admin");
  const isTeacherMode = pathname.startsWith("/teacher");

  const currentMode = isAdminMode ? "admin" : isTeacherMode ? "teacher" : null;

  const handleSwitchMode = (mode: "admin" | "teacher") => {
    if (mode === currentMode) return; // Already in this mode

    setSwitching(true);

    // Save preference to cookie
    Cookies.set("preferred_mode", mode, { expires: 30 });

    // Use window.location for hard redirect (ensures cookie is sent)
    if (mode === "admin") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/teacher";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" disabled={switching}>
          {switching ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">Switching...</span>
            </>
          ) : (
            <>
              {isAdminMode && <UserCog className="h-4 w-4 text-blue-600" />}
              {isTeacherMode && <GraduationCap className="h-4 w-4 text-emerald-600" />}
              <span className="hidden sm:inline">
                {isAdminMode ? "Mode Admin" : isTeacherMode ? "Mode Guru" : "Switch Mode"}
              </span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs text-gray-500">
          Switch Portal
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => handleSwitchMode("admin")}
          disabled={switching || isAdminMode}
          className="cursor-pointer"
        >
          <UserCog className="mr-2 h-4 w-4 text-blue-600" />
          <span>Mode Admin</span>
          {isAdminMode && <Check className="ml-auto h-4 w-4 text-blue-600" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleSwitchMode("teacher")}
          disabled={switching || isTeacherMode}
          className="cursor-pointer"
        >
          <GraduationCap className="mr-2 h-4 w-4 text-emerald-600" />
          <span>Mode Guru</span>
          {isTeacherMode && <Check className="ml-auto h-4 w-4 text-emerald-600" />}
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        <div className="px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400">
          Akun Anda memiliki akses ke kedua portal
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
