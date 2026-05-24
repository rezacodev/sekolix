"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCog, GraduationCap, Loader2, ArrowRight } from "lucide-react";
import Cookies from "js-cookie";

export default function SelectRolePage() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not authenticated
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    
    // Redirect if not dual role user
    if (status === "authenticated" && session?.user && session.user.isDualRole === false) {
      // Redirect based on role
      if (session.user.role === "ADMIN") {
        router.push("/admin");
      } else if (session.user.staffRole === "TEACHER") {
        router.push("/teacher");
      } else {
        router.push("/login");
      }
      return;
    }
  }, [status, session, router]);

  const handleSelectRole = async (role: "admin" | "teacher") => {
    try {
      setLoading(role);
      
      // Save preference to cookie (expires in 30 days)
      Cookies.set("preferred_mode", role, { expires: 30 });

      // Use window.location for hard redirect (ensures cookie is sent with request)
      const targetUrl = role === "admin" ? "/admin" : "/teacher";
      window.location.href = targetUrl;
    } catch (error) {
      console.error("Error in handleSelectRole:", error);
      setLoading(null);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
            Pilih Mode Akses
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Akun Anda memiliki akses sebagai Admin dan Guru. Pilih mode yang ingin Anda gunakan.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Admin Mode */}
          <Card className="relative overflow-hidden hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <UserCog className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl">Mode Admin</CardTitle>
              <CardDescription>
                Akses penuh ke manajemen sistem sekolah
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Kelola data siswa, guru, dan staff</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Konfigurasi sistem dan pengaturan</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Laporan dan analitik lengkap</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Manajemen akademik dan keuangan</span>
                </li>
              </ul>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelectRole("admin");
                }}
                disabled={loading !== null}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
              >
                {loading === "admin" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Membuka...
                  </>
                ) : (
                  <>
                    Masuk sebagai Admin
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Teacher Mode */}
          <Card className="relative overflow-hidden hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <GraduationCap className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl">Mode Guru</CardTitle>
              <CardDescription>
                Fokus pada pengajaran dan pembelajaran
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Kelola kelas dan mata pelajaran</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Materi pembelajaran dan tugas</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Input nilai dan penilaian siswa</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Ujian CBT dan bank soal</span>
                </li>
              </ul>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelectRole("teacher");
                }}
                disabled={loading !== null}
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700"
              >
                {loading === "teacher" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Membuka...
                  </>
                ) : (
                  <>
                    Masuk sebagai Guru
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
          Pilihan Anda akan disimpan untuk login berikutnya. Anda dapat <strong>mengubah mode kapan saja</strong> dari menu pengaturan.
        </p>
      </div>
    </div>
  );
}
