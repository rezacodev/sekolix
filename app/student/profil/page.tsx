"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, MapPin, Calendar, CreditCard, BookOpen, Users } from "lucide-react";

export default function StudentProfilPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profil Saya</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Informasi pribadi dan akademik
        </p>
      </div>

      {/* Profil Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback>{session?.user?.name?.charAt(0) || "S"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {session?.user?.name || "Nama Siswa"}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{session?.user?.email || "email@example.com"}</p>
              <div className="flex gap-4 mt-4">
                <Button>Edit Profil</Button>
                <Button variant="outline">Ubah Password</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Pribadi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <CreditCard className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">NISN</p>
                <p className="font-semibold text-gray-900 dark:text-white">0087654321</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">No. Telepon</p>
                <p className="font-semibold text-gray-900 dark:text-white">082123456789</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tanggal Lahir</p>
                <p className="font-semibold text-gray-900 dark:text-white">5 Januari 2008</p>
              </div>
            </div>
            <div className="flex gap-4">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Alamat</p>
                <p className="font-semibold text-gray-900 dark:text-white">Jl. Merdeka No. 123</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Akademik</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-4">
              <BookOpen className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tingkat</p>
                <p className="font-semibold text-gray-900 dark:text-white">X (Sepuluh)</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Users className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Rombel</p>
                <p className="font-semibold text-gray-900 dark:text-white">X-A</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CreditCard className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tahun Ajaran</p>
                <p className="font-semibold text-gray-900 dark:text-white">2025/2026</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <button className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg flex justify-between items-center">
            <span className="font-medium text-gray-700 dark:text-gray-300">Notifikasi</span>
            <span className="text-gray-500 dark:text-gray-400">→</span>
          </button>
          <button className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg flex justify-between items-center">
            <span className="font-medium text-gray-700 dark:text-gray-300">Privasi</span>
            <span className="text-gray-500 dark:text-gray-400">→</span>
          </button>
          <button className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg flex justify-between items-center text-red-600 dark:text-red-400">
            <span className="font-medium">Logout</span>
            <span>→</span>
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
