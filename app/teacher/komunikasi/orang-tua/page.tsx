"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, Phone, Send, MessageSquare } from "lucide-react";

interface Student {
  id: string;
  fullName: string;
  nisn: string;
  mobile: string | null;
  rombelId: string;
  rombelName: string;
  className: string;
  parentInfo: {
    fatherName: string | null;
    motherName: string | null;
    guardianName: string | null;
    primaryContact: string | null;
  };
}

interface FilterRombel {
  id: string;
  name: string;
  className: string;
}

export default function OrangTuaPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [filterRombels, setFilterRombels] = useState<FilterRombel[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [rombelId, setRombelId] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (rombelId !== "all") params.set("rombelId", rombelId);
    try {
      const res = await fetch(`/api/teacher/komunikasi/orang-tua?${params}`);
      const data = await res.json();
      setStudents(data.students ?? []);
      setFilterRombels(data.filterRombels ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [search, rombelId]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(students.map((s) => s.id)));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function handleKirimPesan() {
    const ids = Array.from(selected);
    const params = new URLSearchParams({ studentIds: ids.join(",") });
    router.push(`/teacher/komunikasi/orang-tua/kirim?${params}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Komunikasi Orang Tua</h1>
          <p className="text-muted-foreground text-sm">{total} siswa</p>
        </div>
        {selected.size > 0 && (
          <Button onClick={handleKirimPesan}>
            <Send className="w-4 h-4 mr-2" /> Kirim Pesan ({selected.size})
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari siswa atau nama orang tua..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={rombelId} onValueChange={setRombelId}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Semua Rombel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Rombel</SelectItem>
            {filterRombels.map((r) => (
              <SelectItem key={r.id} value={r.id}>{r.className} - {r.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {students.length > 0 && (
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={selectAll}>Pilih Semua ({students.length})</Button>
          {selected.size > 0 && (
            <Button variant="ghost" size="sm" onClick={clearSelection}>Batalkan Pilihan</Button>
          )}
          {selected.size > 0 && (
            <Badge className="bg-primary/10 text-primary">{selected.size} dipilih</Badge>
          )}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Memuat data...</div>
      ) : students.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 gap-2">
            <Users className="w-10 h-10 text-muted-foreground" />
            <p className="text-muted-foreground">Tidak ada siswa ditemukan.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => (
            <Card
              key={student.id}
              className={`cursor-pointer transition-all ${selected.has(student.id) ? "border-primary ring-1 ring-primary" : "hover:shadow-md"}`}
              onClick={() => toggleSelect(student.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`rounded-full w-9 h-9 flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                    selected.has(student.id) ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}>
                    {student.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{student.fullName}</p>
                    <p className="text-xs text-muted-foreground">{student.className} - {student.rombelName}</p>
                    {student.nisn && <p className="text-xs text-muted-foreground">NISN: {student.nisn}</p>}
                  </div>
                </div>
                <div className="mt-3 space-y-1.5 border-t pt-3">
                  {student.parentInfo.fatherName && (
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="text-xs shrink-0">Ayah</Badge>
                      <span className="truncate">{student.parentInfo.fatherName}</span>
                    </div>
                  )}
                  {student.parentInfo.motherName && (
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="text-xs shrink-0">Ibu</Badge>
                      <span className="truncate">{student.parentInfo.motherName}</span>
                    </div>
                  )}
                  {student.parentInfo.guardianName && !student.parentInfo.fatherName && !student.parentInfo.motherName && (
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="text-xs shrink-0">Wali</Badge>
                      <span className="truncate">{student.parentInfo.guardianName}</span>
                    </div>
                  )}
                  {student.mobile && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{student.mobile}</span>
                    </div>
                  )}
                  {!student.parentInfo.primaryContact && !student.mobile && (
                    <p className="text-xs text-muted-foreground italic">Data orang tua belum tersedia</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selected.size > 0 && (
        <div className="fixed bottom-6 right-6">
          <Button size="lg" onClick={handleKirimPesan} className="shadow-lg">
            <MessageSquare className="w-5 h-5 mr-2" /> Kirim Pesan ke {selected.size} Orang Tua
          </Button>
        </div>
      )}
    </div>
  );
}
