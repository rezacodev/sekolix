"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, Loader2 } from "lucide-react";
import Cookies from "js-cookie";

// Role → redirect destination
function getRedirectPath(userRole: string, staffRole?: string): string {
  const adminRoles = ["SUPERADMIN", "ADMIN", "STAFF"];
  if (adminRoles.includes(userRole)) return "/admin";
  if (userRole === "GURU" || staffRole === "TEACHER") return "/teacher";
  if (userRole === "MURID") return "/student";
  if (userRole === "ORANGTUA") return "/parent";
  return "/";
}

const DEV_CREDENTIALS = [
  {
    label: "Superadmin",
    email: "superadmin@sekolix.com",
    password: "superadmin123",
    note: "Akses penuh termasuk konfigurasi sistem",
    color: "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 dark:bg-purple-950 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900",
  },
  {
    label: "Admin",
    email: "admin@sekolix.com",
    password: "admin123",
    note: "Akses penuh kecuali pengaturan sistem",
    color: "bg-red-50 border-red-200 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900",
  },
  {
    label: "Guru",
    email: "guru@sekolix.com",
    password: "guru123",
    note: "Portal guru: kelas, tugas, absensi, nilai",
    color: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900",
  },
  {
    label: "Staf",
    email: "staff@sekolix.com",
    password: "staff123",
    note: "Akses terbatas pada bagian admin (dikonfigurasi)",
    color: "bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-300 dark:hover:bg-yellow-900",
  },
  {
    label: "Murid",
    email: "murid@sekolix.com",
    password: "murid123",
    note: "Portal siswa (dalam pengembangan)",
    color: "bg-green-50 border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-900",
  },
  {
    label: "Orangtua",
    email: "orangtua@sekolix.com",
    password: "orangtua123",
    note: "Portal orangtua (dalam pengembangan)",
    color: "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-300 dark:hover:bg-orange-900",
  },
  {
    label: "Dual Role",
    email: "dualrole@sekolix.com",
    password: "dualrole123",
    note: "Superadmin + Guru (bisa akses kedua portal)",
    color: "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-900",
  },
];

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const errorParam = searchParams.get("error");
  const urlError = errorParam ? decodeURIComponent(errorParam) : null;

  useEffect(() => {
    const handleRedirectAfterLogin = async () => {
      if (!session?.user) return;

      const userRole = session.user.role;
      const adminRoles = ["SUPERADMIN", "ADMIN", "STAFF"];

      try {
        const res = await fetch("/api/auth/staff-info");
        const data = await res.json();

        const staffRole = data.success ? data.staffRole : undefined;

        // Dual role: admin-level user who also has a teacher staff record
        const isDualRole = adminRoles.includes(userRole) && staffRole === "TEACHER";

        if (isDualRole) {
          const preferredMode = Cookies.get("preferred_mode");
          if (preferredMode === "admin") {
            router.push("/admin");
          } else if (preferredMode === "teacher") {
            router.push("/teacher");
          } else {
            router.push("/select-role");
          }
        } else {
          router.push(getRedirectPath(userRole, staffRole));
        }
      } catch {
        router.push(getRedirectPath(userRole));
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
        password,
      });

      if (res?.error) {
        setError(res.error === "CredentialsSignin" ? "Email atau password salah" : res.error);
        setLoading(false);
        return;
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setLoading(false);
    }
  };

  const handleQuickFill = (cred: { email: string; password: string }) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setError(null);
  };

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
      <div className="w-full max-w-md space-y-4">
        <Card className="shadow-lg">
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
                  onChange={(e) => setEmail(e.target.value)}
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
                  onChange={(e) => setPassword(e.target.value)}
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
          </CardContent>
        </Card>

        {/* Dev credentials — only in development */}
        {process.env.NODE_ENV === "development" && (
          <Card className="shadow-md">
            <CardHeader className="pb-2 pt-4 px-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Akun Demo (Klik untuk auto-fill)
              </p>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="grid grid-cols-1 gap-2">
                {DEV_CREDENTIALS.map((cred) => (
                  <button
                    key={cred.email}
                    type="button"
                    onClick={() => handleQuickFill(cred)}
                    className={`w-full text-left rounded-md border px-3 py-2 text-xs transition-colors ${cred.color}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-semibold">{cred.label}</span>
                        <span className="text-[10px] opacity-75 ml-1.5">{cred.note}</span>
                      </div>
                      <div className="text-right shrink-0 opacity-75 font-mono text-[10px]">
                        {cred.password}
                      </div>
                    </div>
                    <div className="mt-0.5 opacity-70 font-mono">{cred.email}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
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
