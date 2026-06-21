"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Search, Plus } from "lucide-react";

interface Conversation {
  partnerId: string;
  partnerType: string;
  partnerName: string;
  lastMessage: string;
  lastAt: string;
  unread: number;
}

export default function PesanPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    try {
      const res = await fetch(`/api/teacher/komunikasi/pesan?${params}`);
      const data = await res.json();
      setConversations(data.conversations ?? []);
      setUnreadTotal(data.unreadTotal ?? 0);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  function partnerTypeBadge(type: string) {
    switch (type) {
      case "TEACHER": return "Guru";
      case "STUDENT": return "Siswa";
      case "PARENT": return "Orang Tua";
      case "ADMIN": return "Admin";
      default: return type;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Pesan
            {unreadTotal > 0 && (
              <Badge className="bg-primary text-primary-foreground">{unreadTotal}</Badge>
            )}
          </h1>
          <p className="text-muted-foreground text-sm">{conversations.length} percakapan</p>
        </div>
        <Button onClick={() => router.push("/teacher/komunikasi/kolaborasi")}>
          <Plus className="w-4 h-4 mr-2" /> Pesan Baru
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cari percakapan..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Memuat pesan...</div>
      ) : conversations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
            <MessageSquare className="w-10 h-10 text-muted-foreground" />
            <p className="text-muted-foreground">Belum ada percakapan.</p>
            <Button onClick={() => router.push("/teacher/komunikasi/kolaborasi")}>
              <Plus className="w-4 h-4 mr-2" /> Mulai Percakapan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <Card
              key={`${conv.partnerType}:${conv.partnerId}`}
              className={`cursor-pointer hover:shadow-md transition-shadow ${conv.unread > 0 ? "border-primary/40 bg-primary/5" : ""}`}
              onClick={() => router.push(`/teacher/komunikasi/pesan/${conv.partnerId}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full w-10 h-10 bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                    {conv.partnerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium truncate">{conv.partnerName}</span>
                      <Badge variant="outline" className="text-xs shrink-0">{partnerTypeBadge(conv.partnerType)}</Badge>
                      {conv.unread > 0 && (
                        <Badge className="bg-primary text-primary-foreground text-xs shrink-0">{conv.unread}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                  </div>
                  <p className="text-xs text-muted-foreground shrink-0">
                    {new Date(conv.lastAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
