"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  Pin,
  Heart,
  Reply,
  User,
  Clock,
  Search,
  Plus,
} from "lucide-react";

interface ForumReply {
  id: string;
  author: string;
  role: "siswa" | "guru" | "admin";
  content: string;
  timestamp: string;
  likes: number;
  authorImage?: string;
}

interface ForumThread {
  id: string;
  title: string;
  author: string;
  authorRole: "siswa" | "guru";
  content: string;
  timestamp: string;
  isPinned: boolean;
  replyCount: number;
  likes: number;
  replies?: ForumReply[];
  authorImage?: string;
}

export default function ForumPage({ params }: { params: { id: string } }) {
  const rombelId = params.id;
  const [threads, setThreads] = useState<ForumThread[]>([
    {
      id: "1",
      title: "Bagaimana cara menyelesaikan soal limit dengan aturan L'Hopital?",
      author: "Andi Wijaya",
      authorRole: "siswa",
      content:
        "Saya kesulitan memahami aturan L'Hopital. Bisa dijelaskan langkah-langkahnya dengan contoh soal?",
      timestamp: "2026-05-28T10:30:00Z",
      isPinned: false,
      replyCount: 3,
      likes: 5,
      replies: [
        {
          id: "r1",
          author: "Budi Santoso",
          role: "guru",
          content:
            "Aturan L'Hopital digunakan saat kita dapat hasil 0/0 atau ∞/∞. Caranya adalah turunkan pembilang dan penyebut secara terpisah, kemudian hitung limitnya lagi...",
          timestamp: "2026-05-28T11:00:00Z",
          likes: 8,
        },
        {
          id: "r2",
          author: "Siti Nurhaliza",
          role: "siswa",
          content: "Terima kasih pak, sekarang sudah jelas! Ada contoh soal lagi nggak?",
          timestamp: "2026-05-28T14:00:00Z",
          likes: 2,
        },
      ],
    },
    {
      id: "2",
      title: "Jadwal remedial untuk yang belum tuntas",
      author: "Budi Santoso",
      authorRole: "guru",
      content:
        "Bagi siswa yang belum mencapai KKM di UTS, akan diadakan remedial pada hari Sabtu jam 10:00 - 12:00 di Ruang 101.",
      timestamp: "2026-05-27T15:30:00Z",
      isPinned: true,
      replyCount: 2,
      likes: 12,
    },
    {
      id: "3",
      title: "Materi tambahan tentang turunan",
      author: "Eka Kusuma",
      authorRole: "siswa",
      content:
        "Apakah ada resource atau video yang bagus untuk belajar turunan lebih mendalam? Terima kasih.",
      timestamp: "2026-05-26T09:00:00Z",
      isPinned: false,
      replyCount: 1,
      likes: 3,
    },
  ]);

  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newReplyContent, setNewReplyContent] = useState("");
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showNewThreadForm, setShowNewThreadForm] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadContent, setNewThreadContent] = useState("");

  const filteredThreads = threads.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort: pinned first, then by timestamp
  const sortedThreads = [...filteredThreads].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const handlePostThread = () => {
    const newThread: ForumThread = {
      id: Date.now().toString(),
      title: newThreadTitle,
      author: "Kamu",
      authorRole: "siswa",
      content: newThreadContent,
      timestamp: new Date().toISOString(),
      isPinned: false,
      replyCount: 0,
      likes: 0,
    };
    setThreads([newThread, ...threads]);
    setNewThreadTitle("");
    setNewThreadContent("");
    setShowNewThreadForm(false);
  };

  const handlePostReply = () => {
    if (!selectedThread) return;

    const newReply: ForumReply = {
      id: Date.now().toString(),
      author: "Kamu",
      role: "siswa",
      content: newReplyContent,
      timestamp: new Date().toISOString(),
      likes: 0,
    };

    const updatedThreads = threads.map((t) =>
      t.id === selectedThread.id
        ? {
            ...t,
            replyCount: t.replyCount + 1,
            replies: [...(t.replies || []), newReply],
          }
        : t
    );

    setThreads(updatedThreads);
    const updated = updatedThreads.find((t) => t.id === selectedThread.id);
    if (updated) setSelectedThread(updated);
    setNewReplyContent("");
    setShowReplyForm(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Threads List */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Forum Diskusi</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Rombel X-A • Matematika</p>
          </div>
          <Button onClick={() => setShowNewThreadForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Buat Thread
          </Button>
        </div>

        {/* New Thread Form */}
        {showNewThreadForm && (
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
            <CardContent className="pt-4 space-y-3">
              <Input
                placeholder="Judul diskusi..."
                value={newThreadTitle}
                onChange={(e) => setNewThreadTitle(e.target.value)}
              />
              <textarea
                placeholder="Deskripsi pertanyaan atau topik..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"
                value={newThreadContent}
                onChange={(e) => setNewThreadContent(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={handlePostThread} disabled={!newThreadTitle || !newThreadContent}>
                  Posting
                </Button>
                <Button variant="outline" onClick={() => setShowNewThreadForm(false)}>
                  Batal
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Cari diskusi..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Thread Items */}
        <div className="space-y-3">
          {sortedThreads.map((thread) => (
            <Card
              key={thread.id}
              className={`cursor-pointer transition-all ${
                selectedThread?.id === thread.id
                  ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950"
                  : "hover:shadow-md"
              }`}
              onClick={() => setSelectedThread(thread)}
            >
              <CardContent className="pt-4">
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-semibold">
                    {thread.author[0]}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {thread.title}
                          {thread.isPinned && (
                            <Pin className="inline-block w-4 h-4 ml-2 text-yellow-500" />
                          )}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span className="font-medium">{thread.author}</span>
                          {thread.authorRole === "guru" && (
                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs">
                              Guru
                            </span>
                          )}
                          <Clock className="w-3 h-3" />
                          {new Date(thread.timestamp).toLocaleDateString("id-ID")}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                      {thread.content}
                    </p>

                    {/* Stats */}
                    <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {thread.replyCount} Balasan
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {thread.likes} Suka
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Thread Detail */}
      <div className="lg:col-span-1">
        {selectedThread ? (
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">{selectedThread.title}</CardTitle>
              <CardDescription>{selectedThread.author}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              {/* Original Post */}
              <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {new Date(selectedThread.timestamp).toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-sm text-gray-900 dark:text-white">{selectedThread.content}</p>
              </div>

              {/* Replies */}
              {selectedThread.replies && selectedThread.replies.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Balasan:</h4>
                  {selectedThread.replies.map((reply) => (
                    <div key={reply.id} className="pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-xs text-gray-900 dark:text-white">
                          {reply.author}
                        </span>
                        {reply.role === "guru" && (
                          <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                            Guru
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {new Date(reply.timestamp).toLocaleDateString("id-ID", {
                          weekday: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{reply.content}</p>
                      <button className="mt-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {reply.likes} Suka
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Form */}
              {!showReplyForm ? (
                <Button
                  variant="outline"
                  className="w-full gap-2 mt-4"
                  onClick={() => setShowReplyForm(true)}
                >
                  <Reply className="w-4 h-4" />
                  Balas
                </Button>
              ) : (
                <div className="space-y-2 mt-4">
                  <textarea
                    placeholder="Tulis balasan..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"
                    value={newReplyContent}
                    onChange={(e) => setNewReplyContent(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handlePostReply}
                      disabled={!newReplyContent}
                    >
                      Posting
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowReplyForm(false)}
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="sticky top-6">
            <CardContent className="pt-6 text-center text-gray-500">
              <p className="text-sm">Pilih diskusi untuk melihat detail</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
