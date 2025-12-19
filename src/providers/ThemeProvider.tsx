"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ThemeConfig } from "@/types";

interface ThemeContextType {
  theme: ThemeConfig | null;
  loading: boolean;
  updateTheme: (theme: ThemeConfig) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch theme configuration from API
    const fetchTheme = async () => {
      try {
        const response = await fetch("/api/admin/website-landing/theme");
        if (response.ok) {
          const data = await response.json();
          setTheme(data);
        }
      } catch (error) {
        console.error("Failed to fetch theme:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTheme();
  }, []);

  const updateTheme = async (newTheme: ThemeConfig) => {
    try {
      const response = await fetch("/api/admin/website-landing/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTheme)
      });
      if (response.ok) {
        const data = await response.json();
        setTheme(data);
      }
    } catch (error) {
      console.error("Failed to update theme:", error);
      throw error;
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, loading, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
