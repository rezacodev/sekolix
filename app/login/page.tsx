"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, Loader2 } from "lucide-react";
import Cookies from "js-cookie";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get error from URL params directly
  const errorParam = searchParams.get("error");
  const urlError = errorParam ? decodeURIComponent(errorParam) : null;

  useEffect(() => {
    // Auto-redirect if already authenticated
    const handleRedirectAfterLogin = async () => {
      if (!session?.user) return;

      try {
        // Fetch staff data to check for dual role
        const res = await fetch("/api/auth/staff-info");
        const data = await res.json();

        if (!data.success) {
          // No staff record, redirect based on user role
          if (session.user.role === "ADMIN") {
            router.push("/admin");
          } else {
            router.push("/");
          }
          return;
        }

        const { staffRole } = data;
        const userRole = session.user.role;

        // Check if user has dual role (ADMIN user + TEACHER staff)
        const isDualRole = userRole === "ADMIN" && staffRole === "TEACHER";

        if (isDualRole) {
          // Check for preferred mode in cookie
          const preferredMode = Cookies.get("preferred_mode");

          if (preferredMode === "admin") {
            router.push("/admin");
          } else if (preferredMode === "teacher") {
            router.push("/teacher");
          } else {
            // No preference, redirect to role selector
            router.push("/select-role");
          }
        } else {
          // Single role - redirect accordingly
          if (userRole === "ADMIN") {
            router.push("/admin");
          } else if (staffRole === "TEACHER") {
            router.push("/teacher");
          } else {
            router.push("/");
          }
        }
      } catch (error) {
        console.error("Error fetching staff info:", error);
        // Fallback to user role
        if (session.user.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      }
    };

    if (status === "authenticated" && session?.user) {
      handleRedirectAfterLogin();
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password
      });

      if (res?.error) {
        setError(res.error === "CredentialsSignin" 
          ? "Email atau password salah" 
          : res.error);
        setLoading(false);
        return;
      }

      // Success - let useEffect handle redirect
      // Don't set loading to false, let the redirect happen
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setLoading(false);
    }
  };

  const handleQuickFill = (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
  };

  // Show loading while checking auth status
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Memeriksa autentikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-emerald-600 flex items-center justify-center">
              <LogIn className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
            Selamat Datang di Sekolix
          </CardTitle>
          <CardDescription>
            Masukkan email dan password untuk mengakses sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(error || urlError) && (
            <div className="mb-4 rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-300">
              <strong>Error:</strong> {error || urlError}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nama@sekolah.com"
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Masukkan password Anda"
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sedang masuk...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Masuk
                </>
              )}
            </Button>
          </form>

          {/* Development credentials info */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-6 space-y-3">
              <div 
                onClick={() => handleQuickFill("admin@sekolix.com", "admin123")}
                className="rounded-md bg-blue-50 dark:bg-blue-950 p-3 text-xs text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
              >
                <div className="font-medium mb-2">👤 Akun Admin (Klik untuk auto-fill)</div>
                <div className="space-y-1">
                  <div><strong>Email:</strong> admin@sekolix.com</div>
                  <div><strong>Password:</strong> admin123</div>
                </div>
              </div>

              <div 
                onClick={() => handleQuickFill("guru@sekolix.com", "guru123")}
                className="rounded-md bg-emerald-50 dark:bg-emerald-950 p-3 text-xs text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
              >
                <div className="font-medium mb-2">👨‍🏫 Akun Guru (Klik untuk auto-fill)</div>
                <div className="space-y-1">
                  <div><strong>Email:</strong> guru@sekolix.com</div>
                  <div><strong>Password:</strong> guru123</div>
                </div>
              </div>

              <div 
                onClick={() => handleQuickFill("dualrole@sekolix.com", "admin123")}
                className="rounded-md bg-purple-50 dark:bg-purple-950 p-3 text-xs text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
              >
                <div className="font-medium mb-2">🔄 Akun Dual Role (Klik untuk auto-fill)</div>
                <div className="space-y-1">
                  <div><strong>Email:</strong> dualrole@sekolix.com</div>
                  <div><strong>Password:</strong> admin123</div>
                  <div className="text-xs opacity-75 mt-1">Admin + Guru (bisa akses kedua portal)</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
