"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { signOut } from "next-auth/react";

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <ShieldAlert className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
            Akses Ditolak
          </CardTitle>
          <CardDescription className="mt-2">
            Anda tidak memiliki izin untuk mengakses halaman ini.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-4 text-sm text-red-700 dark:text-red-300">
            <p className="font-medium mb-2">Kemungkinan penyebab:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Anda tidak memiliki role yang sesuai</li>
              <li>Akun Anda belum dikonfigurasi dengan benar</li>
              <li>Anda mencoba mengakses area yang tidak diizinkan</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Button onClick={handleBack} className="w-full" variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
            <Button onClick={handleLogout} className="w-full" variant="destructive">
              Logout dan Login Ulang
            </Button>
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Jika masalah berlanjut, silakan hubungi administrator sistem.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
