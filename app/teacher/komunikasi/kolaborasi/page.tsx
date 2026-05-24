"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Search, MessageSquare, BookOpen, Phone, Mail } from "lucide-react";

interface Teacher {
  id: string;
  fullName: string;
  nip: string;
  position: string;
  email: string | null;
  mobile: string | null;
  unread: number;
}

export default function KolaborasiPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    try {
      const res = await fetch(`/api/teacher/komunikasi/kolaborasi?${params}`);
      const data = await res.json();
      setTeachers(data.teachers ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchTeachers(); }, [fetchTeachers]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Kolaborasi Guru</h1>
          <p className="text-muted-foreground text-sm">{total} guru terdaftar</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/teacher/komunikasi/kolaborasi/materi")}>
          <BookOpen className="w-4 h-4 mr-2" /> Materi Bersama
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cari guru berdasarkan nama atau NIP..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Memuat direktori guru...</div>
      ) : teachers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 gap-2">
            <Users className="w-10 h-10 text-muted-foreground" />
            <p className="text-muted-foreground">Tidak ada guru ditemukan.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachers.map((teacher) => (
            <Card key={teacher.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="rounded-full w-10 h-10 bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                    {teacher.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{teacher.fullName}</p>
                    {teacher.position && (
                      <p className="text-xs text-muted-foreground truncate">{teacher.position}</p>
                    )}
                    {teacher.nip && (
                      <p className="text-xs text-muted-foreground">NIP: {teacher.nip}</p>
                    )}
                  </div>
                  {teacher.unread > 0 && (
                    <Badge className="bg-primary text-primary-foreground text-xs shrink-0">{teacher.unread}</Badge>
                  )}
                </div>
                <div className="space-y-1 mb-3">
                  {teacher.email && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{teacher.email}</span>
                    </div>
                  )}
                  {teacher.mobile && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>{teacher.mobile}</span>
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => router.push(`/teacher/komunikasi/pesan/${teacher.id}`)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {teacher.unread > 0 ? `Pesan (${teacher.unread} baru)` : "Kirim Pesan"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
