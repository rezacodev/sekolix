"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ThemeName = "academic-classic" | "modern-vibrant" | "minimalist-clean";

interface ThemeContextType {
  currentTheme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: ThemeName;
}

export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(initialTheme || "academic-classic");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch active theme from database
    const fetchActiveTheme = async () => {
      try {
        const response = await fetch("/api/admin/landing-website/theme/active");
        if (response.ok) {
          const data = await response.json();
          if (data.theme) {
            setCurrentTheme(data.theme as ThemeName);
          }
        }
      } catch (error) {
        console.error("Failed to fetch active theme:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveTheme();
  }, []);

  const setTheme = async (theme: ThemeName) => {
    try {
      // Update theme in database
      const response = await fetch("/api/admin/landing-website/theme/active", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ theme })
      });

      if (response.ok) {
        setCurrentTheme(theme);
      }
    } catch (error) {
      console.error("Failed to update theme:", error);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, isLoading }}>
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
