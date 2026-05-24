"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BookOpen, Search, Download, Share2, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

interface Material {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string | null;
  fileType: string | null;
  is_shared: boolean;
  isMine: boolean;
  teacher: { id: string; name: string };
  subject: { id: string; name: string } | null;
  created_at: string;
}

export default function MateriKolaborasiPage() {
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showMine, setShowMine] = useState(false);
  const [page, setPage] = useState(1);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);
    if (showMine) params.set("showMine", "true");
    try {
      const res = await fetch(`/api/teacher/komunikasi/kolaborasi/materi?${params}`);
      const data = await res.json();
      setMaterials(data.materials ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [search, showMine, page]);

  useEffect(() => { fetchMaterials(); }, [fetchMaterials]);

  async function handleToggleShare(material: Material) {
    setToggling(material.id);
    try {
      const res = await fetch("/api/teacher/komunikasi/kolaborasi/materi", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialId: material.id, isShared: !material.is_shared }),
      });
      if (res.ok) fetchMaterials();
    } finally {
      setToggling(null);
    }
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Materi Bersama</h1>
          <p className="text-muted-foreground text-sm">{total} materi tersedia</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/teacher/komunikasi/kolaborasi")}>
          Kembali ke Direktori
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari materi..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="showMine"
            checked={showMine}
            onCheckedChange={(v) => { setShowMine(v); setPage(1); }}
          />
          <Label htmlFor="showMine" className="text-sm cursor-pointer">Materi saya saja</Label>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Memuat materi...</div>
      ) : materials.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 gap-2">
            <BookOpen className="w-10 h-10 text-muted-foreground" />
            <p className="text-muted-foreground">Belum ada materi yang dibagikan.</p>
            <p className="text-xs text-muted-foreground">Bagikan materi Anda dari menu Materi Pembelajaran.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((material) => (
            <Card key={material.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium line-clamp-2 flex-1">{material.title}</h3>
                  {material.isMine && (
                    <Badge variant="outline" className="text-xs shrink-0">Milik Saya</Badge>
                  )}
                </div>
                {material.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{material.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mb-3">
                  {material.subject && (
                    <Badge variant="secondary" className="text-xs">{material.subject.name}</Badge>
                  )}
                  {material.fileType && (
                    <Badge variant="outline" className="text-xs uppercase">{material.fileType}</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  oleh {material.teacher.name} · {new Date(material.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                <div className="flex gap-2">
                  {material.fileUrl && (
                    <Button size="sm" variant="outline" className="flex-1" asChild>
                      <a href={material.fileUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="w-3.5 h-3.5 mr-1" /> Buka
                      </a>
                    </Button>
                  )}
                  {material.isMine && (
                    <Button
                      size="sm"
                      variant={material.is_shared ? "default" : "outline"}
                      className="flex-1"
                      disabled={toggling === material.id}
                      onClick={() => handleToggleShare(material)}
                    >
                      <Share2 className="w-3.5 h-3.5 mr-1" />
                      {toggling === material.id ? "..." : material.is_shared ? "Dibagikan" : "Bagikan"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Sebelumnya</Button>
          <span className="text-sm text-muted-foreground flex items-center px-3">Hal {page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Berikutnya</Button>
        </div>
      )}
    </div>
  );
}
