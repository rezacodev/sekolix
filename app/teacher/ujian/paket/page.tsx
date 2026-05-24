"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Loader2,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  Globe,
  EyeOff,
  ClipboardList,
  Clock,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Subject {
  id: number;
  name: string;
}

interface ExamPackage {
  id: string;
  subject_id: number;
  subjectName: string;
  title: string;
  description: string | null;
  exam_type: string;
  duration: number;
  passing_grade: number;
  randomize: boolean;
  is_published: boolean;
  question_count: number;
  created_at: string;
}

const EXAM_TYPE_LABELS: Record<string, string> = {
  KUIS: "Kuis",
  UTS: "UTS",
  UAS: "UAS",
  ULANGAN_HARIAN: "Ulangan Harian",
  LATIHAN: "Latihan",
};

const EXAM_TYPE_COLORS: Record<string, string> = {
  KUIS: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
  UTS: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  UAS: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
  ULANGAN_HARIAN: "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300",
  LATIHAN: "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300",
};

// ─── Page ───────────────────────────────────────────────────────────────────

export default function PaketUjianPage() {
  const [packages, setPackages] = useState<ExamPackage[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExamPackage | null>(null);

  const pageSize = 12;

  // Fetch subjects
  useEffect(() => {
    fetch("/api/teacher/subjects")
      .then((r) => r.json())
      .then((data) => {
        const list = (data.subjects ?? data).map((s: { id: number; name: string }) => ({
          id: s.id,
          name: s.name,
        }));
        setSubjects(list);
      })
      .catch(() => {});
  }, []);

  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        ...(search ? { search } : {}),
        ...(filterSubject !== "all" ? { subjectId: filterSubject } : {}),
        ...(filterStatus !== "all" ? { status: filterStatus } : {}),
      });
      const res = await fetch(`/api/teacher/ujian/paket?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPackages(data.data);
      setTotalCount(data.totalCount);
    } catch {
      toast.error("Gagal memuat daftar paket ujian");
    } finally {
      setLoading(false);
    }
  }, [page, search, filterSubject, filterStatus]);

  useEffect(() => { fetchPackages(); }, [fetchPackages]);
  useEffect(() => { setPage(0); }, [search, filterSubject, filterStatus]);

  const handlePublish = async (pkg: ExamPackage) => {
    try {
      setActionLoading(pkg.id);
      const res = await fetch(`/api/teacher/ujian/paket/${pkg.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publish: !pkg.is_published }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Gagal mengubah status"); return; }
      toast.success(data.is_published ? "Paket dipublikasikan" : "Paket dikembalikan ke draft");
      fetchPackages();
    } catch {
      toast.error("Gagal mengubah status publikasi");
    } finally {
      setActionLoading(null);
    }
  };

  const handleClone = async (pkg: ExamPackage) => {
    try {
      setActionLoading(pkg.id + "-clone");
      // Fetch full package with questions
      const detailRes = await fetch(`/api/teacher/ujian/paket/${pkg.id}`);
      const detail = await detailRes.json();
      const res = await fetch("/api/teacher/ujian/paket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject_id: detail.subject_id,
          title: `Salinan — ${detail.title}`,
          description: detail.description,
          exam_type: detail.exam_type,
          duration: detail.duration,
          passing_grade: detail.passing_grade,
          randomize: detail.randomize,
          question_ids: detail.questions.map((q: { id: string }) => parseInt(q.id)),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Paket berhasil digandakan");
      fetchPackages();
    } catch {
      toast.error("Gagal menggandakan paket");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (pkg: ExamPackage) => {
    try {
      setActionLoading(pkg.id + "-del");
      const res = await fetch(`/api/teacher/ujian/paket/${pkg.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Paket berhasil dihapus");
      setDeleteTarget(null);
      fetchPackages();
    } catch {
      toast.error("Gagal menghapus paket");
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Paket Ujian</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Buat dan kelola paket ujian dari bank soal untuk siswa
          </p>
        </div>
        <Button asChild>
          <Link href="/teacher/ujian/paket/buat">
            <Plus className="h-4 w-4 mr-1" />
            Buat Paket
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari paket ujian..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterSubject} onValueChange={setFilterSubject}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Semua Mapel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Mapel</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Package grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : packages.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Belum ada paket ujian</p>
            <p className="text-sm mt-1">Klik &quot;Buat Paket&quot; untuk membuat paket ujian pertama Anda.</p>
            <Button asChild className="mt-4">
              <Link href="/teacher/ujian/paket/buat">
                <Plus className="h-4 w-4 mr-1" /> Buat Paket
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="hover:shadow-md transition-shadow flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${EXAM_TYPE_COLORS[pkg.exam_type] ?? "bg-muted text-muted-foreground"}`}>
                        {EXAM_TYPE_LABELS[pkg.exam_type] ?? pkg.exam_type}
                      </span>
                      {pkg.is_published ? (
                        <Badge className="text-xs bg-green-600 gap-1">
                          <CheckCircle2 className="h-2.5 w-2.5" /> Published
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Draft</Badge>
                      )}
                    </div>
                    <CardTitle className="text-sm font-semibold leading-snug line-clamp-2">
                      {pkg.title}
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">{pkg.subjectName}</CardDescription>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                        {actionLoading === pkg.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/teacher/ujian/paket/${pkg.id}/edit`}>
                          <Pencil className="h-4 w-4 mr-2" /> Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleClone(pkg)} disabled={actionLoading === pkg.id + "-clone"}>
                        <Copy className="h-4 w-4 mr-2" /> Gandakan
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handlePublish(pkg)}
                        disabled={actionLoading === pkg.id}
                      >
                        {pkg.is_published ? (
                          <><EyeOff className="h-4 w-4 mr-2" /> Tarik ke Draft</>
                        ) : (
                          <><Globe className="h-4 w-4 mr-2" /> Publish</>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteTarget(pkg)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="flex-1 pt-0">
                {pkg.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{pkg.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    {pkg.question_count} soal
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {pkg.duration} menit
                  </span>
                  <span>KKM: {pkg.passing_grade}</span>
                  {pkg.randomize && <span className="text-blue-600">Acak</span>}
                </div>
              </CardContent>

              <div className="px-6 pb-4">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={`/teacher/ujian/paket/${pkg.id}/edit`}>
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit Paket
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {page * pageSize + 1}–{Math.min((page + 1) * pageSize, totalCount)} dari {totalCount} paket
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 0}>
              Sebelumnya
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1}>
              Berikutnya
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus Paket Ujian"
        description={`Paket "${deleteTarget?.title}" akan dihapus permanen. Lanjutkan?`}
        confirmText="Hapus"
        isDestructive
        isLoading={actionLoading === deleteTarget?.id + "-del"}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
