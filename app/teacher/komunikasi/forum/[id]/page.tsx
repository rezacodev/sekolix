"use client";

import { use, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Pin, Lock, Send, Unlock } from "lucide-react";

interface Reply {
  id: string;
  author_id: string;
  author_type: string;
  author_name: string;
  content: string;
  created_at: string;
}

interface Discussion {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_closed: boolean;
  created_at: string;
  rombel: { id: string; name: string; className: string } | null;
  subject: { id: string; name: string } | null;
  replies: Reply[];
}

export default function ForumDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function fetchDiscussion() {
    setLoading(true);
    try {
      const res = await fetch(`/api/teacher/komunikasi/forum/${id}`);
      const data = await res.json();
      setDiscussion(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchDiscussion(); }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [discussion?.replies.length]);

  async function handleToggle(field: "is_pinned" | "is_closed") {
    if (!discussion) return;
    const res = await fetch(`/api/teacher/komunikasi/forum/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: !discussion[field] }),
    });
    if (res.ok) fetchDiscussion();
  }

  async function handleDelete() {
    if (!confirm("Hapus diskusi ini?")) return;
    const res = await fetch(`/api/teacher/komunikasi/forum/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/teacher/komunikasi/forum");
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/teacher/komunikasi/forum/${id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyText }),
      });
      if (res.ok) {
        setReplyText("");
        fetchDiscussion();
      }
    } finally {
      setSending(false);
    }
  }

  if (loading) return <div className="p-6 text-center text-muted-foreground">Memuat diskusi...</div>;
  if (!discussion) return <div className="p-6 text-center text-muted-foreground">Diskusi tidak ditemukan.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/teacher/komunikasi/forum")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl font-bold flex-1 truncate">{discussion.title}</h1>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => handleToggle("is_pinned")}>
            <Pin className="w-4 h-4 mr-1" />
            {discussion.is_pinned ? "Lepas Sematkan" : "Sematkan"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleToggle("is_closed")}>
            {discussion.is_closed ? <Unlock className="w-4 h-4 mr-1" /> : <Lock className="w-4 h-4 mr-1" />}
            {discussion.is_closed ? "Buka" : "Tutup"}
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>Hapus</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex flex-wrap gap-2 mb-3">
            {discussion.rombel && (
              <Badge variant="outline">{discussion.rombel.className} - {discussion.rombel.name}</Badge>
            )}
            {discussion.subject && <Badge variant="secondary">{discussion.subject.name}</Badge>}
            {discussion.is_pinned && <Badge className="bg-amber-100 text-amber-700 border-amber-200">Disematkan</Badge>}
            {discussion.is_closed && <Badge variant="secondary">Ditutup</Badge>}
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            {new Date(discussion.created_at).toLocaleDateString("id-ID", {
              day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
            })}
          </p>
          <p className="whitespace-pre-wrap leading-relaxed">{discussion.content}</p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
          {discussion.replies.length} Balasan
        </h2>
        {discussion.replies.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-6">Belum ada balasan.</p>
        ) : (
          discussion.replies.map((reply) => (
            <div key={reply.id} className={`flex gap-3 ${reply.author_type === "TEACHER" ? "flex-row-reverse" : ""}`}>
              <div className={`rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold shrink-0 ${
                reply.author_type === "TEACHER" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}>
                {reply.author_name.charAt(0).toUpperCase()}
              </div>
              <div className={`max-w-[75%] ${reply.author_type === "TEACHER" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{reply.author_name}</span>
                  <Badge variant="outline" className="text-xs py-0">
                    {reply.author_type === "TEACHER" ? "Guru" : "Siswa"}
                  </Badge>
                </div>
                <div className={`rounded-xl px-4 py-2.5 text-sm ${
                  reply.author_type === "TEACHER"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}>
                  <p className="whitespace-pre-wrap">{reply.content}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(reply.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {!discussion.is_closed ? (
        <form onSubmit={handleReply} className="flex gap-3">
          <Textarea
            placeholder="Tulis balasan..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="resize-none"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(e as unknown as React.FormEvent); }
            }}
          />
          <Button type="submit" disabled={sending || !replyText.trim()} className="shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      ) : (
        <Card className="bg-muted/50">
          <CardContent className="flex items-center gap-2 py-3">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Diskusi telah ditutup. Balasan baru tidak diizinkan.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
