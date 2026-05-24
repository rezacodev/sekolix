"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Plus, Pin, Lock, Search } from "lucide-react";

interface Discussion {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_closed: boolean;
  replyCount: number;
  created_at: string;
  rombel: { id: string; name: string; className: string } | null;
  subject: { id: string; name: string } | null;
}

interface FilterRombel {
  id: string;
  name: string;
  className: string;
}

export default function ForumPage() {
  const router = useRouter();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [filterRombels, setFilterRombels] = useState<FilterRombel[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [rombelId, setRombelId] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const fetchDiscussions = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (rombelId !== "all") params.set("rombelId", rombelId);
    if (status !== "all") params.set("status", status);
    try {
      const res = await fetch(`/api/teacher/komunikasi/forum?${params}`);
      const data = await res.json();
      setDiscussions(data.discussions ?? []);
      setFilterRombels(data.filterRombels ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [search, rombelId, status, page]);

  useEffect(() => { fetchDiscussions(); }, [fetchDiscussions]);

  const pinned = discussions.filter((d) => d.is_pinned);
  const regular = discussions.filter((d) => !d.is_pinned);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Forum Diskusi</h1>
          <p className="text-muted-foreground text-sm">{total} diskusi</p>
        </div>
        <Button onClick={() => router.push("/teacher/komunikasi/forum/buat")}>
          <Plus className="w-4 h-4 mr-2" /> Buat Diskusi
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari diskusi..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select value={rombelId} onValueChange={(v) => { setRombelId(v); setPage(1); }}>
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
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="open">Terbuka</SelectItem>
            <SelectItem value="closed">Ditutup</SelectItem>
            <SelectItem value="pinned">Disematkan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Memuat diskusi...</div>
      ) : discussions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
            <MessageSquare className="w-10 h-10 text-muted-foreground" />
            <p className="text-muted-foreground">Belum ada diskusi. Buat diskusi baru untuk memulai.</p>
            <Button onClick={() => router.push("/teacher/komunikasi/forum/buat")}>
              <Plus className="w-4 h-4 mr-2" /> Buat Diskusi
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pinned.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Disematkan</p>
              {pinned.map((d) => <DiscussionCard key={d.id} discussion={d} onClick={() => router.push(`/teacher/komunikasi/forum/${d.id}`)} />)}
            </div>
          )}
          {regular.map((d) => <DiscussionCard key={d.id} discussion={d} onClick={() => router.push(`/teacher/komunikasi/forum/${d.id}`)} />)}
        </div>
      )}

      {total > 20 && (
        <div className="flex justify-center gap-2 pt-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Sebelumnya</Button>
          <span className="text-sm text-muted-foreground flex items-center px-3">Hal {page} / {Math.ceil(total / 20)}</span>
          <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage((p) => p + 1)}>Berikutnya</Button>
        </div>
      )}
    </div>
  );
}

function DiscussionCard({ discussion: d, onClick }: { discussion: Discussion; onClick: () => void }) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {d.is_pinned && <Pin className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
              {d.is_closed && <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
              <h3 className="font-medium truncate">{d.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{d.content}</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {d.rombel && (
                <Badge variant="outline" className="text-xs">{d.rombel.className} - {d.rombel.name}</Badge>
              )}
              {d.subject && (
                <Badge variant="secondary" className="text-xs">{d.subject.name}</Badge>
              )}
              {d.is_closed && <Badge variant="secondary" className="text-xs">Ditutup</Badge>}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <MessageSquare className="w-4 h-4" />
              <span>{d.replyCount}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(d.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
