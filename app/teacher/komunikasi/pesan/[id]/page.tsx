"use client";

import { use, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send } from "lucide-react";

interface Message {
  id: string;
  sender_id: string;
  is_mine: boolean;
  subject: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface Partner {
  id: string;
  name: string;
  position: string;
}

export default function PesanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: partnerId } = use(params);
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function fetchMessages() {
    try {
      const res = await fetch(`/api/teacher/komunikasi/pesan/${partnerId}`);
      const data = await res.json();
      setMessages(data.messages ?? []);
      setPartner(data.partner ?? null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchMessages(); }, [partnerId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/teacher/komunikasi/pesan/${partnerId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      if (res.ok) {
        setText("");
        fetchMessages();
      }
    } finally {
      setSending(false);
    }
  }

  if (loading) return <div className="p-6 text-center text-muted-foreground">Memuat percakapan...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-background shrink-0">
        <Button variant="ghost" size="icon" onClick={() => router.push("/teacher/komunikasi/pesan")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="rounded-full w-9 h-9 bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
          {partner?.name.charAt(0).toUpperCase() ?? "?"}
        </div>
        <div>
          <p className="font-semibold leading-tight">{partner?.name ?? partnerId}</p>
          {partner?.position && <p className="text-xs text-muted-foreground">{partner.position}</p>}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm mt-12">
            Belum ada pesan. Mulai percakapan di bawah.
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.is_mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.is_mine
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : "bg-muted rounded-tl-sm"
              }`}>
                {msg.subject && (
                  <p className={`text-xs font-semibold mb-1 ${msg.is_mine ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {msg.subject}
                  </p>
                )}
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                <p className={`text-xs mt-1.5 ${msg.is_mine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                  {new Date(msg.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                  {msg.is_mine && (msg.is_read ? " ✓✓" : " ✓")}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-3 p-4 border-t bg-background shrink-0">
        <Textarea
          placeholder="Tulis pesan..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="resize-none"
          rows={2}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e as unknown as React.FormEvent); }
          }}
        />
        <Button type="submit" disabled={sending || !text.trim()} className="shrink-0 self-end">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
