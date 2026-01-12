"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";

// Loading component
function ThemeLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600">Loading theme...</p>
      </div>
    </div>
  );
}

export default function DynamicThemeRenderer() {
  const { currentTheme, isLoading } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && currentTheme) {
      router.push(`/${currentTheme}`);
    }
  }, [currentTheme, isLoading, router]);

  return <ThemeLoader />;
}
